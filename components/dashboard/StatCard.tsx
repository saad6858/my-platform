/* filepath: components/StatCard.tsx */
"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  trend?: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  color?: string;
}

function CountUp({ target, duration = 1500, prefix = "", suffix = "" }: {
  target: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  const formatNumber = (num: number) => {
    if (num >= 100000) return `${prefix}${(num / 1000).toFixed(0)}k${suffix}`;
    if (num >= 1000) return `${prefix}${num.toLocaleString()}${suffix}`;
    return `${prefix}${num}${suffix}`;
  };

  return <span>{formatNumber(display)}</span>;
}

export function StatCard({ title, value, trend, prefix = "", suffix = "", icon: Icon, color = "var(--accent-quaternary)" }: StatCardProps): JSX.Element {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--bg-secondary)]/50 bg-bg-secondary/80 p-6 transition-all duration-300 hover:border-accent-quaternary/30 hover:shadow-lg hover:shadow-accent-quaternary/5"
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(600px circle at 50% 0%, ${color}08, transparent 60%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
            <Icon className="h-6 w-6" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend > 0 ? "bg-accent-primary/10 text-accent-primary" : trend < 0 ? "bg-danger/10 text-danger" : "bg-[var(--border-color)]/50 text-text-secondary"
            }`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {trend > 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
            <CountUp target={value} prefix={prefix} suffix={suffix} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
