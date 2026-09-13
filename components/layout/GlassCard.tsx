"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
            }
          : undefined
      }
      className={`
        bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6
        transition-all duration-500
        ${
          hover
            ? "hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
            : ""
        }
        ${glow ? "shadow-[0_0_40px_rgba(16,185,129,0.1)]" : ""}
        ${className}
      `}
      style={{
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </motion.div>
  );
}
