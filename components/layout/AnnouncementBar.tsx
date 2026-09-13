/* filepath: components/layout/AnnouncementBar.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface AnnouncementData {
  enabled: boolean;
  text: string;
  link?: string;
  linkText?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

const STORAGE_KEY = "announcement_dismissed_at";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function AnnouncementBar() {
  const { settings, loading } = useSiteSettings();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          setIsDismissed(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // localStorage not available
    }
  };

  if (!isMounted || loading) return null;

  const announcement: AnnouncementData | undefined = settings?.announcement;

  if (!announcement?.enabled || isDismissed) return null;

  const bgColor = announcement.bgColor || "bg-emerald-500/10";
  const textColor = announcement.textColor || "text-emerald-400";
  const borderColor = announcement.borderColor || "border-emerald-500/20";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 ${bgColor} ${borderColor} border-b overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className={`text-sm font-medium ${textColor} truncate`}>
                {announcement.text}
              </p>
              {announcement.link && (
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${textColor} hover:underline shrink-0`}
                >
                  {announcement.linkText || "Learn more"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className={`ml-4 p-1 rounded-md ${textColor} hover:bg-white/10 transition-colors shrink-0`}
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
