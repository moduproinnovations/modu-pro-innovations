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
  Phone,
  Mail,
  Building2,
  Copy,
  Check,
  X,
  FilterX,
  User,
  Calendar,
  Inbox,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';
import CustomDropdown from '../../components/CustomDropdown';
import DateRangePicker from '../../components/DateRangePicker';

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
  const [copiedField, setCopiedField] = useState(null);

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

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    addToast({
      type: 'info',
      title: 'Copied',
      message: `${text} copied to clipboard.`,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDivisionFilter('all');
    setStartDate('');
    setEndDate('');
    setShowArchived(false);
    setPage(1);
  };

  const isFiltered = Boolean(
    search.trim() ||
    statusFilter !== 'all' ||
    divisionFilter !== 'all' ||
    startDate ||
    endDate ||
    showArchived
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'In Progress':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
      case 'Responded':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Closed':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/40';
      default:
        return 'bg-[#0A1428] text-[#D9C08B] border-[#D9C08B]/40';
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Enquiries CRM | Admin" />

      {/* Header & CRM Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
              Customer Relationship Management
            </span>
            {showArchived && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                Archived Mode
              </span>
            )}
          </div>
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
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs uppercase tracking-wider transition-all cursor-pointer ${
              showArchived
                ? 'bg-red-500/15 border-red-500/50 text-red-200 hover:bg-red-500/25'
                : 'bg-[#16294D] border-[#3F5E8C]/60 hover:border-[#D9C08B] text-[#F4EEDF]'
            }`}
          >
            <Archive aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
            <span>{showArchived ? 'Exit Archived' : 'View Archived'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download aria-hidden="true" className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-[#D9C08B] text-[#0A1428] font-semibold shadow'
              : 'bg-[#16294D] border border-[#3F5E8C]/40 text-[#F4EEDF]/75 hover:border-[#D9C08B]'
          }`}
        >
          All Statuses
        </button>
        {STATUS_OPTIONS.map((st) => {
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#D9C08B] text-[#0A1428] font-semibold shadow'
                  : 'bg-[#16294D] border border-[#3F5E8C]/40 text-[#F4EEDF]/75 hover:border-[#D9C08B]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  st === 'New'
                    ? 'bg-amber-400'
                    : st === 'In Progress'
                    ? 'bg-sky-400'
                    : st === 'Responded'
                    ? 'bg-emerald-400'
                    : 'bg-slate-400'
                }`}
              />
              <span>{st}</span>
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar with Modern Date Range Dropdown */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-5">
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
              placeholder="Search reference, customer name, company, email, phone..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-xl text-xs text-[#F4EEDF] outline-none transition-all placeholder:text-[#F4EEDF]/35"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F4EEDF]/40 hover:text-[#F4EEDF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Division Filter */}
          <div className="lg:col-span-3">
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
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
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
          </div>

          {/* Date Range Picker */}
          <div className="lg:col-span-2">
            <DateRangePicker
              size="sm"
              align="right"
              startDate={startDate}
              endDate={endDate}
              onChange={({ startDate: s, endDate: e }) => {
                setStartDate(s);
                setEndDate(e);
                setPage(1);
              }}
              onClear={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {isFiltered && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#3F5E8C]/25 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#F4EEDF]/50 font-mono-code uppercase mr-1">
                Active Filters:
              </span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] text-[11px]">
                  Keyword: "{search}"
                  <button type="button" onClick={() => setSearch('')}>
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] text-[11px]">
                  Status: {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('all')}>
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              )}
              {divisionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] text-[11px]">
                  Division: {divisionFilter}
                  <button type="button" onClick={() => setDivisionFilter('all')}>
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B] text-[11px]">
                  Date: {startDate || '...'} → {endDate || '...'}
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              )}
              {showArchived && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[11px]">
                  Archived Enquiries
                  <button type="button" onClick={() => setShowArchived(false)}>
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-[#D9C08B] hover:text-[#F4EEDF] font-mono-code uppercase tracking-wider cursor-pointer ml-auto"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split CRM Workspace */}
      <div ref={listRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Enquiries List */}
        <div className="lg:col-span-7 bg-[#16294D] border border-[#3F5E8C]/45 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#3F5E8C]/40 bg-[#0A1428]/60 text-xs font-mono-code uppercase text-[#D9C08B]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Customer &amp; Company</th>
                  <th className="py-3.5 px-4">Division</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3F5E8C]/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#F4EEDF]/70">
                      <Clock className="w-5 h-5 mx-auto mb-2 text-[#D9C08B] animate-spin" />
                      Loading enquiry records...
                    </td>
                  </tr>
                ) : enquiries.length > 0 ? (
                  enquiries.map((enq) => {
                    const isSelected = selectedEnquiry?._id === enq._id;
                    const initials = (enq.fullName || 'User')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr
                        key={enq._id}
                        onClick={() => handleSelectEnquiry(enq)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0A1428] border-l-4 border-l-[#D9C08B]'
                            : 'hover:bg-[#0A1428]/50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono-code text-xs">
                          <div className="text-[#D9C08B] font-medium">{enq.reference}</div>
                          <div className="text-[10px] text-[#F4EEDF]/50 mt-0.5">
                            {enq.createdAt
                              ? new Date(enq.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#D9C08B]/15 border border-[#D9C08B]/30 text-[#D9C08B] text-xs font-semibold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#F4EEDF] truncate">{enq.fullName}</p>
                              <p className="text-xs text-[#F4EEDF]/65 truncate">{enq.companyName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#F4EEDF]/85">
                          <span className="truncate block max-w-[140px]">{enq.divisionName}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-mono-code uppercase rounded-md border ${getStatusBadge(
                              enq.status
                            )}`}
                          >
                            {enq.status}
                          </span>
                        </td>

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(enq)}
                            className="px-2.5 py-1 bg-[#0A1428] border border-[#3F5E8C]/50 hover:border-[#D9C08B] rounded-lg text-[11px] text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                          >
                            {enq.isArchived ? 'Restore' : 'Archive'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <Inbox className="w-8 h-8 text-[#F4EEDF]/30 mx-auto mb-2" />
                      <p className="text-sm font-medium text-[#F4EEDF]">No enquiries found</p>
                      <p className="text-xs text-[#F4EEDF]/50 mt-1">
                        Try clearing filters or broadening your date window.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-[#3F5E8C]/35 flex items-center justify-between text-xs bg-[#0A1428]/40">
              <span className="text-[#F4EEDF]/60 font-mono-code">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 rounded-lg text-xs text-[#F4EEDF] hover:border-[#D9C08B] disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 rounded-lg text-xs text-[#F4EEDF] hover:border-[#D9C08B] disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Enquiry Inspector & CRM Workspace */}
        <div
          ref={inspectorRef}
          className="lg:col-span-5 bg-[#16294D] border border-[#3F5E8C]/45 rounded-2xl p-5 sm:p-6 shadow-xl"
        >
          {selectedEnquiry ? (
            <div className="space-y-6">
              {/* Mobile Back Button */}
              <div className="lg:hidden pb-3 border-b border-[#3F5E8C]/35 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => listRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 text-xs text-[#D9C08B] font-mono-code uppercase tracking-wider hover:underline"
                >
                  ↑ Back to Enquiries List
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1 rounded-lg text-[#F4EEDF]/60 hover:text-[#F4EEDF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inspector Header */}
              <div className="pb-4 border-b border-[#3F5E8C]/40 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-code text-xs text-[#D9C08B] bg-[#D9C08B]/10 px-2 py-0.5 rounded-md border border-[#D9C08B]/30 font-medium">
                      {selectedEnquiry.reference}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono-code uppercase rounded-md border ${getStatusBadge(
                        selectedEnquiry.status
                      )}`}
                    >
                      {selectedEnquiry.status}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] truncate mt-1">
                    {selectedEnquiry.companyName}
                  </h2>
                  <p className="text-xs text-[#F4EEDF]/75 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D9C08B]" />
                    <span>{selectedEnquiry.fullName}</span>
                    <span>•</span>
                    <span className="text-[#F4EEDF]/50">
                      {selectedEnquiry.createdAt
                        ? new Date(selectedEnquiry.createdAt).toLocaleString()
                        : ''}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="hidden lg:block p-1.5 rounded-lg bg-[#0A1428] border border-[#3F5E8C]/50 text-[#F4EEDF]/60 hover:text-[#D9C08B] hover:border-[#D9C08B] transition-colors"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Info Pedestal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0A1428]/60 border border-[#3F5E8C]/40 rounded-xl p-4">
                {/* Phone */}
                <div className="space-y-1">
                  <span className="text-[#F4EEDF]/50 text-[11px] block">Direct Phone</span>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-[#D9C08B] font-medium hover:underline inline-flex items-center gap-1.5 truncate"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedEnquiry.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedEnquiry.phone, 'phone')}
                      className="p-1 rounded text-[#F4EEDF]/40 hover:text-[#D9C08B] transition-colors"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <span className="text-[#F4EEDF]/50 text-[11px] block">Corporate Email</span>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="text-[#D9C08B] font-medium hover:underline inline-flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedEnquiry.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedEnquiry.email, 'email')}
                      className="p-1 rounded text-[#F4EEDF]/40 hover:text-[#D9C08B] transition-colors"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Division */}
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-[#3F5E8C]/20 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[#F4EEDF]/50 text-[11px] block">Associated Division</span>
                    <span className="text-[#F4EEDF] font-medium mt-0.5 block">
                      {selectedEnquiry.divisionName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#F4EEDF]/50 text-[11px] block">Source Ingestion</span>
                    <span className="font-mono-code text-[#F4EEDF]/70 text-[11px] mt-0.5 block">
                      {selectedEnquiry.sourcePage || 'General Form'}
                    </span>
                  </div>
                </div>

                {selectedEnquiry.serviceCategory && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#3F5E8C]/20">
                    <span className="text-[#F4EEDF]/50 text-[11px] block">Service Scope</span>
                    <span className="text-[#F4EEDF] mt-0.5 block">
                      {selectedEnquiry.serviceCategory}
                    </span>
                  </div>
                )}

                {selectedEnquiry.machineOrProductDetails && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#3F5E8C]/20">
                    <span className="text-[#F4EEDF]/50 text-[11px] block">Machine or Product Details</span>
                    <span className="text-[#F4EEDF] mt-0.5 block">
                      {selectedEnquiry.machineOrProductDetails}
                    </span>
                  </div>
                )}
              </div>

              {/* Requirement Message */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] font-semibold">
                  Customer Requirement / Scope
                </h3>
                <div className="p-4 bg-[#0A1428] border border-[#3F5E8C]/40 rounded-xl text-sm text-[#F4EEDF]/90 whitespace-pre-wrap leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] font-semibold">
                  Update Enquiry Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((st) => {
                    const isCurrent = selectedEnquiry.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={savingUpdate}
                        onClick={() => handleStatusChange(st)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono-code uppercase border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#D9C08B] text-[#0A1428] border-[#D9C08B] font-semibold shadow-md'
                            : 'bg-[#0A1428] text-[#F4EEDF]/80 border-[#3F5E8C]/50 hover:border-[#D9C08B]'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee Representative */}
              <div className="space-y-1.5">
                <label
                  htmlFor="crm-assignee"
                  className="block text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] font-semibold"
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
                    className="flex-1 px-3.5 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-xl text-xs text-[#F4EEDF] outline-none"
                  />
                  <button
                    type="button"
                    disabled={savingUpdate}
                    onClick={handleSaveAssignee}
                    className="px-4 py-2.5 bg-[#0A1428] border border-[#D9C08B]/60 hover:border-[#D9C08B] hover:bg-[#D9C08B]/10 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#D9C08B] cursor-pointer transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Internal Notes (Private CRM Notes) */}
              <div className="pt-4 border-t border-[#3F5E8C]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#D9C08B]">
                    <ShieldCheck className="w-4 h-4" />
                    <h3 className="text-xs font-mono-code uppercase tracking-wider font-semibold">
                      Private Internal Notes
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#F4EEDF]/45">Confidential CRM Feed</span>
                </div>

                <form onSubmit={handleAddInternalNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal follow-up note, quotation reference, call summary..."
                    className="w-full p-3 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-xl text-xs text-[#F4EEDF] outline-none placeholder:text-[#F4EEDF]/35"
                  />
                  <button
                    type="submit"
                    disabled={savingUpdate || !noteInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-xl disabled:opacity-40 cursor-pointer transition-all shadow"
                  >
                    <MessageSquarePlus aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Add Internal Note</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedEnquiry.internalNotes && selectedEnquiry.internalNotes.length > 0 ? (
                    selectedEnquiry.internalNotes
                      .slice()
                      .reverse()
                      .map((n, i) => (
                        <div
                          key={n._id || i}
                          className="p-3 bg-[#0A1428] border border-[#3F5E8C]/35 rounded-xl text-xs space-y-1"
                        >
                          <p className="text-[#F4EEDF] whitespace-pre-wrap">{n.note}</p>
                          <p className="text-[10px] text-[#D9C08B] flex items-center justify-between">
                            <span>{n.authorName || 'Admin'}</span>
                            <span className="text-[#F4EEDF]/50">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                            </span>
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-[#F4EEDF]/50 italic">No internal notes recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Status Audit Trail */}
              {selectedEnquiry.statusHistory && selectedEnquiry.statusHistory.length > 0 && (
                <div className="pt-4 border-t border-[#3F5E8C]/40 space-y-2">
                  <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B] font-semibold">
                    Status Audit Trail
                  </h3>
                  <div className="space-y-1.5 text-[11px] text-[#F4EEDF]/75 max-h-36 overflow-y-auto pr-1">
                    {selectedEnquiry.statusHistory.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0A1428]/60 border border-[#3F5E8C]/30"
                      >
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <Clock aria-hidden="true" className="w-3 h-3 text-[#D9C08B] shrink-0" />
                          <strong className="text-[#F4EEDF]">{h.status}</strong>
                          <span className="text-[#F4EEDF]/50 truncate">— {h.changedBy}</span>
                        </span>
                        <span className="font-mono-code text-[10px] text-[#F4EEDF]/50 shrink-0">
                          {h.changedAt
                            ? new Date(h.changedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0A1428] border border-[#3F5E8C]/40 text-[#D9C08B] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 aria-hidden="true" className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-[#F4EEDF]">Select an Enquiry Record</p>
              <p className="text-xs text-[#F4EEDF]/60 max-w-sm mx-auto leading-relaxed">
                Click any enquiry row from the catalog on the left to inspect customer contacts, update
                status, assign coordinators, or log private CRM notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
