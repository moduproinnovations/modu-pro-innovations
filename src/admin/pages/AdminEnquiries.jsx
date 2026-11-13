import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  Archive,
  RotateCcw,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';

const STATUS_OPTIONS = ['New', 'In Progress', 'Responded', 'Closed'];

export default function AdminEnquiries() {
  const [searchParams] = useSearchParams();
  const { divisions } = useSite();
  const { addToast } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [exporting, setExporting] = useState(false);

  const inspectorRef = useRef(null);
  const listRef = useRef(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEnquiries({
        search: search.trim(),
        status: statusFilter,
        divisionName: divisionFilter,
        startDate,
        endDate,
        archived: showArchived ? 'true' : 'false',
        page,
        limit: 20,
      });
      setEnquiries(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Load Enquiries',
        message: err.response?.data?.message || 'Could not fetch enquiry records.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, divisionFilter, startDate, endDate, showArchived, page, addToast]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleSelectEnquiry = (enq) => {
    setSelectedEnquiry(enq);
    setAssigneeInput(enq.assignedTo || '');
    setNoteInput('');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        inspectorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedEnquiry) return;
    setSavingUpdate(true);
    try {
      const res = await adminApi.updateEnquiry(selectedEnquiry._id, {
        status: newStatus,
        assignedTo: assigneeInput,
      });
      setSelectedEnquiry(res.data);
      fetchEnquiries();
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Enquiry ${selectedEnquiry.reference} marked as ${newStatus}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Unable to update status.',
      });
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleSaveAssignee = async () => {
    if (!selectedEnquiry) return;
    setSavingUpdate(true);
    try {
      const res = await adminApi.updateEnquiry(selectedEnquiry._id, {
        assignedTo: assigneeInput,
      });
      setSelectedEnquiry(res.data);
      fetchEnquiries();
      addToast({
        type: 'success',
        title: 'Assignment Saved',
        message: `Updated assignee for ${selectedEnquiry.reference}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Unable to update assignee.',
      });
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry || !noteInput.trim()) return;
    setSavingUpdate(true);
    try {
      const res = await adminApi.addEnquiryNote(selectedEnquiry._id, noteInput.trim());
      setSelectedEnquiry(res.data);
      setNoteInput('');
      fetchEnquiries();
      addToast({
        type: 'success',
        title: 'Internal Note Added',
        message: 'Private CRM note saved to enquiry record.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Add Note',
        message: err.response?.data?.message || 'Could not save internal note.',
      });
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleToggleArchive = async (enq) => {
    const nextArchived = !enq.isArchived;
    const confirmed = window.confirm(
      nextArchived
        ? `Archive enquiry ${enq.reference} from ${enq.companyName}?`
        : `Restore enquiry ${enq.reference} to active CRM list?`
    );
    if (!confirmed) return;

    try {
      await adminApi.updateEnquiry(enq._id, { isArchived: nextArchived });
      if (selectedEnquiry?._id === enq._id) {
        setSelectedEnquiry(null);
      }
      fetchEnquiries();
      addToast({
        type: 'info',
        title: nextArchived ? 'Enquiry Archived' : 'Enquiry Restored',
        message: `Reference ${enq.reference} updated.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not update archive status.',
      });
    }
  };

  const exportUrl = adminApi.getExportEnquiriesUrl({
    search: search.trim(),
    status: statusFilter,
    divisionName: divisionFilter,
    startDate,
    endDate,
    archived: showArchived ? 'true' : 'false',
  });

  const handleExportCsv = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      const blob = await adminApi.downloadEnquiriesCsv({
        search: search.trim(),
        status: statusFilter,
        divisionName: divisionFilter,
        startDate,
        endDate,
        archived: showArchived ? 'true' : 'false',
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute(
        'download',
        `modu-pro-enquiries-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      addToast({
        type: 'success',
        title: 'CSV Export Complete',
        message: 'Enquiries downloaded successfully.',
      });
    } catch (_) {
      window.location.href = exportUrl;
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Enquiries CRM | Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Customer Relationship Management
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Enquiries CRM ({pagination.total})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowArchived((v) => !v);
              setPage(1);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16294D] border border-[#3F5E8C]/60 hover:border-[#D9C08B] text-xs uppercase tracking-wider text-[#F4EEDF] cursor-pointer"
          >
            <Archive aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
            <span>{showArchived ? 'Viewing Archived' : 'View Archived'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#F4EEDF] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Download aria-hidden="true" className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div className="relative lg:col-span-2">
          <Search
            aria-hidden="true"
            className="w-4 h-4 text-[#D9C08B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference, name, company, email, phone..."
            className="w-full pl-10 pr-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-lg text-xs text-[#F4EEDF] outline-none"
          />
        </div>

        <CustomDropdown
          size="sm"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All Statuses' },
            ...STATUS_OPTIONS.map((st) => ({ value: st, label: st })),
          ]}
          placeholder="Filter status..."
        />

        <CustomDropdown
          size="sm"
          value={divisionFilter}
          onChange={(val) => {
            setDivisionFilter(val);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All Divisions' },
            { value: 'General / Multi-Division', label: 'General / Multi-Division', badge: 'ALL' },
            ...(divisions || []).map((d) => ({
              value: d.name,
              label: d.name,
              badge: d.code,
            })),
          ]}
          placeholder="Filter division..."
        />

        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Start date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-2 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
          <input
            type="date"
            aria-label="End date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-2 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
        </div>
      </div>

      {/* Main Split CRM Layout */}
      <div ref={listRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Enquiries List */}
        <div className="lg:col-span-7 bg-[#16294D] border border-[#3F5E8C]/45 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#3F5E8C]/40 bg-[#0A1428]/60 text-xs font-mono-code uppercase text-[#D9C08B]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Customer &amp; Company</th>
                  <th className="py-3.5 px-4">Division</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3F5E8C]/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#F4EEDF]/70">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length > 0 ? (
                  enquiries.map((enq) => {
                    const isSelected = selectedEnquiry?._id === enq._id;
                    return (
                      <tr
                        key={enq._id}
                        onClick={() => handleSelectEnquiry(enq)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#0A1428]' : 'hover:bg-[#0A1428]/50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono-code text-xs text-[#D9C08B]">
                          <div>{enq.reference}</div>
                          <div className="text-[10px] text-[#F4EEDF]/55 mt-0.5">
                            {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#F4EEDF]">{enq.fullName}</p>
                          <p className="text-xs text-[#F4EEDF]/70">{enq.companyName}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#F4EEDF]/85">
                          {enq.divisionName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 text-[11px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                            {enq.status}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(enq)}
                            className="px-2.5 py-1 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-[#D9C08B] text-[11px] text-[#F4EEDF]/80 hover:text-[#D9C08B]"
                          >
                            {enq.isArchived ? 'Restore' : 'Archive'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#F4EEDF]/70">
                      No matching enquiry records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enquiry Inspector & Internal Notes Panel */}
        <div ref={inspectorRef} className="lg:col-span-5 bg-[#16294D] border border-[#D9C08B]/35 p-5 sm:p-6">
          {selectedEnquiry ? (
            <div className="space-y-6">
              <div className="lg:hidden pb-3 border-b border-[#3F5E8C]/35">
                <button
                  type="button"
                  onClick={() => listRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 text-xs text-[#D9C08B] font-mono-code uppercase tracking-wider hover:underline"
                >
                  ↑ Back to Enquiries List
                </button>
              </div>

              <div className="pb-4 border-b border-[#3F5E8C]/40 flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono-code text-xs text-[#D9C08B]">
                    {selectedEnquiry.reference}
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] mt-0.5">
                    {selectedEnquiry.companyName}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-0.5">
                    Submitted by {selectedEnquiry.fullName} •{' '}
                    {selectedEnquiry.createdAt
                      ? new Date(selectedEnquiry.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B] text-[#D9C08B]">
                  {selectedEnquiry.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#0A1428] border border-[#3F5E8C]/35 p-4">
                <div>
                  <span className="text-[#F4EEDF]/60 block">Phone</span>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-[#D9C08B] font-medium mt-0.5 block"
                  >
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[#F4EEDF]/60 block">Email</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-[#D9C08B] font-medium mt-0.5 block break-all"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#F4EEDF]/60 block">Division</span>
                  <span className="text-[#F4EEDF] mt-0.5 block">
                    {selectedEnquiry.divisionName}
                  </span>
                </div>
                <div>
                  <span className="text-[#F4EEDF]/60 block">Source Page</span>
                  <span className="font-mono-code text-[#F4EEDF] mt-0.5 block">
                    {selectedEnquiry.sourcePage}
                  </span>
                </div>
                {selectedEnquiry.serviceCategory && (
                  <div className="col-span-2">
                    <span className="text-[#F4EEDF]/60 block">Service Category</span>
                    <span className="text-[#F4EEDF] mt-0.5 block">
                      {selectedEnquiry.serviceCategory}
                    </span>
                  </div>
                )}
                {selectedEnquiry.machineOrProductDetails && (
                  <div className="col-span-2">
                    <span className="text-[#F4EEDF]/60 block">Machine / Product Details</span>
                    <span className="text-[#F4EEDF] mt-0.5 block">
                      {selectedEnquiry.machineOrProductDetails}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] mb-2">
                  Customer Requirement / Message
                </h3>
                <div className="p-4 bg-[#0A1428] border border-[#3F5E8C]/35 text-sm text-[#F4EEDF]/90 whitespace-pre-wrap leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status Controls */}
              <div>
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] mb-2">
                  Set Enquiry Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={savingUpdate}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-2.5 text-xs font-mono-code uppercase border transition-colors cursor-pointer ${
                        selectedEnquiry.status === st
                          ? 'bg-[#D9C08B] text-[#0A1428] border-[#D9C08B] font-semibold'
                          : 'bg-[#0A1428] text-[#F4EEDF] border-[#3F5E8C]/50 hover:border-[#D9C08B]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label
                  htmlFor="crm-assignee"
                  className="block text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] mb-1.5"
                >
                  Assigned Coordinator / Representative
                </label>
                <div className="flex gap-2">
                  <input
                    id="crm-assignee"
                    type="text"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    placeholder="e.g., Adhesi Pro Desk / Technical Lead"
                    className="flex-1 px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                  />
                  <button
                    type="button"
                    disabled={savingUpdate}
                    onClick={handleSaveAssignee}
                    className="px-4 py-2 bg-[#0A1428] border border-[#D9C08B]/50 hover:border-[#D9C08B] text-xs uppercase tracking-wider text-[#D9C08B] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Internal Notes (Strictly Admin-Only) */}
              <div className="pt-4 border-t border-[#3F5E8C]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                    Internal CRM Notes (Private)
                  </h3>
                  <span className="text-[10px] text-[#F4EEDF]/55">Never visible publicly</span>
                </div>

                <form onSubmit={handleAddInternalNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal follow-up note, call summary, or quotation reference..."
                    className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
                  />
                  <button
                    type="submit"
                    disabled={savingUpdate || !noteInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    <MessageSquarePlus aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Add Internal Note</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedEnquiry.internalNotes && selectedEnquiry.internalNotes.length > 0 ? (
                    selectedEnquiry.internalNotes
                      .slice()
                      .reverse()
                      .map((n, i) => (
                        <div
                          key={n._id || i}
                          className="p-3 bg-[#0A1428] border border-[#3F5E8C]/35 text-xs space-y-1"
                        >
                          <p className="text-[#F4EEDF]">{n.note}</p>
                          <p className="text-[10px] text-[#D9C08B]">
                            {n.authorName} •{' '}
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-[#F4EEDF]/55">No internal notes recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Status Audit History */}
              {selectedEnquiry.statusHistory && selectedEnquiry.statusHistory.length > 0 && (
                <div className="pt-4 border-t border-[#3F5E8C]/40">
                  <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] mb-2">
                    Status Audit Trail
                  </h3>
                  <div className="space-y-1.5 text-[11px] text-[#F4EEDF]/75">
                    {selectedEnquiry.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="w-3 h-3 text-[#D9C08B]" />
                          <strong className="text-[#F4EEDF]">{h.status}</strong> — {h.changedBy}
                        </span>
                        <span className="font-mono-code text-[10px] text-[#F4EEDF]/55">
                          {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 aria-hidden="true" className="w-8 h-8 text-[#D9C08B] mx-auto" />
              <p className="text-sm font-medium text-[#F4EEDF]">Select an Enquiry Record</p>
              <p className="text-xs text-[#F4EEDF]/65">
                Click any enquiry row on the left to inspect full customer details, update status,
                or add private CRM notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
