"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  key?: string;
}

export function PageTransition({ children, key }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageTransitionOverlay() {
  return (
    <motion.div
      className="fixed inset-0 bg-[#030712]"
      style={{ zIndex: 9998 }}
      initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
      animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 0%, 0 0%)" }}
      exit={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)" }}
      transition={{
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
      }}
    />
  );
}
