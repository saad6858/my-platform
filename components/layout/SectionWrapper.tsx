/* filepath: components/layout/SectionWrapper.tsx */
import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  fullHeight?: boolean;
}

export function SectionWrapper({
  children,
  className = "",
  id,
  fullHeight = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`
        relative overflow-hidden
        py-24 md:py-32
        ${fullHeight ? "min-h-screen flex items-center" : ""}
        ${className}
      `}
    >
      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
