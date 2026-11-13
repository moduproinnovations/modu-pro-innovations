import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit3, Trash2, Save, X, Search, Star } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  division: '',
  category: '',
  shortDescription: '',
  fullDescription: '',
  imageUrl: '/assets/products/adhesi-pro/lockpro-wr3-drum.png',
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            className="w-full pl-10 pr-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
        </div>

        <select
          aria-label="Filter by division"
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
        >
          <option value="all">All Divisions</option>
          {divisions.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by publication status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Client Confirmation</option>
        </select>
      </div>

      {/* Product Create/Edit Modal Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#16294D] border border-[#D9C08B]/50 p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#3F5E8C]/40">
            <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 text-[#F4EEDF]/70 hover:text-[#D9C08B]"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Division *
              </label>
              <select
                required
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., D3 and Commercial D3 Adhesives"
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Publication Status
              </label>
              <select
                value={form.publicationStatus}
                onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              >
                <option value="published">Published (Live on Website)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="pending_review">Pending Client Confirmation</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                id="prod-featured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 min-h-0 accent-[#D9C08B]"
              />
              <label htmlFor="prod-featured" className="text-xs uppercase tracking-wider text-[#F4EEDF]">
                Feature on Homepage
              </label>
            </div>

            {/* Image URL + Quick Media Library Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Primary Image URL
              </label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Or Pick From Media Library
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setForm({ ...form, imageUrl: e.target.value });
                }}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              >
                <option value="">Select existing asset...</option>
                {mediaList.map((m) => (
                  <option key={m._id} value={m.url}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Short Description *
              </label>
              <textarea
                rows={2}
                required
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Full Description
              </label>
              <textarea
                rows={3}
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Highlights (One per line, optional)
              </label>
              <textarea
                rows={3}
                value={form.highlightsText}
                onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Applications (One per line, optional)
              </label>
              <textarea
                rows={3}
                value={form.applicationsText}
                onChange={(e) => setForm({ ...form, applicationsText: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>
          </div>

          {/* Optional Technical Specifications with Client Verification Toggle */}
          <div className="pt-4 border-t border-[#3F5E8C]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                  Optional Technical Specifications
                </h3>
                <p className="text-[11px] text-[#F4EEDF]/65">
                  Only specifications marked &ldquo;Verified&rdquo; are displayed on the public
                  website.
                </p>
              </div>
              <button
                type="button"
                onClick={addSpecRow}
                className="px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/50 text-xs text-[#D9C08B]"
              >
                + Add Specification Row
              </button>
            </div>

            {form.specifications.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Specification Label (e.g., Packaging)"
                  value={spec.label}
                  onChange={(e) => updateSpecRow(idx, 'label', e.target.value)}
                  className="sm:col-span-4 px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Industrial Drum)"
                  value={spec.value}
                  onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                  className="sm:col-span-5 px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                />
                <label className="sm:col-span-2 flex items-center gap-2 text-xs text-[#F4EEDF]">
                  <input
                    type="checkbox"
                    checked={Boolean(spec.isVerified)}
                    onChange={(e) => updateSpecRow(idx, 'isVerified', e.target.checked)}
                    className="w-4 h-4 min-h-0 accent-[#D9C08B]"
                  />
                  <span>Verified</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeSpecRow(idx)}
                  className="sm:col-span-1 text-xs text-[#D9C08B] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#3F5E8C]/40">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs uppercase tracking-wider text-[#F4EEDF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Save aria-hidden="true" className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#3F5E8C]/40 bg-[#0A1428]/60 text-xs font-mono-code uppercase text-[#D9C08B]">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Division &amp; Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Actions</th>
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
                  <tr key={prod._id} className="hover:bg-[#0A1428]/40">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0A1428] border border-[#3F5E8C]/40 p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={
                            prod.images?.[0]?.url ||
                            '/assets/products/panel-processing/edge-banding-machine.png'
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
                      <p className="text-xs text-[#D9C08B]">{prod.division?.name}</p>
                      <p className="text-xs text-[#F4EEDF]/75">{prod.category}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                        {prod.publicationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {prod.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#D9C08B]">
                          <Star aria-hidden="true" className="w-3.5 h-3.5 fill-[#D9C08B]" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-[#F4EEDF]/45">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(prod)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-xs text-[#D9C08B] cursor-pointer"
                        >
                          <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-[#D9C08B] text-xs text-[#F4EEDF]/75 hover:text-[#D9C08B] cursor-pointer"
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
