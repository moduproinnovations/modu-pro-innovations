import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Factory, Layers, Image as ImageIcon, Check } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';

const EMPTY_INDUSTRY = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
  keyApplicationsText: '',
  relatedDivisions: [],
  publicationStatus: 'published',
  displayOrder: 1,
};

export default function AdminIndustries() {
  const { addToast } = useToast();
  const [industries, setIndustries] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_INDUSTRY);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [indData, divData] = await Promise.all([
        adminApi.getIndustries(),
        adminApi.getDivisions(),
      ]);
      setIndustries(indData || []);
      setDivisions(divData || []);
    } catch (_) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_INDUSTRY,
      displayOrder: industries.length + 1,
      relatedDivisions: divisions.map((d) => d._id),
    });
    setShowForm(true);
  };

  const startEdit = (ind) => {
    setEditingId(ind._id);
    setForm({
      name: ind.name || '',
      slug: ind.slug || '',
      shortDescription: ind.shortDescription || '',
      description: ind.description || '',
      image: ind.image || '',
      keyApplicationsText: (ind.keyApplications || []).join('\n'),
      relatedDivisions: (ind.relatedDivisions || []).map((d) => d._id || d),
      publicationStatus: ind.publicationStatus || 'published',
      displayOrder: ind.displayOrder ?? 1,
    });
    setShowForm(true);
  };

  const toggleDivisionRef = (divId) => {
    setForm((prev) => {
      const exists = prev.relatedDivisions.includes(divId);
      return {
        ...prev,
        relatedDivisions: exists
          ? prev.relatedDivisions.filter((id) => id !== divId)
          : [...prev.relatedDivisions, divId],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      keyApplications: form.keyApplicationsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      relatedDivisions: form.relatedDivisions,
      publicationStatus: form.publicationStatus,
      displayOrder: Number(form.displayOrder) || 1,
    };

    try {
      if (editingId) {
        await adminApi.updateIndustry(editingId, payload);
        addToast({ type: 'success', title: 'Industry Updated', message: payload.name });
      } else {
        await adminApi.createIndustry(payload);
        addToast({ type: 'success', title: 'Industry Created', message: payload.name });
      }
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || 'Unable to save industry.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ind) => {
    if (!window.confirm(`Delete industry "${ind.name}"?`)) return;
    try {
      await adminApi.deleteIndustry(ind._id);
      addToast({ type: 'info', title: 'Industry Deleted', message: ind.name });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Unable to delete industry.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Manage Industries | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Manufacturing Sectors
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Industries We Serve ({industries.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Industry</span>
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
                    {editingId ? 'Edit Sector' : 'New Sector'}
                  </span>
                  <span className="text-xs font-mono-code text-[#F4EEDF]/50">
                    Order #{form.displayOrder}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] truncate">
                  {editingId ? (form.name || 'Edit Industry Sector') : 'Add Industry Sector'}
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
                  <Factory className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    1. Sector Identity &amp; Status
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Industry Name <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Commercial Architectural Joinery"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <CustomDropdown
                        label="Status"
                        size="md"
                        value={form.publicationStatus}
                        onChange={(val) => setForm({ ...form, publicationStatus: val })}
                        options={[
                          { value: 'published', label: 'Published' },
                          { value: 'draft', label: 'Draft' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                        className="w-full rounded-xl px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Visual Asset */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <ImageIcon className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    2. Sector Visual Asset
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-xl bg-[#0A1428] border border-[#3F5E8C]/60 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Preview"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#F4EEDF]/30" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 font-medium">
                      Sector Image URL / Cloud CDN Link
                    </label>
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/..."
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                    <p className="text-[11px] text-[#F4EEDF]/50">
                      Recommended: Realistic machinery in action or industrial warehouse setup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Descriptions & Key Applications */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <Layers className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    3. Narrative &amp; Market Applications
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
                      placeholder="Concise 1-2 sentence overview for sector cards..."
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
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="In-depth operational relevance and industrial manufacturing requirements..."
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Key Manufacturing Applications (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={form.keyApplicationsText}
                      onChange={(e) => setForm({ ...form, keyApplicationsText: e.target.value })}
                      placeholder="High-volume edge-banding lines&#10;Cleanroom door assembly&#10;Precision nested routing"
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Linked Divisions */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <Factory className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    4. Associated Business Divisions
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {divisions.map((div) => {
                    const isSelected = form.relatedDivisions.includes(div._id);
                    return (
                      <label
                        key={div._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#D9C08B]/10 border-[#D9C08B] text-[#F4EEDF]'
                            : 'bg-[#0A1428] border-[#3F5E8C]/40 text-[#F4EEDF]/70 hover:border-[#3F5E8C]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDivisionRef(div._id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-[#D9C08B] border-[#D9C08B] text-[#0A1428]'
                              : 'border-[#3F5E8C]/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{div.name}</p>
                          <p className="text-[10px] font-mono-code text-[#D9C08B]">DIV / {div.code}</p>
                        </div>
                      </label>
                    );
                  })}
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
                  <span>{saving ? 'Saving...' : 'Save Industry'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Industries Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 rounded-2xl p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading industries...
          </div>
        ) : (
          industries.map((ind) => (
            <div
              key={ind._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 hover:border-[#D9C08B]/60 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-[#0A1428] border border-[#3F5E8C]/40 rounded-xl p-2 shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={ind.image} alt={ind.name} className="max-h-16 w-auto object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-code text-xs text-[#D9C08B] font-medium">
                      SECTOR #{ind.displayOrder}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] rounded-md">
                      {ind.publicationStatus}
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] mt-1">
                    {ind.name}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-1.5 line-clamp-2">
                    {ind.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs">
                <span className="text-[#F4EEDF]/65 font-mono-code text-[11px]">
                  {(ind.relatedDivisions || []).length} Linked Division(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(ind)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] rounded-lg transition-all text-xs cursor-pointer"
                  >
                    <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ind)}
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
