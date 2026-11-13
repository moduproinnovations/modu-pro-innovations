import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Pages key on `_id` (inherited from the old Mongo API), so every `id` is
// aliased on the way out. Nothing sends `_id` back to Postgres.
function alias(value) {
  if (Array.isArray(value)) return value.map(alias);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key === 'id' ? '_id' : key, alias(val)])
  );
}

function fail(message) {
  const err = new Error(message);
  err.response = { data: { success: false, message } };
  throw err;
}

function describe(error) {
  if (error.code === '23505') return 'A record with this slug or reference already exists.';
  if (error.code === '23503') return 'This record is still referenced by other data.';
  if (error.code === '23502') return 'A required field is missing.';
  return error.message || 'The request could not be completed.';
}

function unwrap({ data, error }) {
  if (error) fail(describe(error));
  return data;
}

async function currentUser() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) fail('Your session has expired. Please sign in again.');
  return {
    _id: user.id,
    name: user.user_metadata?.full_name || user.email,
    email: user.email,
  };
}

async function audit(action, entityType, entityId, summary) {
  const user = await currentUser();
  await supabase.from('audit_logs').insert({
    action,
    entityType,
    entityId: String(entityId ?? ''),
    summary,
    performedBy: user.email || 'Admin',
  });
}

const ASC = { ascending: true };
const DESC = { ascending: false };

// PostgREST `or`/`ilike` syntax is comma and wildcard sensitive.
const term = (value) => String(value || '').trim().replace(/[,()%_\\]/g, ' ').trim();

export const publicApi = {
  getSiteSettings: async () => {
    const row = unwrap(
      await supabase.from('public_site_settings').select('*').limit(1).maybeSingle()
    );
    if (!row) return {};
    return alias({
      _id: row.id,
      ...row.data,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  getDivisions: async () =>
    alias(
      unwrap(
        await supabase
          .from('public_divisions')
          .select('*')
          .order('displayOrder', ASC)
          .order('createdAt', ASC)
      )
    ),

  getDivisionBySlug: async (slug) => {
    const division = unwrap(
      await supabase
        .from('public_divisions')
        .select('*')
        .eq('slug', String(slug).toLowerCase())
        .maybeSingle()
    );
    if (!division) fail('Requested division was not found or is not currently published.');

    const products = unwrap(
      await supabase
        .from('public_products')
        .select('*')
        .eq('division->>slug', division.slug)
        .order('displayOrder', ASC)
        .order('createdAt', ASC)
    );

    return alias({ division, products });
  },

  getProducts: async (params = {}) => {
    const { division, category, featured, search, limit = 50 } = params;
    let query = supabase.from('public_products').select('*');

    if (division) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        division
      );
      query = query.eq(isUuid ? 'division->>id' : 'division->>slug', String(division).toLowerCase());
    }
    if (category && category !== 'all') query = query.eq('category', category);
    if (featured === 'true') query = query.eq('isFeatured', true);
    // shortcut: applications is jsonb and not searched; upgrade if buyers rely on it.
    if (term(search)) {
      const t = term(search);
      query = query.or(`name.ilike.%${t}%,category.ilike.%${t}%,shortDescription.ilike.%${t}%`);
    }

    return alias(
      unwrap(
        await query
          .order('displayOrder', ASC)
          .order('createdAt', DESC)
          .limit(Math.min(Number(limit) || 50, 100))
      )
    );
  },

  getProductBySlug: async (slug) => {
    const product = unwrap(
      await supabase
        .from('public_products')
        .select('*')
        .eq('slug', String(slug).toLowerCase())
        .maybeSingle()
    );
    if (!product) fail('Product not found or currently unpublished.');
    return alias(product);
  },

  getServices: async () =>
    alias(
      unwrap(
        await supabase
          .from('public_services')
          .select('*')
          .order('displayOrder', ASC)
          .order('createdAt', ASC)
      )
    ),

  getIndustries: async () =>
    alias(
      unwrap(
        await supabase
          .from('public_industries')
          .select('*')
          .order('displayOrder', ASC)
          .order('createdAt', ASC)
      )
    ),

  submitEnquiry: async (payload) => {
    const result = unwrap(await supabase.rpc('submit_enquiry', { payload }));
    if (!result?.success) {
      const err = new Error(result?.message || 'Unable to submit your enquiry.');
      err.response = { data: result };
      throw err;
    }
    return result;
  },
};

export const authApi = {
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) fail('Invalid email or password.');
    return { success: true, data: await authApi.getMe() };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { success: true };
  },

  getMe: async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) fail('Not authenticated.');
    if (user.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      fail('This account does not have administrator access.');
    }
    return {
      admin: {
        _id: user.id,
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        role: 'admin',
      },
    };
  },
};

