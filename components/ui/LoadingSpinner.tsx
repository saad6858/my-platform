/* filepath: components/LoadingSpinner.tsx */
"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export function LoadingSpinner(: JSX.Element {
  size = "md",
  className,
}: LoadingSpinnerProps): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-accent-primary border-t-transparent",
        SIZE_MAP[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
