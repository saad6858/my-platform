/* filepath: components/BroadcastModal.tsx */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Eye,
  Users,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/layout/GlassCard";
import { NewsletterSubscriber } from "./NewsletterSubscribers";
import { cn } from "@/lib/utils";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscribers: NewsletterSubscriber[];
}

export function BroadcastModal(: JSX.Element { isOpen, onClose, subscribers }: BroadcastModalProps) : JSX.Element {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const activeCount = subscribers.length;

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "broadcasts"), {
        subject: subject.trim(),
        message: message.trim(),
        recipientCount: activeCount,
        status: "pending",
        createdAt: Timestamp.now(),
        sentAt: null,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSubject("");
        setMessage("");
        setPreviewMode(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending broadcast:", error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject("");
      setMessage("");
      setPreviewMode(false);
      setSent(false);
      onClose();
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-bg-secondary border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-quaternary/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-accent-quaternary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Send Broadcast</h3>
                  <p className="text-sm text-text-secondary flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {activeCount} active subscribers
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={sending}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sent Success */}
              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg"
                  >
                    <div className="p-1.5 bg-accent-primary/20 rounded-full">
                      <Check className="w-4 h-4 text-accent-primary" />
                    </div>
                    <p className="text-sm text-accent-primary font-medium">
                      Broadcast queued for delivery to {activeCount} subscribers
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!sent && (
                <>
                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      disabled={sending}
                      className="w-full px-3 py-2 bg-bg-primary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary disabled:opacity-50"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-text-primary">
                        Message
                      </label>
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-1 text-xs text-accent-quaternary hover:text-accent-quaternary/80 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {previewMode ? "Edit" : "Preview"}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {previewMode ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <GlassCard className="p-4 min-h-[200px]">
                            <div className="border-b border-white/10 pb-3 mb-3">
                              <p className="text-xs text-text-secondary">Subject: {subject || "(no subject)"}</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <p className="text-sm text-text-primary whitespace-pre-wrap">
                                {message || "(no message)"}
                              </p>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="editor"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="Write your message here..."
                            disabled={sending}
                            className="w-full px-3 py-2 bg-bg-primary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary resize-none disabled:opacity-50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-2 p-3 bg-accent-tertiary/5 border border-amber-500/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-accent-tertiary mt-0.5 shrink-0" />
                    <p className="text-xs text-accent-tertiary/80">
                      This will log the broadcast to Firestore. Actual email delivery requires integration with an email service provider (e.g., SendGrid, Resend).
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!sent && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                <button
                  onClick={handleClose}
                  disabled={sending}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!subject.trim() || !message.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
