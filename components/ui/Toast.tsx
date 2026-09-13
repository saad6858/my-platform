/* filepath: components/Toast.tsx */
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const TYPE_STYLES: Record<ToastType, { border: string; icon: typeof CheckCircle }> = {
  success: { border: "border-l-accent-primary", icon: CheckCircle },
  error: { border: "border-l-red-500", icon: AlertCircle },
  warning: { border: "border-l-amber-500", icon: AlertTriangle },
  info: { border: "border-l-accent-quaternary", icon: Info },
};

export function Toast({ toast, onClose }: ToastProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const style = TYPE_STYLES[toast.type];
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-white/10 bg-bg-secondary/90 backdrop-blur-xl p-4 shadow-xl",
        "border-l-4",
        style.border
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          toast.type === "success" && "text-accent-primary",
          toast.type === "error" && "text-danger",
          toast.type === "warning" && "text-accent-tertiary",
          toast.type === "info" && "text-accent-quaternary"
        )}
      />
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-text-secondary transition-colors hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps): JSX.Element {
  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 sm:right-6 sm:top-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
