/* filepath: components/ContactDetailModal.tsx */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Reply,
  Archive,
  Trash2,
  Check,
  Send,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { ContactSubmission, ContactStatus } from "./ContactSubmissions";
import { cn } from "@/lib/utils";

interface ContactDetailModalProps {
  contact: ContactSubmission | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ContactStatus) => void;
  onReply: (id: string, replyMessage: string) => void;
  onDelete: (id: string) => void;
}

const statusOptions: { value: ContactStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-accent-primary/20 text-accent-primary border-accent-primary/30" },
  { value: "read", label: "Read", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  { value: "replied", label: "Replied", color: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30" },
  { value: "archived", label: "Archived", color: "bg-white/10 text-text-secondary border-white/10" },
];

export function ContactDetailModal(: JSX.Element {
  contact,
  onClose,
  onStatusChange,
  onReply,
  onDelete,
}: ContactDetailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sending, setSending] = useState(false);

  if (!contact) return null;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(contact.id, replyText);
    setReplyText("");
    setShowReplyForm(false);
    setSending(false);
  };

  const formatDate = (date: Date | string | Timestamp | null) => {
    if (!date) return "—";
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentStatus = statusOptions.find((s) => s.value === contact.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-bg-secondary border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-quaternary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent-quaternary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{contact.name}</h3>
                <p className="text-sm text-text-secondary">{contact.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status & Meta */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Status:</span>
                <div className="relative group">
                  <button
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer",
                      currentStatus?.color
                    )}
                  >
                    {currentStatus?.label}
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-10 bg-bg-primary border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => onStatusChange(contact.id, status.value)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors",
                          contact.status === status.value ? "text-text-primary" : "text-text-secondary"
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(contact.createdAt)}
              </div>
              {contact.source && (
                <span className="text-xs px-2 py-0.5 bg-white/5 rounded text-text-secondary">
                  Source: {contact.source}
                </span>
              )}
            </div>

            {/* Contact Info Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {contact.phone && (
                <div className="flex items-center gap-2 p-3 bg-bg-primary rounded-lg border border-white/5">
                  <Phone className="w-4 h-4 text-accent-quaternary" />
                  <div>
                    <p className="text-xs text-text-secondary">Phone</p>
                    <p className="text-sm text-text-primary">{contact.phone}</p>
                  </div>
                </div>
              )}
              {contact.service && (
                <div className="flex items-center gap-2 p-3 bg-bg-primary rounded-lg border border-white/5">
                  <MessageSquare className="w-4 h-4 text-accent-quaternary" />
                  <div>
                    <p className="text-xs text-text-secondary">Service</p>
                    <p className="text-sm text-text-primary">{contact.service}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message */}
            <GlassCard className="p-4">
              <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent-quaternary" />
                Message
              </h4>
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {contact.message}
              </p>
            </GlassCard>

            {/* Reply History */}
            {contact.replyMessage && (
              <GlassCard className="p-4 border-amber-500/20">
                <h4 className="text-sm font-medium text-accent-tertiary mb-2 flex items-center gap-2">
                  <Reply className="w-4 h-4" />
                  Your Reply
                  {contact.repliedAt && (
                    <span className="text-xs text-text-secondary ml-auto">
                      {formatDate(contact.repliedAt)}
                    </span>
                  )}
                </h4>
                <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {contact.replyMessage}
                </p>
              </GlassCard>
            )}

            {/* Reply Form */}
            <AnimatePresence>
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-medium text-text-primary">Reply Message</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 bg-bg-primary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary resize-none"
                  />
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText("");
                      }}
                      className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || sending}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {!showReplyForm && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                {contact.status !== "read" && contact.status !== "replied" && (
                  <button
                    onClick={() => onStatusChange(contact.id, "read")}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary/20 text-accent-quaternary rounded-lg text-sm font-medium hover:bg-accent-quaternary/30 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => onStatusChange(contact.id, "archived")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-text-secondary rounded-lg text-sm font-medium hover:bg-bg-primary0/30 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => {
                    onDelete(contact.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-danger/20 text-danger rounded-lg text-sm font-medium hover:bg-danger/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
