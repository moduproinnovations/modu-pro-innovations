import React, { useState, useEffect, useRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';

/**
 * CustomDropdown — Luxury Industrial Select Dropdown
 *
 * Supports:
 * - Simple string options: ['Option A', 'Option B']
 * - Object options: [{ value: 'a', label: 'Option A', subtitle?: '...', badge?: '01' }]
 * - Searchable filtering
 * - Optional clear button
 * - Keyboard navigation (ArrowDown, ArrowUp, Enter, Space, Escape, Home, End)
 * - Outside click handling & ARIA compliance
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  isClearable = false,
  size = 'md',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  id,
}) {
  const generatedId = useId();
  const dropdownId = id || generatedId;
  const listboxId = `${dropdownId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options into standard { value, label, subtitle, badge } objects
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label || String(opt.value),
      subtitle: opt.subtitle,
      badge: opt.badge,
      disabled: opt.disabled,
    };
  });

  // Filter options based on search query if searchable is enabled
  const filteredOptions = searchable && searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : normalizedOptions;

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen) {
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // Set initial highlighted index to current selected or first item
      const selIdx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Optional Label */}
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        id={dropdownId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`group relative flex items-center justify-between w-full bg-[#0A1428] border text-left transition-all duration-200 outline-none ${
          size === 'sm'
            ? 'px-3 py-2 text-xs rounded-lg'
            : 'px-4 py-3 text-sm rounded-[1.25rem]'
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-[#D9C08B]/15 bg-[#0A1428]/40 text-[#F4EEDF]/40'
            : isOpen
            ? 'border-[#D9C08B] ring-2 ring-[#D9C08B]/20 shadow-lg shadow-black/40'
            : error
            ? 'border-red-500/70 hover:border-red-400'
            : 'border-[#D9C08B]/30 hover:border-[#D9C08B]/70'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {selectedOption?.badge && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full border border-[#D9C08B]/35 bg-[#16294D] font-mono-code text-[10px] font-semibold text-[#D9C08B]">
              {selectedOption.badge}
            </span>
          )}

          <div className="min-w-0">
            {selectedOption ? (
              <span className="block truncate text-[#F4EEDF] font-medium">
                {selectedOption.label}
              </span>
            ) : (
              <span className="block truncate text-[#F4EEDF]/45">
                {placeholder}
              </span>
            )}
            {selectedOption?.subtitle && (
              <span className="block truncate text-[10px] text-[#F4EEDF]/60 font-normal">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Action icons: Clear + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0 text-[#D9C08B]/75 group-hover:text-[#D9C08B] transition-colors">
          {isClearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-[#16294D] text-[#F4EEDF]/60 hover:text-[#F4EEDF] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <ChevronDown
            aria-hidden="true"
            className={`w-4 h-4 transition-transform duration-250 ease-out text-[#D9C08B] ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* Floating Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 right-0 z-50 overflow-hidden rounded-[1.25rem] bg-[#16294D] border border-[#D9C08B]/40 shadow-2xl shadow-black/85 backdrop-blur-xl ${menuClassName}`}
          >
            {/* Search Input Filter (if searchable) */}
            {searchable && (
              <div className="p-2.5 border-b border-[#D9C08B]/15 bg-[#0A1428]/50">
                <div className="relative flex items-center">
                  <Search aria-hidden="true" className="absolute left-3 w-3.5 h-3.5 text-[#D9C08B]/60" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0A1428] border border-[#D9C08B]/25 focus:border-[#D9C08B] rounded-lg text-[#F4EEDF] placeholder-[#F4EEDF]/40 outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 p-1 text-[#F4EEDF]/60 hover:text-[#F4EEDF]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* List of Options */}
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label || placeholder}
              className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar focus:outline-none"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3.5 py-4 text-center text-xs text-[#F4EEDF]/50">
                  No matching options found
                </li>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = option.value === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={String(option.value)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                        option.disabled
                          ? 'opacity-40 cursor-not-allowed text-[#F4EEDF]/40'
                          : isSelected
                          ? 'bg-[#D9C08B]/15 text-[#D9C08B] font-semibold'
                          : isHighlighted
                          ? 'bg-[#0A1428] text-[#F4EEDF]'
                          : 'text-[#F4EEDF]/85 hover:bg-[#0A1428]/60 hover:text-[#F4EEDF]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {option.badge && (
                          <span
                            className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded font-mono-code text-[9px] font-semibold border ${
                              isSelected
                                ? 'border-[#D9C08B] text-[#D9C08B] bg-[#0A1428]'
                                : 'border-[#D9C08B]/30 text-[#D9C08B]/80 bg-[#0A1428]/60'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}

                        <div className="min-w-0">
                          <span className="block truncate">{option.label}</span>
                          {option.subtitle && (
                            <span
                              className={`block truncate text-[10px] mt-0.5 ${
                                isSelected ? 'text-[#D9C08B]/80' : 'text-[#F4EEDF]/50'
                              }`}
                            >
                              {option.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selected checkmark indicator */}
                      {isSelected && (
                        <Check aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B] shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error or Helper Message */}
      {error && (
        <p className="mt-1 text-xs text-red-400 pl-1">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-[#F4EEDF]/50 pl-1">{helperText}</p>
      )}
    </div>
  );
}
