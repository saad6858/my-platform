"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { CountUp } from "@/components/animations/CountUp";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const stats = [
  { value: 50, suffix: "+", label: "Agents Contacted" },
  { value: 4, suffix: "", label: "AI Videos Generated" },
  { value: 1, suffix: "", label: "Platform Built" },
  { value: 0, suffix: "∞", label: "Ambition", isInfinity: true },
];

function StatItem({
  stat,
  index,
}: {
  stat: (typeof stats)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative flex flex-col items-center text-center px-4 py-6"
    >
      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2">
        {stat.isInfinity ? (
          <span className="text-emerald-400">∞</span>
        ) : (
          <CountUp end={stat.value} suffix={stat.suffix} />
        )}
      </div>
      <div className="text-sm sm:text-base text-slate-400 font-medium tracking-wide">
        {stat.label}
      </div>
    </motion.div>
  );
}

export function Stats() {
  const { settings, loading } = useSiteSettings();

  if (loading) return null;
  if (settings.sections?.stats === false) return null;

  return (
    <SectionWrapper className="bg-bg-secondary border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
          {stats.map((stat, index) => (
            <div key={stat.label} className="relative">
              <StatItem stat={stat} index={index} />
              {index < stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
