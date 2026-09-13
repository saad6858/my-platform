/* filepath: components/PortfolioFilter.tsx */
"use client";

import { motion } from "framer-motion";

interface PortfolioFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export function PortfolioFilter({
  categories,
  active,
  onChange,
}: PortfolioFilterProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 border ${
              isActive
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
