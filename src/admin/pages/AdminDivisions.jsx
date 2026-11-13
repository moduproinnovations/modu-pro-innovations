import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Building2, Layers, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';

const EMPTY_FORM = {
  name: '',
  slug: '',
  code: '05',
  subtitle: '',
  shortDescription: '',
  fullDescription: '',
  heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>New Division</span>
        </button>
      </div>

      {/* Create / Edit Form Modal */}
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
                    {editingId ? 'Edit Division' : 'New Division'}
                  </span>
                  <span className="text-xs font-mono-code text-[#F4EEDF]/50 truncate">
                    {form.slug ? `/${form.slug}` : 'auto-generated slug'}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] truncate">
                  {editingId ? (form.name || 'Edit Division') : 'Create Business Division'}
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
              {/* Card 1: Core Details */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <Building2 className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    1. Division Architecture &amp; Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Division Name <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., ADHESI-PRO Adhesives"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      URL Slug <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="e.g., adhesi-pro"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Code &amp; Order
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        placeholder="01"
                        className="rounded-xl px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all text-center"
                      />
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                        placeholder="1"
                        className="rounded-xl px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="e.g., High-performance industrial bonding solutions"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <CustomDropdown
                      label="Publication Status"
                      size="md"
                      value={form.publicationStatus}
                      onChange={(val) => setForm({ ...form, publicationStatus: val })}
                      options={[
                        { value: 'published', label: 'Published (Live)' },
                        { value: 'draft', label: 'Draft (Internal)' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Imagery */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <ImageIcon className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    2. Division Visual Asset
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-xl bg-[#0A1428] border border-[#3F5E8C]/60 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    {form.heroImage ? (
                      <img
                        src={form.heroImage}
                        alt="Preview"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#F4EEDF]/30" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 font-medium">
                      Hero Image URL / Cloud CDN Link
                    </label>
                    <input
                      type="text"
                      value={form.heroImage}
                      onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                      placeholder="https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/..."
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                    <p className="text-[11px] text-[#F4EEDF]/50">
                      Recommended: High resolution PNG/WEBP with transparent or dark backdrop.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Descriptions & Copy */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <Layers className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    3. Narratives &amp; Categorization
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Short Description <span className="text-[#D9C08B]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      placeholder="A concise 1-2 sentence overview for cards and meta summaries..."
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Full Description <span className="text-[#D9C08B]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.fullDescription}
                      onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                      placeholder="Comprehensive division background and engineering scope..."
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Product Categories (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={form.categoriesText}
                      onChange={(e) => setForm({ ...form, categoriesText: e.target.value })}
                      placeholder="Edge Banding Machines&#10;Panel Saws&#10;CNC Routers"
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Target Applications (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={form.applicationsText}
                      onChange={(e) => setForm({ ...form, applicationsText: e.target.value })}
                      placeholder="Architectural Joinery&#10;Modular Cabinetry&#10;Acoustic Paneling"
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                  </div>
                </div>
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
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] font-semibold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
                >
                  <Save aria-hidden="true" className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Division'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Divisions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 rounded-2xl p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading divisions...
          </div>
        ) : (
          divisions.map((div) => (
            <div
              key={div._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 hover:border-[#D9C08B]/60 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-[#0A1428] border border-[#3F5E8C]/40 rounded-xl p-2 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={div.heroImage}
                    alt={div.name}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-code text-xs text-[#D9C08B] font-medium">
                      DIV / {div.code} • /{div.slug}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] rounded-md">
                      {div.publicationStatus}
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] mt-1">
                    {div.name}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-1.5 line-clamp-2">
                    {div.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs">
                <div className="text-[#F4EEDF]/70 font-mono-code text-[11px]">
                  {div.productCount ?? 0} Products • {div.enquiryCount ?? 0} Enquiries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(div)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] rounded-lg transition-all text-xs cursor-pointer"
                  >
                    <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(div)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-red-400/60 text-[#F4EEDF]/75 hover:text-red-400 rounded-lg transition-all text-xs cursor-pointer"
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
