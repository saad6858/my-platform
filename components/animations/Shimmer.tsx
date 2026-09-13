"use client";

import { ReactNode } from "react";

interface ShimmerProps {
  className?: string;
  children?: ReactNode;
}

export function Shimmer({ className = "", children }: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(15, 23, 42, 0.8) 25%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.8) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-sweep 1.5s infinite linear",
      }}
    >
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
      {children}
    </div>
  );
}

export function ShimmerSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.8)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 25%, rgba(255, 255, 255, 0.05) 50%, transparent 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-sweep 1.5s infinite linear",
        }}
      />
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
