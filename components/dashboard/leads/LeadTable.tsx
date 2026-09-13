/* filepath: components/LeadTable.tsx */
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/types/index";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  AlertCircle,
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "replied" | "converted" | "lost" | "follow_up";
type LeadSource = "zameen" | "facebook" | "instagram" | "referral" | "website" | "linkedin" | "other";
type SortKey = keyof Lead;
type SortDir = "asc" | "desc";

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  contacted: { label: "Contacted", color: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30" },
  replied: { label: "Replied", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  sample_sent: { label: "Sample Sent", color: "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30" },
  negotiating: { label: "Negotiating", color: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30" },
  converted: { label: "Converted", color: "bg-accent-primary/20 text-accent-primary border-accent-primary/30" },
  lost: { label: "Lost", color: "bg-danger/20 text-danger border-danger/30" },
  follow_up: { label: "Follow-up", color: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30" },
};

const sourceColors: Record<LeadSource, string> = {
  zameen: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30",
  facebook: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30",
  instagram: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30",
  referral: "bg-accent-primary/20 text-accent-primary border-accent-primary/30",
  website: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30",
  linkedin: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  other: "bg-white/10 text-text-secondary border-white/10",
};

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function LeadTable(: JSX.Element { leads, onEdit, onDelete, onView, onStatusChange }: LeadTableProps) : JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const perPage = 15;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedLeads = useMemo(() => {
    const sorted = [...leads];
    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDir === "asc" ? -1 : 1;
      if (bVal == null) return sortDir === "asc" ? 1 : -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [leads, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedLeads.length / perPage);
  const paginatedLeads = sortedLeads.slice((page - 1) * perPage, page * perPage);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="inline-block w-4" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && selectedIds.size === paginatedLeads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-quaternary focus:ring-accent-quaternary"
                  />
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">Name <SortIcon column="name" /></span>
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("agency")}
                >
                  <span className="inline-flex items-center gap-1">Agency <SortIcon column="agency" /></span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("source")}
                >
                  <span className="inline-flex items-center gap-1">Source <SortIcon column="source" /></span>
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <span className="inline-flex items-center gap-1">Status <SortIcon column="status" /></span>
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("dateContacted")}
                >
                  <span className="inline-flex items-center gap-1">Last Contacted <SortIcon column="dateContacted" /></span>
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => handleSort("dateFollowUp")}
                >
                  <span className="inline-flex items-center gap-1">Follow-up <SortIcon column="dateFollowUp" /></span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => {
                const status = lead.status as LeadStatus;
                const source = lead.source as LeadSource;
                const overdue = isOverdue(lead.dateFollowUp || "");
                const today = isToday(lead.dateFollowUp || "");

                return (
                  <>
                    <tr
                      key={lead.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-quaternary focus:ring-accent-quaternary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-text-primary">{lead.name}</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{lead.agency}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-accent-primary hover:text-accent-secondary transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                            sourceColors[source] || sourceColors.other
                          }`}
                        >
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                            statusConfig[status]?.color || ""
                          }`}
                        >
                          {status === "follow_up" && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-tertiary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-tertiary" />
                            </span>
                          )}
                          {statusConfig[status]?.label || lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm">
                        {formatRelativeTime(lead.dateContacted || "")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {lead.dateFollowUp ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              overdue
                                ? "text-danger font-bold"
                                : today
                                ? "text-accent-tertiary font-semibold"
                                : "text-text-secondary"
                            }`}
                          >
                            {overdue && <AlertCircle className="w-3 h-3" />}
                            {new Date(lead.dateFollowUp).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(lead);
                            }}
                            className="p-1.5 text-text-secondary hover:text-accent-quaternary hover:bg-accent-quaternary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(lead);
                            }}
                            className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(lead);
                            }}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === lead.id && (
                        <motion.tr
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={9} className="px-4 py-4 bg-bg-primary/50">
                            <div className="space-y-4">
                              {lead.messages && lead.messages.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-text-primary">Message History</h4>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {lead.messages.map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`flex ${msg.type === "outbound" ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                                            msg.type === "outbound"
                                              ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                                              : "bg-white/5 text-text-primary border border-white/10"
                                          }`}
                                        >
                                          {msg.content}
                                          <div className="text-[10px] opacity-60 mt-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Notes</label>
                                  <textarea
                                    defaultValue={lead.notes || ""}
                                    readOnly
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm resize-none"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Property Interest</label>
                                  <p className="text-text-primary text-sm">{lead.propertyInterest || "—"}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Budget Quoted</label>
                                  <p className="text-text-primary text-sm">
                                    {lead.budgetQuoted ? `₨${lead.budgetQuoted.toLocaleString()}` : "—"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => onStatusChange(lead.id, "converted")}
                                  className="px-3 py-2 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg text-sm font-medium hover:bg-accent-primary/30 transition-colors"
                                >
                                  Mark Converted
                                </button>
                                <button
                                  onClick={() => onStatusChange(lead.id, "lost")}
                                  className="px-3 py-2 bg-danger/20 text-danger border border-danger/30 rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors"
                                >
                                  Mark Lost
                                </button>
                                <button
                                  onClick={() => onStatusChange(lead.id, "follow_up")}
                                  className="px-3 py-2 bg-accent-tertiary/20 text-accent-tertiary border border-accent-tertiary/30 rounded-lg text-sm font-medium hover:bg-accent-tertiary/30 transition-colors"
                                >
                                  Set Follow-up
                                </button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
              {paginatedLeads.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-secondary">
                    No leads match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-sm text-text-secondary">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sortedLeads.length)} of {sortedLeads.length} leads
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-primary">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-3">
        {paginatedLeads.map((lead) => {
          const status = lead.status as LeadStatus;
          const source = lead.source as LeadSource;
          const overdue = isOverdue(lead.dateFollowUp || "");
          const today = isToday(lead.dateFollowUp || "");

          return (
            <div
              key={lead.id}
              className="bg-bg-secondary border border-white/10 rounded-xl p-4 space-y-3"
              onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-text-primary">{lead.name}</h4>
                  <p className="text-sm text-text-secondary">{lead.agency}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                    statusConfig[status]?.color || ""
                  }`}
                >
                  {status === "follow_up" && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-tertiary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-tertiary" />
                    </span>
                  )}
                  {statusConfig[status]?.label || lead.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <a
                  href={`tel:${lead.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-accent-primary"
                >
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </a>
                <span className="text-text-secondary">|</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                    sourceColors[source] || sourceColors.other
                  }`}
                >
                  {lead.source}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  Follow-up:{" "}
                  {lead.dateFollowUp ? (
                    <span className={overdue ? "text-danger font-bold" : today ? "text-accent-tertiary font-semibold" : "text-text-primary"}>
                      {new Date(lead.dateFollowUp).toLocaleDateString()}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="text-text-secondary">{formatRelativeTime(lead.dateContacted || "")}</span>
              </div>

              <AnimatePresence>
                {expandedId === lead.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      {lead.messages && lead.messages.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {lead.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.type === "outbound" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                                  msg.type === "outbound"
                                    ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                                    : "bg-white/5 text-text-primary border border-white/10"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-text-secondary">Property:</span>{" "}
                          <span className="text-text-primary">{lead.propertyInterest || "—"}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Budget:</span>{" "}
                          <span className="text-text-primary">
                            {lead.budgetQuoted ? `₨${lead.budgetQuoted.toLocaleString()}` : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(lead);
                          }}
                          className="flex-1 px-3 py-2 bg-accent-quaternary/20 text-accent-quaternary border border-accent-quaternary/30 rounded-lg text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lead);
                          }}
                          className="flex-1 px-3 py-2 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(lead);
                          }}
                          className="flex-1 px-3 py-2 bg-danger/20 text-danger border border-danger/30 rounded-lg text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