const ENQUIRY_CSV_HEADERS = [
  'Reference',
  'Date (ISO)',
  'Status',
  'Full Name',
  'Company Name',
  'Phone',
  'Email',
  'Division',
  'Service Category',
  'Machine / Product Details',
  'Assigned To',
  'Source Page',
  'Requirement / Message',
];

function enquiryQuery(params = {}) {
  const { status, divisionName, search, startDate, endDate, archived = 'false' } = params;
  let query = supabase.from('enquiries').select('*', { count: 'exact' });

  query = query.eq('isArchived', archived === 'true');
  if (status && status !== 'all') query = query.eq('status', status);
  if (divisionName && divisionName !== 'all') query = query.eq('divisionName', divisionName);
  if (startDate) query = query.gte('createdAt', new Date(startDate).toISOString());
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('createdAt', end.toISOString());
  }
  if (term(search)) {
    const t = term(search);
    query = query.or(
      `reference.ilike.%${t}%,fullName.ilike.%${t}%,companyName.ilike.%${t}%,email.ilike.%${t}%,phone.ilike.%${t}%,message.ilike.%${t}%`
    );
  }
  return query;
}

function escapeCsv(value) {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
}

export const adminApi = {
  getDashboard: async () => {
    const [enquiries, products, draftProducts, totalProducts, divisions, services, industries, activity] =
      await Promise.all([
        supabase
          .from('enquiries')
          .select('reference,fullName,companyName,phone,email,divisionName,status,createdAt')
          .eq('isArchived', false)
          .order('createdAt', DESC),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('publicationStatus', 'published')
          .eq('isArchived', false),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .in('publicationStatus', ['draft', 'pending_review'])
          .eq('isArchived', false),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('isArchived', false),
        supabase
          .from('divisions')
          .select('id', { count: 'exact', head: true })
          .eq('publicationStatus', 'published')
          .eq('isArchived', false),
        supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('publicationStatus', 'published'),
        supabase
          .from('industries')
          .select('id', { count: 'exact', head: true })
          .eq('publicationStatus', 'published'),
        supabase.from('audit_logs').select('*').order('createdAt', DESC).limit(10),
      ]);

    const rows = unwrap(enquiries) || [];
    const byDivision = {};
    const byStatus = { New: 0, 'In Progress': 0, Responded: 0, Closed: 0 };
    for (const row of rows) {
      const key = row.divisionName || 'General / Multi-Division';
      byDivision[key] = (byDivision[key] || 0) + 1;
      if (row.status in byStatus) byStatus[row.status] += 1;
    }

    const count = (res) => res.count || 0;

    return {
      metrics: {
        totalEnquiries: rows.length,
        newEnquiries: byStatus.New,
        inProgressEnquiries: byStatus['In Progress'],
        respondedEnquiries: byStatus.Responded,
        closedEnquiries: byStatus.Closed,
        publishedProducts: count(products),
        draftProducts: count(draftProducts),
        totalProducts: count(totalProducts),
        activeDivisions: count(divisions),
        publishedServices: count(services),
        publishedIndustries: count(industries),
      },
      enquiriesByDivision: Object.entries(byDivision)
        .map(([division, value]) => ({ division, count: value }))
        .sort((a, b) => b.count - a.count),
      enquiriesByStatus: Object.entries(byStatus).map(([status, value]) => ({
        status,
        count: value,
      })),
      recentEnquiries: alias(rows.slice(0, 6)),
      recentActivity: alias(unwrap(activity) || []),
    };
  },

  getDivisions: async () => {
    const [divisions, products, enquiries] = await Promise.all([
      supabase.from('divisions').select('*').order('displayOrder', ASC).order('createdAt', ASC),
      supabase.from('products').select('division').eq('isArchived', false),
      supabase.from('enquiries').select('division').eq('isArchived', false),
    ]);

    const tally = (rows) =>
      (rows || []).reduce((acc, row) => {
        if (row.division) acc[row.division] = (acc[row.division] || 0) + 1;
        return acc;
      }, {});

    const productCounts = tally(unwrap(products));
    const enquiryCounts = tally(unwrap(enquiries));

    return alias(
      (unwrap(divisions) || []).map((row) => ({
        ...row,
        productCount: productCounts[row.id] || 0,
        enquiryCount: enquiryCounts[row.id] || 0,
      }))
    );
  },

  createDivision: async (payload) => {
    const row = unwrap(await supabase.from('divisions').insert(payload).select().single());
    await audit('CREATE_DIVISION', 'Division', row.id, `Created division "${row.name}" (${row.slug})`);
    return { success: true, message: 'Division created successfully.', data: alias(row) };
  },

  updateDivision: async (id, payload) => {
    const row = unwrap(
      await supabase.from('divisions').update(payload).eq('id', id).select().maybeSingle()
    );
    if (!row) fail('Division not found.');
    await audit('UPDATE_DIVISION', 'Division', row.id, `Updated division "${row.name}"`);
    return { success: true, message: 'Division updated successfully.', data: alias(row) };
  },

  deleteDivision: async (id) => {
    const row = unwrap(
      await supabase.from('divisions').select('*').eq('id', id).maybeSingle()
    );
    if (!row) fail('Division not found.');

    const [products, enquiries] = await Promise.all([
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('division', id),
      supabase
        .from('enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('division', id),
    ]);

    const productCount = products.count || 0;
    const enquiryCount = enquiries.count || 0;
    if (productCount > 0 || enquiryCount > 0) {
      fail(
        `Cannot delete division "${row.name}" because it is referenced by ${productCount} product(s) and ${enquiryCount} enquiry record(s). Please archive or unpublish the division instead, or reassign its products first.`
      );
    }

    const deleted = await supabase.from('divisions').delete().eq('id', id);
    if (deleted.error) fail(describe(deleted.error));
    await audit('DELETE_DIVISION', 'Division', id, `Deleted unreferenced division "${row.name}"`);
    return { success: true, message: 'Division deleted successfully.' };
  },

  getProducts: async (params = {}) => {
    const {
      division,
      category,
      publicationStatus,
      featured,
      search,
      page = 1,
      limit = 20,
    } = params;

    let query = supabase
      .from('products')
      .select('*, division:divisions(id,name,slug,code)', { count: 'exact' })
      .eq('isArchived', false);

    if (division && division !== 'all') query = query.eq('division', division);
    if (category && category !== 'all') query = query.eq('category', category);
    if (publicationStatus && publicationStatus !== 'all') {
      query = query.eq('publicationStatus', publicationStatus);
    }
    if (featured === 'true') query = query.eq('isFeatured', true);
    if (term(search)) {
      const t = term(search);
      query = query.or(`name.ilike.%${t}%,category.ilike.%${t}%,shortDescription.ilike.%${t}%`);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const from = (pageNum - 1) * limitNum;

    const res = await query
      .order('displayOrder', ASC)
      .order('createdAt', DESC)
      .range(from, from + limitNum - 1);

    const total = res.count || 0;
    return {
      success: true,
      data: alias(unwrap(res) || []),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  createProduct: async (payload) => {
    if (!payload.division) fail('Please select a division for this product.');
    const row = unwrap(await supabase.from('products').insert(payload).select().single());
    const populated = unwrap(
      await supabase
        .from('products')
        .select('*, division:divisions(id,name,slug,code)')
        .eq('id', row.id)
        .single()
    );
    await audit('CREATE_PRODUCT', 'Product', row.id, `Created product "${row.name}"`);
    return { success: true, message: 'Product created successfully.', data: alias(populated) };
  },

  updateProduct: async (id, payload) => {
    if (!payload.division) fail('Please select a division for this product.');
    const updated = unwrap(
      await supabase.from('products').update(payload).eq('id', id).select().maybeSingle()
    );
    if (!updated) fail('Product not found.');
    const populated = unwrap(
      await supabase
        .from('products')
        .select('*, division:divisions(id,name,slug,code)')
        .eq('id', id)
        .single()
    );
    await audit('UPDATE_PRODUCT', 'Product', id, `Updated product "${updated.name}"`);
    return { success: true, message: 'Product updated successfully.', data: alias(populated) };
  },

  deleteProduct: async (id) => {
    const row = unwrap(await supabase.from('products').select('*').eq('id', id).maybeSingle());
    if (!row) fail('Product not found.');
    const res = await supabase.from('products').delete().eq('id', id);
    if (res.error) fail(describe(res.error));
    await audit('DELETE_PRODUCT', 'Product', id, `Removed product "${row.name}"`);
    return { success: true, message: 'Product removed successfully.' };
  },

  getServices: async () =>
    alias(
      unwrap(
        await supabase
          .from('services')
          .select('*')
          .order('displayOrder', ASC)
          .order('createdAt', ASC)
      )
    ),

  createService: async (payload) => {
    const row = unwrap(await supabase.from('services').insert(payload).select().single());
    await audit('CREATE_SERVICE', 'Service', row.id, `Created service category "${row.name}"`);
    return { success: true, message: 'Service created successfully.', data: alias(row) };
  },

  updateService: async (id, payload) => {
    const row = unwrap(
      await supabase.from('services').update(payload).eq('id', id).select().maybeSingle()
    );
    if (!row) fail('Service not found.');
    await audit('UPDATE_SERVICE', 'Service', id, `Updated service "${row.name}"`);
    return { success: true, message: 'Service updated successfully.', data: alias(row) };
  },

  deleteService: async (id) => {
    const row = unwrap(await supabase.from('services').select('*').eq('id', id).maybeSingle());
    if (!row) fail('Service not found.');
    const res = await supabase.from('services').delete().eq('id', id);
    if (res.error) fail(describe(res.error));
    await audit('DELETE_SERVICE', 'Service', id, `Deleted service "${row.name}"`);
    return { success: true, message: 'Service deleted successfully.' };
  },

  getIndustries: async () =>
    alias(
      unwrap(
        await supabase
          .from('industries')
          .select('*')
          .order('displayOrder', ASC)
          .order('createdAt', ASC)
      )
    ),

  createIndustry: async (payload) => {
    const row = unwrap(await supabase.from('industries').insert(payload).select().single());
    await audit('CREATE_INDUSTRY', 'Industry', row.id, `Created industry "${row.name}"`);
    return { success: true, message: 'Industry created successfully.', data: alias(row) };
  },

  updateIndustry: async (id, payload) => {
    const row = unwrap(
      await supabase.from('industries').update(payload).eq('id', id).select().maybeSingle()
    );
    if (!row) fail('Industry not found.');
    await audit('UPDATE_INDUSTRY', 'Industry', id, `Updated industry "${row.name}"`);
    return { success: true, message: 'Industry updated successfully.', data: alias(row) };
  },

  deleteIndustry: async (id) => {
    const row = unwrap(await supabase.from('industries').select('*').eq('id', id).maybeSingle());
    if (!row) fail('Industry not found.');
    const res = await supabase.from('industries').delete().eq('id', id);
    if (res.error) fail(describe(res.error));
    await audit('DELETE_INDUSTRY', 'Industry', id, `Deleted industry "${row.name}"`);
    return { success: true, message: 'Industry deleted successfully.' };
  },

  getEnquiries: async (params = {}) => {
    const pageNum = Math.max(1, parseInt(params.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 25));
    const from = (pageNum - 1) * limitNum;

    const res = await enquiryQuery(params)
      .order('createdAt', DESC)
      .range(from, from + limitNum - 1);

    const total = res.count || 0;
    return {
      success: true,
      data: alias(unwrap(res) || []),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  getEnquiryById: async (id) => {
    const row = unwrap(
      await supabase.from('enquiries').select('*').eq('id', id).maybeSingle()
    );
    if (!row) fail('Enquiry record not found.');
    return alias(row);
  },

  updateEnquiry: async (id, payload) => {
    const row = unwrap(
      await supabase.from('enquiries').select('*').eq('id', id).maybeSingle()
    );
    if (!row) fail('Enquiry record not found.');

    const patch = {};
    const history = [...(row.statusHistory || [])];

    if (
      payload.status &&
      ['New', 'In Progress', 'Responded', 'Closed'].includes(payload.status) &&
      payload.status !== row.status
    ) {
      const user = await currentUser();
      history.push({
        status: payload.status,
        changedBy: `${user.name} (${user.email})`,
        note: payload.statusNote || `Status changed from ${row.status} to ${payload.status}`,
        changedAt: new Date().toISOString(),
      });
      patch.status = payload.status;
      patch.statusHistory = history;
    }
    if (typeof payload.assignedTo === 'string') patch.assignedTo = payload.assignedTo.trim();
    if (typeof payload.isArchived === 'boolean') patch.isArchived = payload.isArchived;

    const updated = unwrap(
      await supabase.from('enquiries').update(patch).eq('id', id).select().single()
    );
    await audit(
      'UPDATE_ENQUIRY',
      'Enquiry',
      id,
      `Updated enquiry ${updated.reference} (status: ${updated.status}, archived: ${updated.isArchived})`
    );
    return { success: true, message: 'Enquiry updated successfully.', data: alias(updated) };
  },

  addEnquiryNote: async (id, note) => {
    if (!note || !String(note).trim()) fail('Internal note text is required.');

    const row = unwrap(
      await supabase.from('enquiries').select('*').eq('id', id).maybeSingle()
    );
    if (!row) fail('Enquiry record not found.');

    const user = await currentUser();
    const internalNotes = [
      ...(row.internalNotes || []),
      {
        note: String(note).trim(),
        authorName: user.name,
        authorEmail: user.email || '',
        createdAt: new Date().toISOString(),
      },
    ];

    const updated = unwrap(
      await supabase.from('enquiries').update({ internalNotes }).eq('id', id).select().single()
    );
    await audit('ADD_ENQUIRY_NOTE', 'Enquiry', id, `Added internal note to enquiry ${row.reference}`);
    return { success: true, message: 'Internal note added.', data: alias(updated) };
  },

  getExportEnquiriesUrl: () => '#',

  downloadEnquiriesCsv: async (params = {}) => {
    const rows = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const page = unwrap(
        await enquiryQuery(params)
          .order('createdAt', DESC)
          .range(from, from + PAGE - 1)
      ) || [];
      rows.push(...page);
      if (page.length < PAGE) break;
    }

    const lines = rows.map((e) =>
      [
        e.reference,
        e.createdAt ? new Date(e.createdAt).toISOString() : '',
        e.status,
        e.fullName,
        e.companyName,
        e.phone,
        e.email,
        e.divisionName,
        e.serviceCategory,
        e.machineOrProductDetails,
        e.assignedTo,
        e.sourcePage,
        e.message,
      ]
        .map(escapeCsv)
        .join(',')
    );

    await audit(
      'EXPORT_ENQUIRIES_CSV',
      'Enquiry',
      '',
      `Exported ${rows.length} enquiry record(s) to CSV`
    );

    return new Blob([[ENQUIRY_CSV_HEADERS.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
  },

  getMedia: async (params = {}) => {
    let query = supabase.from('media').select('*');
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    return alias(unwrap(await query.order('createdAt', DESC)));
  },

  uploadMedia: async (formData) => {
    const file = formData.get('file');
    if (!file) fail('Please select a valid image file to upload.');

    const title = String(formData.get('title') || file.name).trim();
    const altText = String(formData.get('altText') || title).trim();
    const category = String(formData.get('category') || 'product');
    const user = await currentUser();

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const uploaded = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type || 'image/png', upsert: false });
    if (uploaded.error) fail(uploaded.error.message);

    const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(path);

    const row = unwrap(
      await supabase
        .from('media')
        .insert({
          title,
          altText,
          url: publicUrl.publicUrl,
          publicId: path,
          storageProvider: 'supabase',
          mimeType: file.type || 'image/png',
          sizeBytes: file.size || 0,
          category,
          uploadedBy: user.email || 'Administrator',
        })
        .select()
        .single()
    );

    await audit('UPLOAD_MEDIA', 'Media', row.id, `Uploaded media asset "${row.title}"`);
    return { success: true, message: 'Media asset uploaded successfully.', data: alias(row) };
  },

  uploadProductImage: async (file) => {
    if (!file) fail('Please select a valid image file to upload.');
    const user = await currentUser();
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const uploaded = await supabase.storage
      .from('product')
      .upload(path, file, { contentType: file.type || 'image/png', upsert: false });
    if (uploaded.error) fail(uploaded.error.message);
    const { data: publicUrl } = supabase.storage.from('product').getPublicUrl(path);
    await audit('UPLOAD_PRODUCT_IMAGE', 'Product', null, `Uploaded product image "${file.name}"`);
    return { success: true, message: 'Image uploaded.', url: publicUrl.publicUrl };
  },

  deleteMedia: async (id) => {
    const row = unwrap(await supabase.from('media').select('*').eq('id', id).maybeSingle());
    if (!row) fail('Media asset not found.');

    if (row.publicId) {
      await supabase.storage.from('media').remove([row.publicId]);
    }
    const res = await supabase.from('media').delete().eq('id', id);
    if (res.error) fail(describe(res.error));

    await audit('DELETE_MEDIA', 'Media', id, `Removed media asset "${row.title}"`);
    return { success: true, message: 'Media asset removed.' };
  },

  getSiteSettings: async () => {
    const row = unwrap(
      await supabase.from('site_settings').select('*').limit(1).maybeSingle()
    );
    if (!row) return {};
    return alias({
      _id: row.id,
      ...row.data,
      notification: row.notification,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  updateSiteSettings: async (payload) => {
    const { notification, _id, createdAt, updatedAt, ...data } = payload;
    const values = { data, notification: notification || {} };

    const existing = unwrap(
      await supabase.from('site_settings').select('id').limit(1).maybeSingle()
    );

    const row = unwrap(
      existing
        ? await supabase
            .from('site_settings')
            .update(values)
            .eq('id', existing.id)
            .select()
            .single()
        : await supabase.from('site_settings').insert(values).select().single()
    );

    await audit('UPDATE_SITE_SETTINGS', 'SiteSettings', row.id, 'Updated global site settings');
    return {
      success: true,
      message: 'Site settings saved successfully.',
      data: alias({
        _id: row.id,
        ...row.data,
        notification: row.notification,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    };
  },
};

export default supabase;
