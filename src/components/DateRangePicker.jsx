import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X, Check } from 'lucide-react';

const toLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch (_) {
    return dateStr;
  }
};

export default function DateRangePicker({
  startDate = '',
  endDate = '',
  onChange,
  onClear,
  size = 'sm',
  className = '',
  align = 'right', // 'right' | 'left' | 'auto'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [activePreset, setActivePreset] = useState(null);
  const [effectiveAlign, setEffectiveAlign] = useState(align === 'auto' ? 'right' : align);
  const containerRef = useRef(null);

  // Auto-detect best horizontal alignment when opened
  useEffect(() => {
    if (!isOpen) return;

    if (align === 'auto') {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        // If there's less than 350px on the right and more on the left, align to right
        if (spaceRight < 350 && spaceLeft > 300) {
          setEffectiveAlign('right');
        } else {
          setEffectiveAlign('left');
        }
      }
    } else {
      setEffectiveAlign(align);
    }
  }, [isOpen, align]);

  // Sync internal temp dates when props change
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const PRESETS = [
    {
      id: 'today',
      label: 'Today',
      getRange: () => {
        const today = new Date();
        const str = toLocalDateString(today);
        return { start: str, end: str };
      },
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      getRange: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const str = toLocalDateString(d);
        return { start: str, end: str };
      },
    },
    {
      id: '7days',
      label: 'Last 7 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { start: toLocalDateString(start), end: toLocalDateString(end) };
      },
    },
    {
      id: '30days',
      label: 'Last 30 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        return { start: toLocalDateString(start), end: toLocalDateString(end) };
      },
    },
    {
      id: 'thisMonth',
      label: 'This Month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: toLocalDateString(start), end: toLocalDateString(now) };
      },
    },
  ];

  const handleSelectPreset = (preset) => {
    const { start, end } = preset.getRange();
    setActivePreset(preset.id);
    setTempStart(start);
    setTempEnd(end);
    onChange?.({ startDate: start, endDate: end, label: preset.label });
    setIsOpen(false);
  };

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    setActivePreset('custom');
    onChange?.({ startDate: tempStart, endDate: tempEnd, label: 'Custom Range' });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    setActivePreset(null);
    setTempStart('');
    setTempEnd('');
    onClear?.();
    onChange?.({ startDate: '', endDate: '', label: '' });
    setIsOpen(false);
  };

  const hasFilter = Boolean(startDate || endDate);

  // Compute button text
  let labelText = 'All Dates';
  if (hasFilter) {
    if (activePreset && activePreset !== 'custom') {
      const match = PRESETS.find((p) => p.id === activePreset);
      labelText = match ? match.label : 'Custom Range';
    } else if (startDate && endDate) {
      if (startDate === endDate) {
        labelText = formatDisplayDate(startDate);
      } else {
        labelText = `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
      }
    } else if (startDate) {
      labelText = `From ${formatDisplayDate(startDate)}`;
    } else if (endDate) {
      labelText = `Until ${formatDisplayDate(endDate)}`;
    }
  }

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 bg-[#0A1428] border transition-all cursor-pointer rounded-xl select-none ${
          isOpen
            ? 'border-[#D9C08B] ring-1 ring-[#D9C08B]/30'
            : hasFilter
            ? 'border-[#D9C08B]/70 bg-[#0A1428]'
            : 'border-[#3F5E8C]/60 hover:border-[#3F5E8C]'
        } ${isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon
            className={`shrink-0 ${
              hasFilter ? 'text-[#D9C08B]' : 'text-[#F4EEDF]/50'
            } ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
          />
          <span
            className={`truncate ${
              hasFilter ? 'text-[#F4EEDF] font-medium' : 'text-[#F4EEDF]/70'
            }`}
          >
            {labelText}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {hasFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-[#F4EEDF]/50 hover:text-red-400 hover:bg-[#3F5E8C]/20 transition-colors"
              title="Clear date filter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`text-[#D9C08B] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-[min(340px,calc(100vw-2.5rem))] z-50 bg-[#0e1d39] border border-[#3F5E8C]/60 rounded-2xl shadow-2xl shadow-black/80 p-4 space-y-4 animate-in fade-in-0 zoom-in-95 ${
            effectiveAlign === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          }`}
        >
          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-mono-code uppercase tracking-wider text-[#D9C08B] mb-2 font-medium">
              Quick Date Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#D9C08B] text-[#0A1428] font-semibold'
                        : 'bg-[#0A1428] text-[#F4EEDF]/80 hover:bg-[#16294D] hover:text-[#F4EEDF] border border-[#3F5E8C]/40'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleClear}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                  !hasFilter
                    ? 'bg-[#D9C08B] text-[#0A1428] font-semibold'
                    : 'bg-[#0A1428] text-[#F4EEDF]/80 hover:bg-[#16294D] hover:text-[#F4EEDF] border border-[#3F5E8C]/40'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <div className="border-t border-[#3F5E8C]/35 pt-3">
            <span className="block text-[11px] font-mono-code uppercase tracking-wider text-[#D9C08B] mb-2 font-medium">
              Custom Date Window
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase text-[#F4EEDF]/60 mb-1">From Date</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-2.5 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-lg text-xs text-[#F4EEDF] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#F4EEDF]/60 mb-1">To Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-2.5 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/60 focus:border-[#D9C08B] rounded-lg text-xs text-[#F4EEDF] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#3F5E8C]/25">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-[#F4EEDF]/60 hover:text-red-400 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!tempStart && !tempEnd}
                className="px-4 py-1.5 bg-[#D9C08B] hover:bg-[#E5CC9A] text-[#0A1428] text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer disabled:opacity-40"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
