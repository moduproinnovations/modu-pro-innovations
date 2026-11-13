import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit3, Trash2, Save, X, Search, Star, Upload, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  division: '',
  category: '',
  shortDescription: '',
  fullDescription: '',
  imageUrl: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-wr3-drum.png',
  highlightsText: '',
  applicationsText: '',
  specifications: [],
  isFeatured: false,
  publicationStatus: 'published',
  displayOrder: 1,
};

export default function AdminProducts() {
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, divRes, mediaRes] = await Promise.all([
        adminApi.getProducts({
          search: search.trim(),
          division: divisionFilter,
          publicationStatus: statusFilter,
          limit: 50,
        }),
        adminApi.getDivisions(),
        adminApi.getMedia(),
      ]);
      setProducts(prodRes.data || []);
      setDivisions(divRes || []);
      setMediaList(mediaRes || []);
    } catch (_) {
      // handled
    } finally {
      setLoading(false);
    }
  }, [search, divisionFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_PRODUCT,
      division: divisions[0]?._id || '',
      category: divisions[0]?.categories?.[0] || 'Industrial Solution',
    });
    setShowForm(true);
  };

  const startEdit = (prod) => {
    setEditingId(prod._id);
    setForm({
      name: prod.name || '',
      slug: prod.slug || '',
      division: prod.division?._id || prod.division || '',
      category: prod.category || '',
      shortDescription: prod.shortDescription || '',
      fullDescription: prod.fullDescription || '',
      imageUrl: prod.images?.[0]?.url || '',
      highlightsText: (prod.highlights || []).join('\n'),
      applicationsText: (prod.applications || []).join('\n'),
      specifications: Array.isArray(prod.specifications) ? [...prod.specifications] : [],
      isFeatured: Boolean(prod.isFeatured),
      publicationStatus: prod.publicationStatus || 'published',
      displayOrder: prod.displayOrder ?? 1,
    });
    setShowForm(true);
  };

  const addSpecRow = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { label: '', value: '', isVerified: false },
      ],
    }));
  };

  const updateSpecRow = (idx, field, val) => {
    setForm((prev) => {
      const next = [...prev.specifications];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, specifications: next };
    });
  };

  const removeSpecRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== idx),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const selectedDivision = divisions.find((d) => d._id === form.division);
      const folder = selectedDivision?.slug || 'general';
      const res = await adminApi.uploadProductImage(file, folder);
      if (res?.url) {
        setForm((f) => ({ ...f, imageUrl: res.url }));
        addToast({
          type: 'success',
          title: 'Image Uploaded',
          message: 'Product image uploaded to Cloud Storage successfully.',
        });
      } else {
        throw new Error(res?.message || 'Upload failed.');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err?.message || 'Unable to upload image.',
      });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug:
        form.slug.trim() ||
        form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      division: form.division,
      category: form.category.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      images: form.imageUrl.trim()
        ? [{ url: form.imageUrl.trim(), alt: form.name.trim(), isPrimary: true }]
        : [],
      highlights: form.highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      applications: form.applicationsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      specifications: form.specifications.filter(
        (s) => s.label && s.label.trim() && s.value && s.value.trim()
      ),
      isFeatured: Boolean(form.isFeatured),
      publicationStatus: form.publicationStatus,
      displayOrder: Number(form.displayOrder) || 1,
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        addToast({ type: 'success', title: 'Product Updated', message: payload.name });
      } else {
        await adminApi.createProduct(payload);
        addToast({ type: 'success', title: 'Product Created', message: payload.name });
      }
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Error',
        message: err.response?.data?.message || 'Unable to save product.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prod) => {
    if (!window.confirm(`Delete product "${prod.name}"?`)) return;
    try {
      await adminApi.deleteProduct(prod._id);
      addToast({ type: 'info', title: 'Product Removed', message: prod.name });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Unable to delete product.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Manage Products | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Product &amp; Machinery Catalog
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Products ({products.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-md">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="w-4 h-4 text-[#D9C08B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-lg text-xs text-[#F4EEDF] outline-none"
          />
        </div>

        <CustomDropdown
          size="sm"
          value={divisionFilter}
          onChange={(val) => setDivisionFilter(val)}
          options={[
            { value: 'all', label: 'All Divisions' },
            ...divisions.map((d) => ({
              value: d._id,
              label: d.name,
              badge: d.code,
            })),
          ]}
          placeholder="Filter division..."
        />

        <CustomDropdown
          size="sm"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'pending_review', label: 'Pending Client Confirmation' },
          ]}
          placeholder="Filter status..."
        />
      </div>

      {/* Product Create/Edit Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#0A1428]/80 backdrop-blur-md overflow-y-auto p-3 sm:p-6 lg:p-8"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#16294D] border border-[#D9C08B]/40 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-5xl my-4 sm:my-8 overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-8 py-5 border-b border-[#3F5E8C]/40 bg-[#0A1428]/60 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase tracking-wider bg-[#D9C08B]/15 text-[#D9C08B] border border-[#D9C08B]/30">
                    {editingId ? 'Edit Product' : 'New Product'}
                  </span>
                  <span className="text-xs font-mono-code text-[#F4EEDF]/50 truncate max-w-xs sm:max-w-md">
                    {form.slug ? `/${form.slug}` : 'auto-generated slug'}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] truncate">
                  {editingId ? (form.name || 'Edit Product') : 'Add New Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl bg-[#0A1428] border border-[#3F5E8C]/50 text-[#F4EEDF]/70 hover:text-[#D9C08B] hover:border-[#D9C08B] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
              {/* Card 1: Basic Information & Taxonomy */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    1. General Information &amp; Taxonomy
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Product Name <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={(e) => {
                        if (!form.slug.trim() && e.target.value.trim()) {
                          const s = e.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                          setForm((f) => ({ ...f, slug: s }));
                        }
                      }}
                      placeholder="e.g., Lockpro WR 3 (D3 Water-Resistant Adhhesive)"
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] focus:ring-1 focus:ring-[#D9C08B]/30 rounded-xl text-sm text-[#F4EEDF] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="auto-generated-slug"
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] focus:ring-1 focus:ring-[#D9C08B]/30 rounded-xl text-xs text-[#F4EEDF] font-mono-code outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Division *"
                      size="sm"
                      value={form.division}
                      onChange={(val) => setForm({ ...form, division: val })}
                      options={divisions.map((d) => ({
                        value: d._id,
                        label: d.name,
                        badge: d.code,
                      }))}
                      placeholder="Select Division"
                      searchable
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Category <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., D3 and Commercial D3 Adhhesives"
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] focus:ring-1 focus:ring-[#D9C08B]/30 rounded-xl text-sm text-[#F4EEDF] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Publication Status"
                      size="sm"
                      value={form.publicationStatus}
                      onChange={(val) => setForm({ ...form, publicationStatus: val })}
                      options={[
                        { value: 'published', label: 'Published (Live on Website)' },
                        { value: 'draft', label: 'Draft (Hidden from Public)' },
                        { value: 'pending_review', label: 'Pending Client Confirmation' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-[#0A1428] peer-focus:outline-none border border-[#3F5E8C]/60 peer-checked:border-[#D9C08B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D9C08B] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D9C08B]/20"></div>
                      <span className="ml-3 text-xs uppercase tracking-wider text-[#F4EEDF] font-medium inline-flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${form.isFeatured ? 'fill-[#D9C08B] text-[#D9C08B]' : 'text-[#F4EEDF]/40'}`} />
                        Feature on Homepage
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Product Imagery & Cloud Storage Asset */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                      2. Product Imagery &amp; Media Asset
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-code text-[#F4EEDF]/60">
                    Uploaded directly to Supabase Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Preview Pedestal */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#0A1428] border-2 border-dashed border-[#D9C08B]/35 flex items-center justify-center p-3 overflow-hidden shadow-inner group">
                      {form.imageUrl ? (
                        <>
                          <img
                            src={form.imageUrl}
                            alt="Product preview"
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0A1428]/90 text-[#F4EEDF]/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2 text-[#F4EEDF]/40 space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-[#3F5E8C]" />
                          <p className="text-[10px] uppercase font-mono-code">No Image Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Upload controls */}
                  <div className="md:col-span-8 space-y-3">
                    <label className="block p-4 sm:p-5 rounded-xl border border-[#D9C08B]/30 hover:border-[#D9C08B]/70 bg-[#0A1428]/60 text-center cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2.5 rounded-full bg-[#16294D] border border-[#D9C08B]/40 text-[#D9C08B] group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#F4EEDF]">
                            {uploadingImage ? 'Uploading Image to Supabase...' : 'Click to Upload Product Image'}
                          </p>
                          <p className="text-[11px] text-[#F4EEDF]/50 mt-0.5">
                            Supports PNG, WEBP, JPG or SVG (Transparent background recommended)
                          </p>
                        </div>
                      </div>
                    </label>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#F4EEDF]/70 mb-1">
                        Or enter direct Image URL
                      </label>
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-lg text-xs text-[#F4EEDF] font-mono-code outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Narrative & Copy */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    3. Narrative &amp; Application Copy
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Short Description <span className="text-[#D9C08B]">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      placeholder="One-to-two sentence overview of the product for listings and preview cards..."
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] focus:ring-1 focus:ring-[#D9C08B]/30 rounded-xl text-sm text-[#F4EEDF] outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Full Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.fullDescription}
                      onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                      placeholder="Detailed manufacturing overview, formulation details, machine capabilities..."
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] focus:ring-1 focus:ring-[#D9C08B]/30 rounded-xl text-sm text-[#F4EEDF] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Highlights (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={form.highlightsText}
                      onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                      placeholder="High initial tack&#10;D3 water resistance per DIN EN 204&#10;Heat resistant up to 100°C"
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-xl text-xs text-[#F4EEDF] outline-none transition-colors font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1.5 font-medium">
                      Applications (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={form.applicationsText}
                      onChange={(e) => setForm({ ...form, applicationsText: e.target.value })}
                      placeholder="Modular kitchen shutter bonding&#10;Cold press lamination&#10;Solid wood finger jointing"
                      className="w-full px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-xl text-xs text-[#F4EEDF] outline-none transition-colors font-mono-code"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Technical Specifications */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                      4. Technical Specifications
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/50 hover:border-[#D9C08B] text-xs text-[#D9C08B] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Specification Row</span>
                  </button>
                </div>

                {form.specifications.length === 0 ? (
                  <p className="text-xs text-[#F4EEDF]/50 text-center py-4">
                    No technical specifications added yet. Click &quot;Add Specification Row&quot; above to add parameters like viscosity, blade kerf, press dimensions, etc.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {form.specifications.map((spec, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-[#0A1428] p-2.5 rounded-lg border border-[#3F5E8C]/30">
                        <input
                          type="text"
                          placeholder="Label (e.g., Packaging, Viscosity, RPM)"
                          value={spec.label}
                          onChange={(e) => updateSpecRow(idx, 'label', e.target.value)}
                          className="sm:col-span-5 px-3 py-1.5 bg-[#16294D] border border-[#3F5E8C]/50 rounded text-xs text-[#F4EEDF] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., 50kg Drum, 12,000 RPM)"
                          value={spec.value}
                          onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                          className="sm:col-span-4 px-3 py-1.5 bg-[#16294D] border border-[#3F5E8C]/50 rounded text-xs text-[#F4EEDF] outline-none"
                        />
                        <label className="sm:col-span-2 flex items-center gap-2 text-xs text-[#F4EEDF] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(spec.isVerified)}
                            onChange={(e) => updateSpecRow(idx, 'isVerified', e.target.checked)}
                            className="w-4 h-4 accent-[#D9C08B] rounded"
                          />
                          <span className="text-[11px] uppercase tracking-wider">Verified</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSpecRow(idx)}
                          className="sm:col-span-1 p-1 text-[#F4EEDF]/60 hover:text-red-400 text-center transition-colors"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="sticky bottom-0 px-6 sm:px-8 py-4 bg-[#16294D] border-t border-[#3F5E8C]/40 flex items-center justify-between gap-3 shadow-2xl">
              <span className="hidden sm:inline text-xs text-[#F4EEDF]/50">
                Fields marked with <span className="text-[#D9C08B]">*</span> are required.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 rounded-xl text-xs uppercase tracking-wider text-[#F4EEDF] hover:border-[#D9C08B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] font-semibold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
                >
                  <Save aria-hidden="true" className="w-4 h-4" />
                  <span>{saving ? 'Saving Product...' : 'Save Product'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#3F5E8C]/40 bg-[#0A1428]/60 text-xs font-mono-code uppercase text-[#D9C08B]">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Division &amp; Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F5E8C]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#F4EEDF]/70">
                    Loading products...
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-[#0A1428]/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0A1428] border border-[#3F5E8C]/40 rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            prod.images?.[0]?.url ||
                            'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png'
                          }
                          alt={prod.name}
                          className="max-h-10 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#F4EEDF]">{prod.name}</p>
                        <p className="text-xs text-[#F4EEDF]/60 font-mono-code">/{prod.slug}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs text-[#D9C08B] font-medium">{prod.division?.name}</p>
                      <p className="text-xs text-[#F4EEDF]/75">{prod.category}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] rounded-md">
                        {prod.publicationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {prod.isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#D9C08B]/15 text-[#D9C08B] border border-[#D9C08B]/30 font-medium">
                          <Star aria-hidden="true" className="w-3 h-3 fill-[#D9C08B]" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-[#F4EEDF]/45">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(prod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-xs text-[#D9C08B] rounded-lg transition-all cursor-pointer"
                        >
                          <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-red-400/60 text-xs text-[#F4EEDF]/75 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
