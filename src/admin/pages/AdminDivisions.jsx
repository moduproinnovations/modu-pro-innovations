import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

const EMPTY_FORM = {
  name: '',
  slug: '',
  code: '05',
  subtitle: '',
  shortDescription: '',
  fullDescription: '',
  heroImage: '/assets/products/panel-processing/edge-banding-machine.png',
  categoriesText: '',
  applicationsText: '',
  serviceHighlightsText: '',
  displayOrder: 5,
  publicationStatus: 'published',
};

export default function AdminDivisions() {
  const { refreshSiteData } = useSite();
  const { addToast } = useToast();

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDivisions();
      setDivisions(data || []);
    } catch (_) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDivisions();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, displayOrder: divisions.length + 1 });
    setShowForm(true);
  };

  const startEdit = (div) => {
    setEditingId(div._id);
    setForm({
      name: div.name || '',
      slug: div.slug || '',
      code: div.code || '01',
      subtitle: div.subtitle || '',
      shortDescription: div.shortDescription || '',
      fullDescription: div.fullDescription || '',
      heroImage: div.heroImage || '',
      categoriesText: (div.categories || []).join('\n'),
      applicationsText: (div.applications || []).join('\n'),
      serviceHighlightsText: (div.serviceHighlights || []).join('\n'),
      displayOrder: div.displayOrder ?? 1,
      publicationStatus: div.publicationStatus || 'published',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      code: form.code.trim(),
      subtitle: form.subtitle.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      heroImage: form.heroImage.trim(),
      categories: form.categoriesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      applications: form.applicationsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      serviceHighlights: form.serviceHighlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      displayOrder: Number(form.displayOrder) || 1,
      publicationStatus: form.publicationStatus,
    };

    try {
      if (editingId) {
        await adminApi.updateDivision(editingId, payload);
        addToast({ type: 'success', title: 'Division Updated', message: payload.name });
      } else {
        await adminApi.createDivision(payload);
        addToast({ type: 'success', title: 'Division Created', message: payload.name });
      }
      setShowForm(false);
      setEditingId(null);
      await loadDivisions();
      await refreshSiteData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || 'Unable to save division.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (div) => {
    const confirmed = window.confirm(
      `Attempt to delete division "${div.name}"? Note: Divisions with linked products or enquiries are protected from deletion.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteDivision(div._id);
      addToast({ type: 'info', title: 'Division Deleted', message: div.name });
      await loadDivisions();
      await refreshSiteData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Restricted',
        message:
          err.response?.data?.message ||
          'Cannot delete a division that still contains products or enquiries.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Manage Divisions | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Division Architecture
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Business Divisions ({divisions.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>New Division</span>
        </button>
      </div>

      {/* Create / Edit Form Panel */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#16294D] border border-[#D9C08B]/50 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#3F5E8C]/40">
            <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              {editingId ? 'Edit Business Division' : 'Create Business Division'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 text-[#F4EEDF]/70 hover:text-[#D9C08B]"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Division Name *
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
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g., adhesi-pro"
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Code &amp; Order
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="01"
                  className="px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
                />
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  className="px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Hero Image URL
              </label>
              <input
                type="text"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Full Description *
              </label>
              <textarea
                rows={2}
                required
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Categories (One per line)
              </label>
              <textarea
                rows={4}
                value={form.categoriesText}
                onChange={(e) => setForm({ ...form, categoriesText: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Applications (One per line)
              </label>
              <textarea
                rows={4}
                value={form.applicationsText}
                onChange={(e) => setForm({ ...form, applicationsText: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>
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
              <span>{saving ? 'Saving...' : 'Save Division'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Divisions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading divisions...
          </div>
        ) : (
          divisions.map((div) => (
            <div
              key={div._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-[#0A1428] border border-[#3F5E8C]/40 p-2 shrink-0 flex items-center justify-center">
                  <img
                    src={div.heroImage}
                    alt={div.name}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-code text-xs text-[#D9C08B]">
                      DIV / {div.code} • /{div.slug}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                      {div.publicationStatus}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] mt-1">
                    {div.name}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-1.5 line-clamp-2">
                    {div.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs">
                <div className="text-[#F4EEDF]/70 font-mono-code">
                  {div.productCount ?? 0} Products • {div.enquiryCount ?? 0} Enquiries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(div)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] cursor-pointer"
                  >
                    <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(div)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-[#D9C08B] text-[#F4EEDF]/75 hover:text-[#D9C08B] cursor-pointer"
                  >
                    <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
