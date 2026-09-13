"use client";

import { ReactNode } from "react";

interface GlowBorderProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function GlowBorder({
  children,
  className = "",
  colors = ["#10b981", "#34d399", "#6366f1", "#10b981"],
}: GlowBorderProps) {
  const gradientColors = colors.join(", ");

  return (
    <div className={`relative ${className}`}>
      <style jsx>{`
        @keyframes glow-rotate {
          0% {
            --angle: 0deg;
          }
          100% {
            --angle: 360deg;
          }
        }

        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .glow-border-rotate {
          --angle: 0deg;
          background: conic-gradient(
            from var(--angle),
            ${gradientColors}
          );
          animation: glow-rotate 4s linear infinite;
        }
      `}</style>

      <div
        className="absolute -inset-[1px] rounded-xl glow-border-rotate"
        style={{ zIndex: 0 }}
      />

      <div
        className="relative rounded-xl"
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
