import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

const EMPTY_SERVICE = {
  name: '',
  slug: '',
  category: 'Machinery & Technical Support',
  shortDescription: '',
  description: '',
  image: '/assets/products/panel-processing/edge-banding-machine.png',
  scopeItemsText: '',
  confirmationStatus: 'pending_confirmation',
  publicationStatus: 'published',
  displayOrder: 1,
};

export default function AdminServices() {
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getServices();
      setServices(data || []);
    } catch (_) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_SERVICE, displayOrder: services.length + 1 });
    setShowForm(true);
  };

  const startEdit = (srv) => {
    setEditingId(srv._id);
    setForm({
      name: srv.name || '',
      slug: srv.slug || '',
      category: srv.category || 'Machinery & Technical Support',
      shortDescription: srv.shortDescription || '',
      description: srv.description || '',
      image: srv.image || '',
      scopeItemsText: (srv.scopeItems || []).join('\n'),
      confirmationStatus: srv.confirmationStatus || 'pending_confirmation',
      publicationStatus: srv.publicationStatus || 'published',
      displayOrder: srv.displayOrder ?? 1,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      scopeItems: form.scopeItemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      confirmationStatus: form.confirmationStatus,
      publicationStatus: form.publicationStatus,
      displayOrder: Number(form.displayOrder) || 1,
    };

    try {
      if (editingId) {
        await adminApi.updateService(editingId, payload);
        addToast({ type: 'success', title: 'Service Updated', message: payload.name });
      } else {
        await adminApi.createService(payload);
        addToast({ type: 'success', title: 'Service Created', message: payload.name });
      }
      setShowForm(false);
      setEditingId(null);
      loadServices();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || 'Unable to save service.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (srv) => {
    if (!window.confirm(`Delete service category "${srv.name}"?`)) return;
    try {
      await adminApi.deleteService(srv._id);
      addToast({ type: 'info', title: 'Service Deleted', message: srv.name });
      loadServices();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Unable to delete service.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Manage Services | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Machinery Maintenance &amp; Support
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Services &amp; Support Categories ({services.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Service Category</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#16294D] border border-[#D9C08B]/50 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#3F5E8C]/40">
            <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              {editingId ? 'Edit Service Category' : 'Add Service Category'}
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
                Service Name *
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
                Client Confirmation Status
              </label>
              <select
                value={form.confirmationStatus}
                onChange={(e) => setForm({ ...form, confirmationStatus: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
              >
                <option value="pending_confirmation">Pending Client Confirmation</option>
                <option value="confirmed">Confirmed Active Offering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Publication Status &amp; Order
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

            <div className="sm:col-span-4">
              <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
                Scope Items (One per line)
              </label>
              <textarea
                rows={3}
                value={form.scopeItemsText}
                onChange={(e) => setForm({ ...form, scopeItemsText: e.target.value })}
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
              <span>{saving ? 'Saving...' : 'Save Service'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading services...
          </div>
        ) : (
          services.map((srv) => (
            <div
              key={srv._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-code text-xs text-[#D9C08B]">
                    ORDER #{srv.displayOrder} • {srv.publicationStatus}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                    {srv.confirmationStatus === 'confirmed'
                      ? 'Client Confirmed'
                      : 'Pending Confirmation'}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] mt-2">
                  {srv.name}
                </h2>
                <p className="text-xs text-[#F4EEDF]/75 mt-1.5 leading-relaxed">
                  {srv.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => startEdit(srv)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] cursor-pointer"
                >
                  <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(srv)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-[#D9C08B] text-[#F4EEDF]/75 hover:text-[#D9C08B] cursor-pointer"
                >
                  <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
