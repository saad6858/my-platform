/* filepath: components/ChartFunnel.tsx */
"use client";

import { motion } from "framer-motion";

interface FunnelData {
  stage: string;
  count: number;
  rate: number;
}

interface ChartFunnelProps {
  data: FunnelData[];
}

const stageColors = [
  "var(--text-muted)",
  "#475569",
  "var(--border-color)",
  "var(--accent-primary)",
  "var(--accent-primary)",
];

export function ChartFunnel(: JSX.Element { data }: ChartFunnelProps) : JSX.Element {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      {data.map((item, index) => {
        const widthPercent = (item.count / maxCount) * 100;
        const color = stageColors[index] || stageColors[stageColors.length - 1];

        return (
          <motion.div
            key={item.stage}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="w-28 text-right shrink-0">
              <span className="text-sm font-medium text-text-primary">
                {item.stage}
              </span>
            </div>
            <div className="flex-1 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                className="h-10 rounded-r-lg flex items-center px-3 relative"
                style={{ backgroundColor: color }}
              >
                <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                  {item.count}
                </span>
              </motion.div>
            </div>
            <div className="w-16 shrink-0">
              {index > 0 && (
                <span className="text-xs text-text-secondary">{item.rate}% conv.</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
