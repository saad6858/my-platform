/* filepath: components/ProjectModal.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project, ProjectClip } from "@/types/index";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

type ProjectStatus = "pending" | "in_progress" | "review" | "delivered" | "paid" | "cancelled";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSubmit: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
}

const statuses: { value: ProjectStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "delivered", label: "Delivered" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

function generateClips(photoCount: number): ProjectClip[] {
  const clips: ProjectClip[] = [];
  const count = Math.min(photoCount, 20);
  for (let i = 1; i <= count; i++) {
    clips.push({
      id: `clip-${i}`,
      name: `Clip ${i}`,
      photoUsed: "",
      preset: "",
      status: "pending",
      url: "",
    });
  }
  return clips;
}

export function ProjectModal(: JSX.Element { isOpen, onClose, project, onSubmit }: ProjectModalProps) : JSX.Element {
  const isEdit = !!project;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    propertyName: "",
    propertyLocation: "",
    photoCount: "",
    price: "",
    amountPaid: "",
    dateDue: "",
    notes: "",
    status: "pending" as ProjectStatus,
    clips: [] as ProjectClip[],
  });

  useEffect(() => {
    if (project) {
      setForm({
        clientName: project.clientName || "",
        clientPhone: project.clientPhone || "",
        clientEmail: project.clientEmail || "",
        propertyName: project.propertyName || "",
        propertyLocation: project.propertyLocation || "",
        photoCount: project.photoCount?.toString() || "",
        price: project.price?.toString() || "",
        amountPaid: project.amountPaid?.toString() || "",
        dateDue: project.dateDue || "",
        notes: project.notes || "",
        status: (project.status as ProjectStatus) || "pending",
        clips: project.clips || [],
      });
    } else {
      setForm({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        propertyName: "",
        propertyLocation: "",
        photoCount: "",
        price: "",
        amountPaid: "",
        dateDue: "",
        notes: "",
        status: "pending",
        clips: [],
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.clientName.trim()) nextErrors.clientName = "Client name is required";
    if (!form.clientPhone.trim()) nextErrors.clientPhone = "Client phone is required";
    if (!form.propertyName.trim()) nextErrors.propertyName = "Property name is required";
    if (!form.photoCount.trim()) nextErrors.photoCount = "Photo count is required";
    if (!form.price.trim()) nextErrors.price = "Price is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setForm((prev) => ({
      ...prev,
      photoCount: value,
      clips: count > 0 ? generateClips(count) : [],
    }));
  };

  const updateClip = (index: number, field: keyof ProjectClip, value: string) => {
    setForm((prev) => {
      const nextClips = [...prev.clips];
      nextClips[index] = { ...nextClips[index], [field]: value };
      return { ...prev, clips: nextClips };
    });
  };

  const addClip = () => {
    setForm((prev) => ({
      ...prev,
      clips: [
        ...prev.clips,
        {
          id: `clip-${prev.clips.length + 1}`,
          name: `Clip ${prev.clips.length + 1}`,
          photoUsed: "",
          preset: "",
          status: "pending",
          url: "",
        },
      ],
    }));
  };

  const removeClip = (index: number) => {
    setForm((prev) => ({
      ...prev,
      clips: prev.clips.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        clientEmail: form.clientEmail.trim() || undefined,
        propertyName: form.propertyName.trim(),
        propertyLocation: form.propertyLocation.trim() || undefined,
        photoCount: parseInt(form.photoCount),
        price: parseFloat(form.price),
        amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : 0,
        dateDue: form.dateDue || undefined,
        notes: form.notes.trim() || undefined,
        status: form.status,
        clips: form.clips,
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
            className="bg-bg-secondary border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-text-primary">
                {isEdit ? "Edit Project" : "New Project"}
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
                    Client Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.clientName ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Client name"
                  />
                  {errors.clientName && <p className="text-danger text-xs mt-1">{errors.clientName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Client Phone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => updateField("clientPhone", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.clientPhone ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Phone number"
                  />
                  {errors.clientPhone && <p className="text-danger text-xs mt-1">{errors.clientPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Client Email</label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => updateField("clientEmail", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Property Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.propertyName}
                    onChange={(e) => updateField("propertyName", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.propertyName ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Property name"
                  />
                  {errors.propertyName && <p className="text-danger text-xs mt-1">{errors.propertyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Property Location</label>
                  <input
                    type="text"
                    value={form.propertyLocation}
                    onChange={(e) => updateField("propertyLocation", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="Location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Photo Count <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.photoCount}
                    onChange={(e) => handlePhotoCountChange(e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.photoCount ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Number of photos"
                  />
                  {errors.photoCount && <p className="text-danger text-xs mt-1">{errors.photoCount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Price (PKR) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors ${
                      errors.price ? "border-danger/50" : "border-white/10"
                    }`}
                    placeholder="Total price"
                  />
                  {errors.price && <p className="text-danger text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Amount Paid</label>
                  <input
                    type="number"
                    min="0"
                    value={form.amountPaid}
                    onChange={(e) => updateField("amountPaid", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                    placeholder="Amount paid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dateDue}
                    onChange={(e) => updateField("dateDue", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary/50 transition-colors"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50 transition-colors resize-none"
                  rows={3}
                  placeholder="Project notes..."
                />
              </div>

              {form.clips.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text-secondary">Clip Checklist</label>
                    <button
                      type="button"
                      onClick={addClip}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent-quaternary/20 text-accent-quaternary border border-accent-quaternary/30 rounded-lg hover:bg-accent-quaternary/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Clip
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {form.clips.map((clip, index) => (
                      <div
                        key={clip.id}
                        className="grid grid-cols-12 gap-2 items-center p-2 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={clip.name}
                            onChange={(e) => updateClip(index, "name", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-secondary border border-white/10 rounded text-xs text-text-primary focus:outline-none focus:border-accent-quaternary/50"
                            placeholder="Clip name"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={clip.photoUsed}
                            onChange={(e) => updateClip(index, "photoUsed", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-secondary border border-white/10 rounded text-xs text-text-primary focus:outline-none focus:border-accent-quaternary/50"
                            placeholder="Photo used"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={clip.preset}
                            onChange={(e) => updateClip(index, "preset", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-secondary border border-white/10 rounded text-xs text-text-primary focus:outline-none focus:border-accent-quaternary/50"
                            placeholder="Preset"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={clip.status}
                            onChange={(e) => updateClip(index, "status", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-secondary border border-white/10 rounded text-xs text-text-primary focus:outline-none focus:border-accent-quaternary/50"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="approved">Approved</option>
                          </select>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeClip(index)}
                            className="p-1 text-text-secondary/50 hover:text-danger transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  {isEdit ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
