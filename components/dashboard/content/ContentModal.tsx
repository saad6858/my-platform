/* filepath: components/ContentModal.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Linkedin, Instagram, MessageCircle, Twitter } from "lucide-react";
import { ContentItem } from "@/types/index";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ContentItem | null;
  onSave: (data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => void;
}

const contentTypes = [
  { value: "Blog Post", label: "Blog Post", icon: FileText },
  { value: "LinkedIn", label: "LinkedIn", icon: Linkedin },
  { value: "Instagram", label: "Instagram", icon: Instagram },
  { value: "WhatsApp", label: "WhatsApp", icon: MessageCircle },
  { value: "Twitter", label: "Twitter", icon: Twitter },
];

const platforms = ["Blog", "LinkedIn", "Instagram", "WhatsApp", "Twitter"];

const statuses = ["Idea", "Draft", "Scheduled", "Published"];

const socialTypes = ["LinkedIn", "Instagram", "WhatsApp", "Twitter"];
const MAX_SOCIAL_CHARS = 500;

export function ContentModal(: JSX.Element { isOpen, onClose, item, onSave }: ContentModalProps) : JSX.Element {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Blog Post");
  const [platform, setPlatform] = useState("Blog");
  const [status, setStatus] = useState("Idea");
  const [scheduledDate, setScheduledDate] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [engagement, setEngagement] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSocial = socialTypes.includes(type);
  const charCount = content.length;
  const isOverLimit = isSocial && charCount > MAX_SOCIAL_CHARS;

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setType(item.type || "Blog Post");
      setPlatform(item.platform || "Blog");
      setStatus(item.status || "Idea");
      setContent(item.content || "");
      setUrl(item.url || "");
      setEngagement(item.engagement || 0);
      if (item.scheduledDate) {
        const date = item.scheduledDate instanceof Date
          ? item.scheduledDate
          : new Date(item.scheduledDate);
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setScheduledDate(local.toISOString().slice(0, 16));
      } else {
        setScheduledDate("");
      }
    } else {
      setTitle("");
      setType("Blog Post");
      setPlatform("Blog");
      setStatus("Idea");
      setScheduledDate("");
      setContent("");
      setUrl("");
      setEngagement(0);
    }
    setErrors({});
  }, [item, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!type) newErrors.type = "Type is required";
    if (!platform) newErrors.platform = "Platform is required";
    if (!status) newErrors.status = "Status is required";
    if (isSocial && charCount > MAX_SOCIAL_CHARS) {
      newErrors.content = `Content exceeds ${MAX_SOCIAL_CHARS} character limit`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title: title.trim(),
      type,
      platform,
      status,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      content: content.trim(),
      url: url.trim() || undefined,
      engagement,
    });
    onClose();
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const typeOption = contentTypes.find((t) => t.value === newType);
    if (typeOption) {
      setPlatform(typeOption.label);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-text-primary">
                {item ? "Edit Content" : "New Content"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                  className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors ${
                    errors.title ? "border-danger" : "border-white/10"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-danger">{errors.title}</p>
                )}
              </div>

              {/* Type & Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors ${
                      errors.type ? "border-danger" : "border-white/10"
                    }`}
                  >
                    {contentTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-danger">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors ${
                      errors.platform ? "border-danger" : "border-white/10"
                    }`}
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.platform && (
                    <p className="mt-1 text-xs text-danger">{errors.platform}</p>
                  )}
                </div>
              </div>

              {/* Status & Scheduled Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors ${
                      errors.status ? "border-danger" : "border-white/10"
                    }`}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-danger">{errors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Scheduled Date
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Content
                  </label>
                  {isSocial && (
                    <span
                      className={`text-xs ${
                        isOverLimit ? "text-danger" : "text-text-secondary"
                      }`}
                    >
                      {charCount}/{MAX_SOCIAL_CHARS}
                    </span>
                  )}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isSocial
                      ? `Write your ${type} post... (max ${MAX_SOCIAL_CHARS} chars)`
                      : "Write your content..."
                  }
                  rows={5}
                  className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors resize-none ${
                    errors.content || isOverLimit
                      ? "border-danger"
                      : "border-white/10"
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-danger">{errors.content}</p>
                )}
              </div>

              {/* URL (if published) */}
              {status === "Published" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors"
                  />
                </motion.div>
              )}

              {/* Engagement (if published) */}
              {status === "Published" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Engagement
                  </label>
                  <input
                    type="number"
                    value={engagement}
                    onChange={(e) => setEngagement(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors"
                  />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverLimit}
                  className="flex-1 px-4 py-2.5 bg-accent-quaternary hover:bg-accent-quaternary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-text-primary font-medium transition-colors"
                >
                  {item ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
