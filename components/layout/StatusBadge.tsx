/* filepath: components/layout/StatusBadge.tsx */
"use client";

import { motion } from "framer-motion";

type StatusVariant = "lead" | "project" | "post" | "transaction" | "general";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

interface ColorConfig {
  bg: string;
  text: string;
}

const LEAD_COLORS: Record<string, ColorConfig> = {
  new: { bg: "bg-slate-500/10", text: "text-slate-400" },
  contacted: { bg: "bg-blue-500/10", text: "text-blue-400" },
  replied: { bg: "bg-amber-500/10", text: "text-amber-400" },
  sample_sent: { bg: "bg-purple-500/10", text: "text-purple-400" },
  negotiating: { bg: "bg-orange-500/10", text: "text-orange-400" },
  converted: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  lost: { bg: "bg-red-500/10", text: "text-red-400" },
  follow_up: { bg: "bg-pink-500/10", text: "text-pink-400" },
};

const PROJECT_COLORS: Record<string, ColorConfig> = {
  pending: { bg: "bg-slate-500/10", text: "text-slate-400" },
  in_progress: { bg: "bg-blue-500/10", text: "text-blue-400" },
  review: { bg: "bg-amber-500/10", text: "text-amber-400" },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  paid: { bg: "bg-green-500/10", text: "text-green-400" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400" },
};

const POST_COLORS: Record<string, ColorConfig> = {
  draft: { bg: "bg-amber-500/10", text: "text-amber-400" },
  published: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  scheduled: { bg: "bg-blue-500/10", text: "text-blue-400" },
};

const TRANSACTION_COLORS: Record<string, ColorConfig> = {
  income: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  expense: { bg: "bg-red-500/10", text: "text-red-400" },
};

const GENERAL_COLORS: Record<string, ColorConfig> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  inactive: { bg: "bg-slate-500/10", text: "text-slate-400" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400" },
  error: { bg: "bg-red-500/10", text: "text-red-400" },
  warning: { bg: "bg-orange-500/10", text: "text-orange-400" },
  info: { bg: "bg-blue-500/10", text: "text-blue-400" },
};

const VARIANT_MAP: Record<StatusVariant, Record<string, ColorConfig>> = {
  lead: LEAD_COLORS,
  project: PROJECT_COLORS,
  post: POST_COLORS,
  transaction: TRANSACTION_COLORS,
  general: GENERAL_COLORS,
};

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, variant = "general" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  const colorMap = VARIANT_MAP[variant];
  const config = colorMap[normalizedStatus] || GENERAL_COLORS.inactive;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70" />
      {formatStatusLabel(status)}
    </motion.span>
  );
}
