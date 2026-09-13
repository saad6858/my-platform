/* filepath: components/layout/SectionLabel.tsx */
"use client";

import { motion } from "framer-motion";

interface SectionLabelProps {
  text: string;
  className?: string;
}

export function SectionLabel({ text, className = "" }: SectionLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-center gap-3 ${className}`}
    >
      <span className="w-8 h-px bg-emerald-500" />
      <span className="font-mono text-emerald-400 text-xs uppercase tracking-[0.2em]">
        {text}
      </span>
    </motion.div>
  );
}
