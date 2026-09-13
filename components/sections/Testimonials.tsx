/* filepath: components/Testimonials.tsx */
"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { GlassCard } from "@/components/layout/GlassCard";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote:
      "The AI-powered video content completely transformed our real estate listings. We saw a 40% increase in engagement within the first month.",
    name: "Sarah Mitchell",
    role: "Real Estate Broker, Premier Properties",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Professional, fast, and incredibly creative. The videos look like they were produced by a full studio team. Highly recommended!",
    name: "James Rodriguez",
    role: "Marketing Director, Urban Living",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Working with this team was seamless. They understood our brand instantly and delivered content that exceeded all expectations.",
    name: "Emily Chen",
    role: "CEO, Horizon Ventures",
    rating: 5,
  },
];

export function Testimonials(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback((): void => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback((): void => {
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <SectionWrapper id="testimonials" className="bg-bg-secondary/30">
      <div className="mx-auto max-w-4xl text-center">
        <SectionLabel text="TESTIMONIALS" />
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          What Clients Say
        </h2>
      </div>

      <div className="relative mx-auto mt-12 max-w-3xl">
        <div className="relative min-h-[280px] overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <GlassCard className="p-8 sm:p-10">
                <Quote className="h-8 w-8 text-accent-primary/40" />
                <p className="mt-4 text-lg leading-relaxed text-text-primary">
                  &ldquo;{current.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < current.rating
                          ? "fill-amber-400 text-accent-tertiary"
                          : "text-text-secondary/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-text-primary">
                    {current.name}
                  </p>
                  <p className="text-sm text-text-secondary">{current.role}</p>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="rounded-full border border-white/10 bg-bg-secondary/50 p-2 text-text-secondary transition-colors hover:border-accent-primary/50 hover:text-accent-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex
                    ? "w-6 bg-accent-primary"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="rounded-full border border-white/10 bg-bg-secondary/50 p-2 text-text-secondary transition-colors hover:border-accent-primary/50 hover:text-accent-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
