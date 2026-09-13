"use client";

import { motion, useScroll, useVelocity, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface VelocityTextProps {
  children: ReactNode;
  className?: string;
}

export function VelocityText({ children, className = "" }: VelocityTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 100,
    damping: 30,
  });

  const skewX = useTransform(smoothVelocity, (v) => {
    const clamped = Math.max(-500, Math.min(500, v));
    return clamped * 0.01;
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        skewX,
      }}
    >
      {children}
    </motion.div>
  );
}
