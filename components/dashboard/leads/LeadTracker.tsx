/* filepath: components/LeadTracker.tsx */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { LeadTable } from "@/components/LeadTable";
import { LeadModal } from "@/components/LeadModal";
import { LeadFilters } from "@/components/LeadFilters";
import { Lead } from "@/types/index";
import {
  Plus,
  Users,
  UserPlus,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "replied" | "converted" | "lost" | "follow_up";
type LeadSource = "zameen" | "facebook" | "instagram" | "referral" | "website" | "linkedin" | "other";

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

interface Filters {
  search: string;
  status: LeadStatus | "all";
  source: LeadSource | "all";
  dateFrom: string;
  dateTo: string;
}

export default function LeadTrackerPage() : JSX.Element {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    source: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leadsData: Lead[] = [];
        snapshot.forEach((docSnap) => {
          leadsData.push({ id: docSnap.id, ...docSnap.data() } as Lead);
        });
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leads:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      replied: leads.filter((l) => l.status === "replied").length,
      converted: leads.filter((l) => l.status === "converted").length,
      lost: leads.filter((l) => l.status === "lost").length,
      followUp: leads.filter((l) => l.status === "follow_up").length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !filters.search ||
        lead.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.agency?.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.phone?.includes(filters.search);

      const matchesStatus =
        selectedStatus !== "all"
          ? lead.status === selectedStatus
          : filters.status === "all" || lead.status === filters.status;

      const matchesSource = filters.source === "all" || lead.source === filters.source;

      const matchesDateFrom = !filters.dateFrom || (lead.dateContacted && lead.dateContacted >= filters.dateFrom);
      const matchesDateTo = !filters.dateTo || (lead.dateContacted && lead.dateContacted <= filters.dateTo);

      return matchesSearch && matchesStatus && matchesSource && matchesDateFrom && matchesDateTo;
    });
  }, [leads, filters, selectedStatus]);

  const handleAddLead = async (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "leads"), {
        ...leadData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const handleEditLead = async (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    if (!editingLead) return;
    try {
      const ref = doc(db, "leads", editingLead.id);
      await updateDoc(ref, {
        ...leadData,
        updatedAt: Timestamp.now(),
      });
      setEditingLead(null);
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const handleDeleteLead = async () => {
    if (!deletingLead) return;
    try {
      await deleteDoc(doc(db, "leads", deletingLead.id));
      setDeletingLead(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const ref = doc(db, "leads", leadId);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const exportCSV = useCallback(() => {
    const headers = ["Name", "Agency", "Phone", "Email", "Source", "Status", "Date Contacted", "Follow-up Date", "Property Interest", "Budget Quoted", "Notes"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.agency,
      lead.phone,
      lead.email || "",
      lead.source,
      lead.status,
      lead.dateContacted || "",
      lead.dateFollowUp || "",
      lead.propertyInterest || "",
      lead.budgetQuoted?.toString() || "",
      lead.notes || "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"")}"`).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLeads]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Lead Tracker</h1>
              <p className="text-text-secondary mt-1">Manage and track all your leads in one place</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-primary text-text-primary rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {([
              { key: "total" as const, label: "Total", count: stats.total },
              { key: "new" as const, label: "New", count: stats.new },
              { key: "contacted" as const, label: "Contacted", count: stats.contacted },
              { key: "replied" as const, label: "Replied", count: stats.replied },
              { key: "converted" as const, label: "Converted", count: stats.converted },
              { key: "lost" as const, label: "Lost", count: stats.lost },
              { key: "followUp" as const, label: "Follow-up", count: stats.followUp },
            ]).map((stat) => (
              <button
                key={stat.key}
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus === (stat.key === "followUp" ? "follow_up" : stat.key === "total" ? "all" : stat.key)
                      ? "all"
                      : stat.key === "followUp"
                      ? "follow_up"
                      : stat.key === "total"
                      ? "all"
                      : stat.key
                  )
                }
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedStatus ===
                  (stat.key === "followUp" ? "follow_up" : stat.key === "total" ? "all" : stat.key)
                    ? "bg-accent-quaternary/20 border-accent-quaternary/50"
                    : "bg-bg-secondary border-white/10 hover:border-white/20"
                }`}
              >
                <div className="text-2xl font-bold text-text-primary">{stat.count}</div>
                <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <LeadFilters filters={filters} onChange={setFilters} />
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex justify-end">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-bg-secondary border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-accent-quaternary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No leads yet</h3>
              <p className="text-text-secondary mb-6">Add your first lead to get started.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-primary text-text-primary rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </GlassCard>
          ) : (
            <LeadTable
              leads={filteredLeads}
              onEdit={(lead) => setEditingLead(lead)}
              onDelete={(lead) => setDeletingLead(lead)}
              onView={(lead) => setViewingLead(lead)}
              onStatusChange={handleStatusChange}
            />
          )}
        </FadeIn>

        <LeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddLead}
        />

        <LeadModal
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          lead={editingLead || undefined}
          onSubmit={handleEditLead}
        />

        <AnimatePresence>
          {deletingLead && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setDeletingLead(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-bg-secondary border border-white/10 rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">Delete Lead</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure? This cannot be undone.{" "}
                  <span className="text-text-primary font-medium">{deletingLead.name}</span> will be permanently removed.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeletingLead(null)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLead}
                    className="px-4 py-2 bg-danger hover:bg-danger text-text-primary rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewingLead && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setViewingLead(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-bg-secondary border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary">{viewingLead.name}</h3>
                  <button onClick={() => setViewingLead(null)} className="text-text-secondary hover:text-text-primary">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Agency</label>
                      <p className="text-text-primary font-medium">{viewingLead.agency}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Phone</label>
                      <a href={`tel:${viewingLead.phone}`} className="text-accent-primary font-medium block hover:underline">
                        {viewingLead.phone}
                      </a>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Source</label>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs border mt-1 ${
                          sourceColors[viewingLead.source as LeadSource] || sourceColors.other
                        }`}
                      >
                        {viewingLead.source}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Status</label>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs border mt-1 ${
                          statusConfig[viewingLead.status as LeadStatus]?.color || ""
                        }`}
                      >
                        {statusConfig[viewingLead.status as LeadStatus]?.label || viewingLead.status}
                      </span>
                    </div>
                  </div>

                  {viewingLead.messages && viewingLead.messages.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Message History</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {viewingLead.messages.map((msg) => (
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
                              <div className="text-[10px] opacity-60 mt-1">
                                {new Date(msg.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-text-secondary uppercase tracking-wider">Notes</label>
                    <textarea
                      defaultValue={viewingLead.notes || ""}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary/50 resize-none"
                      rows={3}
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Property Interest</label>
                      <p className="text-text-primary text-sm">{viewingLead.propertyInterest || "—"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wider">Budget Quoted</label>
                      <p className="text-text-primary text-sm">
                        {viewingLead.budgetQuoted ? `₨${viewingLead.budgetQuoted.toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        handleStatusChange(viewingLead.id, "converted");
                        setViewingLead(null);
                      }}
                      className="px-3 py-2 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg text-sm font-medium hover:bg-accent-primary/30 transition-colors"
                    >
                      Mark Converted
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(viewingLead.id, "lost");
                        setViewingLead(null);
                      }}
                      className="px-3 py-2 bg-danger/20 text-danger border border-danger/30 rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors"
                    >
                      Mark Lost
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(viewingLead.id, "follow_up");
                        setViewingLead(null);
                      }}
                      className="px-3 py-2 bg-accent-tertiary/20 text-accent-tertiary border border-accent-tertiary/30 rounded-lg text-sm font-medium hover:bg-accent-tertiary/30 transition-colors"
                    >
                      Set Follow-up
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
