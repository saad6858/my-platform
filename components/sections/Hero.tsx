"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MeshGradient } from "@/components/animations/MeshGradient";
import { ParticleBackground } from "@/components/animations/ParticleBackground";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { Typewriter } from "@/components/animations/Typewriter";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Hero() {
  const { settings, loading } = useSiteSettings();

  if (loading) return null;
  if (settings.sections?.hero === false) return null;

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[600px] h-screen overflow-hidden flex items-center justify-center bg-bg-primary">
      {/* Background layers */}
      <MeshGradient />
      <ParticleBackground />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SectionLabel text="AI-POWERED SOLUTIONS" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold text-white leading-tight tracking-tight"
        >
          <Typewriter text="Crafting Digital Experiences" speed={60} delay={600} />
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            That Matter
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          From AI-powered property walkthroughs to intelligent automation systems — building the future, one project at a time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton
            className="relative px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <a href="#portfolio" className="relative z-10">
              View My Work
            </a>
            <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </MagneticButton>

          <MagneticButton
            className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
          >
            <a href="#contact">Get in Touch</a>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 cursor-pointer"
        onClick={scrollToAbout}
      >
        <span className="text-xs text-slate-500 tracking-wider uppercase">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
