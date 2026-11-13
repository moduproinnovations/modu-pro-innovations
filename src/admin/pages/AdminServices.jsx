import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Wrench, Layers, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';

const EMPTY_SERVICE = {
  name: '',
  slug: '',
  category: 'Machinery & Technical Support',
  shortDescription: '',
  description: '',
  image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          <span>Add Service Category</span>
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
                    {editingId ? 'Edit Service' : 'New Service'}
                  </span>
                  <span className="text-xs font-mono-code text-[#F4EEDF]/50">
                    Order #{form.displayOrder}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] truncate">
                  {editingId ? (form.name || 'Edit Service Category') : 'Add Service Category'}
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
                  <Wrench className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    1. Service Offering &amp; Governance
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Service Name <span className="text-[#D9C08B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Turnkey Installation &amp; Commissioning"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Service Category
                    </label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Machinery &amp; Technical Support"
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <CustomDropdown
                      label="Client Confirmation Status"
                      size="md"
                      value={form.confirmationStatus}
                      onChange={(val) => setForm({ ...form, confirmationStatus: val })}
                      options={[
                        { value: 'pending_confirmation', label: 'Pending Client Confirmation' },
                        { value: 'confirmed', label: 'Confirmed Active Offering' },
                      ]}
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Publication Status"
                      size="md"
                      value={form.publicationStatus}
                      onChange={(val) => setForm({ ...form, publicationStatus: val })}
                      options={[
                        { value: 'published', label: 'Published (Live)' },
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

              {/* Card 2: Visual Asset */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <ImageIcon className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    2. Service Visual Asset
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
                      Service Image URL / Cloud CDN Link
                    </label>
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/..."
                      className="w-full rounded-xl px-4 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30 font-mono-code"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Descriptions & Scope */}
              <div className="bg-[#0A1428]/50 border border-[#3F5E8C]/35 rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3F5E8C]/25 text-[#D9C08B]">
                  <Layers className="w-4 h-4" />
                  <h3 className="font-mono-code text-xs uppercase tracking-wider font-semibold">
                    3. Scope of Work &amp; Technical Descriptions
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
                      placeholder="Concise 1-2 sentence overview for service cards..."
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
                      placeholder="Comprehensive details on technical support, SLA, and parts provision..."
                      className="w-full rounded-xl p-3.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF] focus:border-[#D9C08B] focus:outline-none transition-all placeholder:text-[#F4EEDF]/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#F4EEDF]/90 mb-1.5 font-medium">
                      Deliverable Scope Items (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={form.scopeItemsText}
                      onChange={(e) => setForm({ ...form, scopeItemsText: e.target.value })}
                      placeholder="On-site machine leveling and anchoring&#10;Operator calibration and tooling training&#10;Electrical load and air pressure verification&#10;30-day initial operational audit"
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
                  <span>{saving ? 'Saving...' : 'Save Service'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-[#16294D] border border-[#3F5E8C]/40 rounded-2xl p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading services...
          </div>
        ) : (
          services.map((srv) => (
            <div
              key={srv._id}
              className="bg-[#16294D] border border-[#3F5E8C]/50 hover:border-[#D9C08B]/60 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-code text-xs text-[#D9C08B] font-medium">
                    ORDER #{srv.displayOrder} • {srv.publicationStatus}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono-code uppercase border rounded-md ${
                      srv.confirmationStatus === 'confirmed'
                        ? 'bg-[#0A1428] border-[#D9C08B]/40 text-[#D9C08B]'
                        : 'bg-[#0A1428] border-amber-400/40 text-amber-300'
                    }`}
                  >
                    {srv.confirmationStatus === 'confirmed'
                      ? 'Client Confirmed'
                      : 'Pending Confirmation'}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4EEDF] mt-2">
                  {srv.name}
                </h2>
                <p className="text-xs text-[#F4EEDF]/75 mt-1.5 leading-relaxed line-clamp-3">
                  {srv.shortDescription}
                </p>

                {srv.scopeItems && srv.scopeItems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {srv.scopeItems.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#0A1428] border border-[#3F5E8C]/40 text-[#F4EEDF]/70 truncate max-w-xs"
                      >
                        ✓ {item}
                      </span>
                    ))}
                    {srv.scopeItems.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#0A1428] text-[#D9C08B] font-mono-code">
                        +{srv.scopeItems.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#3F5E8C]/35 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => startEdit(srv)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 hover:border-[#D9C08B] text-[#D9C08B] rounded-lg transition-all text-xs cursor-pointer"
                >
                  <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(srv)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-red-400/60 text-[#F4EEDF]/75 hover:text-red-400 rounded-lg transition-all text-xs cursor-pointer"
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
