"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Wand2, Eye, Send } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Step {
  number: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Share Your Photos",
    description: "Send me your property photos via WhatsApp or email",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Magic",
    description: "I transform them into cinematic videos using AI",
  },
  {
    number: "03",
    icon: Eye,
    title: "Review & Refine",
    description: "You review the draft and request any changes",
  },
  {
    number: "04",
    icon: Send,
    title: "Deliver & Impress",
    description: "Final video delivered — ready to wow your clients",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function Process() {
  const { settings, loading } = useSiteSettings();
  const lineRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, margin: "-100px" });

  if (loading) return null;
  if (settings.sections?.process === false) return null;

  return (
    <SectionWrapper className="relative bg-bg-secondary">
      <div className="text-center mb-16">
        <SectionLabel text="PROCESS" />
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          How It Works
        </motion.h2>
      </div>

      <div ref={lineRef} className="relative">
        {/* Desktop horizontal connecting line */}
        <div className="hidden md:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-0 z-0">
          <motion.div
            className="h-full border-t-2 border-dashed border-emerald-500/40 origin-left"
            initial={{ scaleX: 0 }}
            animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3,
            }}
          />
        </div>

        {/* Mobile vertical connecting line */}
        <div className="md:hidden absolute left-8 top-0 bottom-0 w-0 z-0">
          <motion.div
            className="h-full border-l-2 border-dashed border-emerald-500/40 origin-top"
            initial={{ scaleY: 0 }}
            animate={isLineInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3,
            }}
          />
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="flex flex-row md:flex-col items-start md:items-center gap-6 md:gap-0"
              >
                {/* Step indicator */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span
                    className="text-5xl md:text-6xl font-bold font-mono"
                    style={{
                      WebkitTextStroke: "2px rgba(16, 185, 129, 0.4)",
                      color: "transparent",
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 md:text-center md:mt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <Icon className="text-emerald-400" size={24} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
