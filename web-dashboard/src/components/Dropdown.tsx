import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: { text: string; className: string };
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string;
  searchable?: boolean;
  className?: string;
  label?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  emptyMessage?: string;
  clearable?: boolean;
}

export default function Dropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  loading = false,
  error,
  searchable = false,
  className = "",
  label,
  hint,
  icon: Icon,
  emptyMessage = "Tidak ada data",
  clearable = false,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable && search.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
    if (!open) {
      setSearch("");
      setFocusedIdx(0);
    }
  }, [open, searchable]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const child = listRef.current.children[focusedIdx] as HTMLElement | undefined;
    child?.scrollIntoView({ block: "nearest" });
  }, [open, focusedIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[focusedIdx]) {
          onChange(filtered[focusedIdx].value);
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const LoadingSkeleton = () => (
    <div className="p-2 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="flex-1 space-y-1">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !loading && !error && setOpen(!open)}
        disabled={loading || !!error}
        className={`
          w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl border
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30
          ${open ? "border-primary-400 ring-2 ring-primary-500/20 shadow-sm" : "border-gray-200 hover:border-gray-300"}
          ${error ? "border-danger-400 bg-danger-50/30" : "bg-white"}
          ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Loading indicator */}
        {loading ? (
          <div className="flex items-center gap-3 w-full">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin flex-shrink-0" />
            <span className="text-gray-400">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 w-full">
            <ExclamationCircleIcon className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <span className="text-danger-600 text-sm truncate">{error}</span>
          </div>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <div className="flex-1 text-left min-w-0">
              {selected ? (
                <div className="flex items-center gap-2">
                  {selected.icon && <selected.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  <span className="text-gray-900 font-medium truncate">{selected.label}</span>
                  {selected.badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0 ${selected.badge.className}`}>
                      {selected.badge.text}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </div>
            {clearable && selected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null as unknown as T);
                }}
                className="p-0.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Hint */}
      {hint && (
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
          💡 {hint}
        </p>
      )}

      {/* Dropdown Menu */}
      {open && !loading && !error && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 animate-dropdown-in overflow-hidden">
          {/* Search */}
          {searchable && options.length > 8 && (
            <div className="relative border-b border-gray-100">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setFocusedIdx(0); }}
                placeholder="Cari..."
                className="w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none bg-transparent"
              />
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-8 px-4 text-center">
                <MagnifyingGlassIcon className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">{emptyMessage}</p>
              </div>
            ) : (
              filtered.map((option, idx) => {
                const isSelected = option.value === value;
                const isFocused = idx === focusedIdx;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    className={`
                      w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm
                      transition-colors duration-100
                      ${isSelected ? "bg-primary-50 text-primary-700" : "text-gray-700"}
                      ${isFocused && !isSelected ? "bg-gray-50" : ""}
                    `}
                  >
                    {option.icon && (
                      <div className={`mt-0.5 flex-shrink-0 ${isSelected ? "text-primary-500" : "text-gray-400"}`}>
                        <option.icon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${isSelected ? "font-semibold" : ""}`}>
                          {option.label}
                        </span>
                        {option.badge && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0 ${option.badge.className}`}>
                            {option.badge.text}
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? "text-primary-500" : "text-gray-500"}`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {options.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                {filtered.length === options.length
                  ? `${options.length} opsi`
                  : `${filtered.length} dari ${options.length} opsi`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
