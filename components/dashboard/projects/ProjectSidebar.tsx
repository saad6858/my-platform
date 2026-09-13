/* filepath: components/ProjectSidebar.tsx */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project, ProjectClip } from "@/types/index";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Camera,
  Calendar,
  CreditCard,
  MessageCircle,
  CheckCircle,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";

type ProjectStatus = "pending" | "in_progress" | "review" | "delivered" | "paid" | "cancelled";

interface ProjectSidebarProps {
  project: Project | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Project>) => void;
  onDelete: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-white/10 text-text-secondary border-white/10" },
  in_progress: { label: "In Progress", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  review: { label: "Review", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  delivered: { label: "Delivered", color: "bg-accent-primary/20 text-accent-primary border-accent-primary/30" },
  paid: { label: "Paid", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  cancelled: { label: "Cancelled", color: "bg-danger/20 text-danger border-danger/30" },
};

function formatCurrency(amount: number): string {
  return `₨${amount.toLocaleString()}`;
}

function getProgress(clips: ProjectClip[]): number {
  if (!clips || clips.length === 0) return 0;
  const approved = clips.filter((c) => c.status === "approved").length;
  return Math.round((approved / clips.length) * 100);
}

export function ProjectSidebar(: JSX.Element { project, onClose, onUpdate, onDelete }: ProjectSidebarProps) : JSX.Element {
  const [notes, setNotes] = useState("");
  const [clips, setClips] = useState<ProjectClip[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (project) {
      setNotes(project.notes || "");
      setClips(project.clips || []);
    }
  }, [project?.id]);

  const handleNotesSave = useCallback(() => {
    if (project && notes !== project.notes) {
      onUpdate({ notes });
    }
  }, [notes, project, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNotesSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, handleNotesSave]);

  const updateClipStatus = (index: number, status: ProjectClip["status"]) => {
    const next = [...clips];
    next[index] = { ...next[index], status };
    setClips(next);
    onUpdate({ clips: next });
  };

  const updateClipUrl = (index: number, url: string) => {
    const next = [...clips];
    next[index] = { ...next[index], url };
    setClips(next);
    onUpdate({ clips: next });
  };

  const addStatusHistory = (newStatus: ProjectStatus) => {
    const entry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
    };
    const history = [...(project?.statusHistory || []), entry];
    onUpdate({ status: newStatus, statusHistory: history });
  };

  const progress = getProgress(clips);
  const remaining = (project?.price || 0) - (project?.amountPaid || 0);

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] bg-bg-secondary border-l border-white/10 overflow-y-auto"
          >
            <div className="sticky top-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-text-primary truncate pr-4">{project.propertyName}</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Client Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-primary">
                    <span className="font-medium">{project.clientName}</span>
                  </div>
                  <a
                    href={`tel:${project.clientPhone}`}
                    className="flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {project.clientPhone}
                  </a>
                  {project.clientEmail && (
                    <a
                      href={`mailto:${project.clientEmail}`}
                      className="flex items-center gap-2 text-accent-quaternary hover:text-[var(--accent-quaternary)] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {project.clientEmail}
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${project.clientPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg text-sm font-medium hover:bg-accent-primary/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-primary">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    {project.propertyLocation || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-text-primary">
                    <Camera className="w-4 h-4 text-text-secondary" />
                    {project.photoCount} photos
                  </div>
                  <div className="flex items-center gap-2 text-text-primary">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    Due: {project.dateDue ? new Date(project.dateDue).toLocaleDateString() : "—"}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Financials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Price</span>
                    <span className="text-text-primary font-medium">{formatCurrency(project.price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Amount Paid</span>
                    <span className="text-accent-primary font-medium">{formatCurrency(project.amountPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Remaining</span>
                    <span className={`font-medium ${remaining > 0 ? "text-accent-tertiary" : "text-accent-primary"}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-secondary rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((project.amountPaid || 0) / (project.price || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Clip Checklist</h3>
                  <span className="text-xs text-text-secondary">{progress}% complete</span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-quaternary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {clips.map((clip, index) => (
                    <div
                      key={clip.id}
                      className="flex items-start gap-2 p-2 bg-bg-secondary rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={clip.status === "approved"}
                        onChange={(e) =>
                          updateClipStatus(index, e.target.checked ? "approved" : "pending")
                        }
                        className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-accent-quaternary focus:ring-accent-quaternary"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-primary font-medium">{clip.name}</span>
                          <select
                            value={clip.status}
                            onChange={(e) => updateClipStatus(index, e.target.value as ProjectClip["status"])}
                            className="text-xs px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-primary focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="approved">Approved</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          {clip.photoUsed && <span>Photo: {clip.photoUsed}</span>}
                          {clip.preset && <span>Preset: {clip.preset}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={clip.url}
                            onChange={(e) => updateClipUrl(index, e.target.value)}
                            placeholder="Clip URL"
                            className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary/50"
                          />
                          {clip.url && (
                            <a
                              href={clip.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-accent-quaternary hover:text-[var(--accent-quaternary)] transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {clips.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">No clips added yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary/50 resize-none"
                  rows={4}
                  placeholder="Add notes..."
                />
                <p className="text-xs text-text-secondary/50">Auto-saves as you type</p>
              </div>

              {project.statusHistory && project.statusHistory.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Status History</h3>
                  <div className="space-y-2">
                    {[...project.statusHistory].reverse().map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-text-secondary/50" />
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs border ${
                            statusConfig[entry.status as ProjectStatus]?.color || ""
                          }`}
                        >
                          {statusConfig[entry.status as ProjectStatus]?.label || entry.status}
                        </span>
                        <span className="text-text-secondary/50 text-xs">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {project.status !== "delivered" && (
                  <button
                    onClick={() => addStatusHistory("delivered")}
                    className="w-full px-4 py-2.5 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg font-medium hover:bg-accent-primary/30 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark as Delivered
                    </span>
                  </button>
                )}
                {project.status !== "paid" && (
                  <button
                    onClick={() => addStatusHistory("paid")}
                    className="w-full px-4 py-2.5 bg-accent-quaternary/20 text-accent-quaternary border border-accent-quaternary/30 rounded-lg font-medium hover:bg-accent-quaternary/30 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Mark as Paid
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2.5 bg-danger/20 text-danger border border-danger/30 rounded-lg font-medium hover:bg-danger/30 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-bg-secondary border border-white/10 rounded-xl p-6 max-w-sm w-full"
                >
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Project</h3>
                  <p className="text-text-secondary mb-6">
                    Are you sure? This cannot be undone. <span className="text-text-primary font-medium">{project.propertyName}</span> will be permanently removed.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowDeleteConfirm(false);
                      }}
                      className="px-4 py-2 bg-danger hover:bg-danger text-text-primary rounded-lg font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
