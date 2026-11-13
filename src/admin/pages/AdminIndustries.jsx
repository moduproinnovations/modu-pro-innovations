import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

const EMPTY_INDUSTRY = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  image: '/assets/products/panel-processing/edge-banding-machine.png',
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Industry</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#16294D] border border-[#D9C08B]/50 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#3F5E8C]/40">
            <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              {editingId ? 'Edit Industry Sector' : 'Add Industry Sector'}
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
                Industry Name *
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
                Image URL
              </label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Status &amp; Order
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.publicationStatus}
                  onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })}
                  className="px-2 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  className="px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                />
              </div>
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
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Key Applications (One per line)
              </label>
              <textarea
                rows={3}
                value={form.keyApplicationsText}
                onChange={(e) => setForm({ ...form, keyApplicationsText: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-2">
                Related Divisions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {divisions.map((div) => (
                  <label
                    key={div._id}
                    className="flex items-center gap-2 p-2.5 bg-[#0A1428] border border-[#3F5E8C]/40 text-xs text-[#F4EEDF] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.relatedDivisions.includes(div._id)}
                      onChange={() => toggleDivisionRef(div._id)}
                      className="w-4 h-4 min-h-0 accent-[#D9C08B]"
                    />
                    <span className="truncate">{div.name}</span>
                  </label>
                ))}
              </div>
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
              <span>{saving ? 'Saving...' : 'Save Industry'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Industries Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading industries...
          </div>
        ) : (
          industries.map((ind) => (
            <div
              key={ind._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-[#0A1428] border border-[#3F5E8C]/40 p-2 shrink-0 flex items-center justify-center">
                  <img src={ind.image} alt={ind.name} className="max-h-16 w-auto object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-code text-xs text-[#D9C08B]">
                      SECTOR #{ind.displayOrder}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                      {ind.publicationStatus}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] mt-1">
                    {ind.name}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-1.5 line-clamp-2">
                    {ind.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs">
                <span className="text-[#F4EEDF]/65 font-mono-code">
                  {(ind.relatedDivisions || []).length} Linked Division(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(ind)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] cursor-pointer"
                  >
                    <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ind)}
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
