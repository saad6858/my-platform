/* filepath: components/SectionToggle.tsx */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function SectionToggle(: JSX.Element { label, description, enabled, onChange }: SectionToggleProps) : JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-text-primary">{label}</h4>
        <p className="text-sm text-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-quaternary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          enabled ? "bg-accent-primary" : "bg-white/20"
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Toggle {label}</span>
        <motion.span
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition-colors duration-200",
            enabled ? "bg-white" : "bg-white/50"
          )}
        />
      </button>
    </div>
  );
}
