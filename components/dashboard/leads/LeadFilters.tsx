/* filepath: components/LeadFilters.tsx */
"use client";

import { Search, X } from "lucide-react";

type LeadStatus = "new" | "contacted" | "replied" | "converted" | "lost" | "follow_up";
type LeadSource = "zameen" | "facebook" | "instagram" | "referral" | "website" | "linkedin" | "other";

interface Filters {
  search: string;
  status: LeadStatus | "all";
  source: LeadSource | "all";
  dateFrom: string;
  dateTo: string;
}

interface LeadFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const statuses: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
  { value: "follow_up", label: "Follow-up" },
];

const sources: { value: LeadSource | "all"; label: string }[] = [
  { value: "all", label: "All Sources" },
  { value: "zameen", label: "Zameen" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "other" },
];

export function LeadFilters(: JSX.Element { filters, onChange }: LeadFiltersProps) : JSX.Element {
  const hasFilters =
    filters.search || filters.status !== "all" || filters.source !== "all" || filters.dateFrom || filters.dateTo;

  const update = (field: keyof Filters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const clear = () => {
    onChange({
      search: "",
      status: "all",
      source: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search by name, agency, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors text-sm"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value as LeadStatus | "all")}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors text-sm min-w-[140px]"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => update("source", e.target.value as LeadSource | "all")}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors text-sm min-w-[140px]"
        >
          {sources.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors text-sm"
            placeholder="From"
          />
          <span className="text-text-secondary">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors text-sm"
            placeholder="To"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-white/5 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
