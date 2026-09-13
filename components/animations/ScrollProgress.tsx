"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left"
      style={{
        scaleX,
        zIndex: 50,
        background: "linear-gradient(90deg, #34d399, #10b981, #059669)",
      }}
    />
  );
}
