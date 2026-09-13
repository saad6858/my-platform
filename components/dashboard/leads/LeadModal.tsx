/* filepath: components/LeadModal.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/types/index";
import { X, Loader2 } from "lucide-react";

type LeadStatus = "new" | "contacted" | "replied" | "converted" | "lost" | "follow_up";
type LeadSource = "zameen" | "facebook" | "instagram" | "referral" | "website" | "linkedin" | "other";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
  onSubmit: (data: Omit<Lead, "id" | "createdAt" | "updatedAt">) => void;
}

const statuses: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
  { value: "follow_up", label: "Follow-up" },
];

const sources: { value: LeadSource; label: string }[] = [
  { value: "zameen", label: "Zameen" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "other" },
];

export function LeadModal(: JSX.Element { isOpen, onClose, lead, onSubmit }: LeadModalProps) : JSX.Element {
  const isEdit = !!lead;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    agency: "",
    phone: "",
    email: "",
    source: "other" as LeadSource,
    status: "new" as LeadStatus,
    dateContacted: "",
    dateFollowUp: "",
    notes: "",
    propertyInterest: "",
    budgetQuoted: "",
  });

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        agency: lead.agency || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: (lead.source as LeadSource) || "other",
        status: (lead.status as LeadStatus) || "new",
        dateContacted: lead.dateContacted || "",
        dateFollowUp: lead.dateFollowUp || "",
        notes: lead.notes || "",
        propertyInterest: lead.propertyInterest || "",
        budgetQuoted: lead.budgetQuoted?.toString() || "",
      });
    } else {
      setForm({
        name: "",
        agency: "",
        phone: "",
        email: "",
        source: "other",
        status: "new",
        dateContacted: "",
        dateFollowUp: "",
        notes: "",
        propertyInterest: "",
        budgetQuoted: "",
      });
    }
    setErrors({});
  }, [lead, isOpen]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        agency: form.agency.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        source: form.source,
        status: form.status,
        dateContacted: form.dateContacted || undefined,
        dateFollowUp: form.dateFollowUp || undefined,
        notes: form.notes.trim() || undefined,
        propertyInterest: form.propertyInterest.trim() || undefined,
        budgetQuoted: form.budgetQuoted ? parseFloat(form.budgetQuoted) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-text-primary">
                {isEdit ? "Edit Lead" : "Add Lead"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.name ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Full name"
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Agency <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.agency}
                    onChange={(e) => updateField("agency", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="Agency name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.phone ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Phone number"
                  />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => updateField("source", e.target.value as LeadSource)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  >
                    {sources.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date Contacted</label>
                  <input
                    type="date"
                    value={form.dateContacted}
                    onChange={(e) => updateField("dateContacted", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={form.dateFollowUp}
                    onChange={(e) => updateField("dateFollowUp", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Property Interest</label>
                  <input
                    type="text"
                    value={form.propertyInterest}
                    onChange={(e) => updateField("propertyInterest", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="Property name or type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Budget Quoted</label>
                  <input
                    type="number"
                    value={form.budgetQuoted}
                    onChange={(e) => updateField("budgetQuoted", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="Amount in PKR"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors resize-none"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-[var(--accent-quaternary)] text-text-primary rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Update Lead" : "Add Lead"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
