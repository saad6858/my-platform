"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Particle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
  }));
}

export default function NotFound(): JSX.Element {
  const [particles] = useState<Particle[]>(() => generateParticles(20));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-primary overflow-hidden">
      {/* Subtle particle background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-accent-primary/20 rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <h1 className="text-[clamp(6rem,15vw,12rem)] font-black leading-none text-gradient tracking-tighter">
          404
        </h1>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-text-primary">
          Page not found
        </h2>
        <p className="mt-4 text-text-secondary max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-bg-primary font-semibold rounded-button hover:bg-accent-secondary transition-colors duration-300"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
