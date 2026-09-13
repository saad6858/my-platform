"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { RevealImage } from "@/components/animations/RevealImage";
import { FadeIn } from "@/components/animations/FadeIn";
import { CountUp } from "@/components/animations/CountUp";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const bioParagraphs = [
  "I'm a DAE CIT student at PITAC College, Lahore, currently enrolled in the Bano Qabil Agentic AI program (BQ-023). I started with basic C programming in 10th grade, taught myself Python, and now build AI-powered solutions for real-world problems.",
  "My first venture: transforming property photos into cinematic walkthrough videos for real estate agents in Lahore. Using free AI tools and persistence, I'm proving that world-class work doesn't require world-class budgets.",
  "Next: Mastering agentic AI systems and cloud engineering. This platform documents every step of my journey — transparent, raw, and real.",
];

const timelineItems = [
  { date: "2024", title: "Started Learning Programming", description: "Began with C language in 10th grade, building the foundation for my tech journey." },
  { date: "2025", title: "Completed Matric & Enrolled DAE", description: "Finished matriculation and joined DAE CIT at PITAC College, Lahore." },
  { date: "June 2026", title: "Joined Bano Qabil Agentic AI", description: "Enrolled in BQ-023 program to master AI and automation technologies." },
  { date: "July 2026", title: "Launched AI Property Video Service", description: "Started creating AI-powered property walkthrough videos for real estate agents." },
  { date: "Aug 2026", title: "Started First Semester at PITAC", description: "Began formal technical education in Computer Information Technology." },
  { date: "Future", title: "Agentic AI + Cloud Engineering", description: "Planning to master autonomous AI systems and cloud infrastructure." },
];

const skills = [
  { name: "AI Video Generation", percentage: 85 },
  { name: "Python", percentage: 70 },
  { name: "Web Development", percentage: 75 },
  { name: "Agentic AI", percentage: 40 },
  { name: "Cloud Engineering", percentage: 20 },
  { name: "C Programming", percentage: 75 },
];

function SkillBar({ name, percentage, index }: { name: string; percentage: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <FadeIn delay={index * 0.1} direction="up">
      <div ref={ref} className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-300">{name}</span>
          <span className="text-sm font-mono text-emerald-400">
            <CountUp end={percentage} suffix="%" />
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
      </div>
    </FadeIn>
  );
}

function TimelineItem({
  item,
  index,
  isLeft,
}: {
  item: (typeof timelineItems)[0];
  index: number;
  isLeft: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex items-start gap-4 md:gap-8 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
        <span className="inline-block px-3 py-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 rounded-full mb-2">
          {item.date}
        </span>
        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
      </div>

      <div className="relative flex-shrink-0 w-3 h-3 mt-2">
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
        <div className="relative w-3 h-3 bg-emerald-500 rounded-full" />
      </div>

      <div className="hidden md:block flex-1" />
    </motion.div>
  );
}

export function About() {
  const { settings, loading } = useSiteSettings();

  if (loading) return null;
  if (settings.sections?.about === false) return null;

  return (
    <SectionWrapper id="about" className="bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <SectionLabel text="ABOUT ME" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              From Student to <span className="text-emerald-400">AI Creator</span>
            </h2>
          </FadeIn>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Bio */}
          <div className="space-y-6">
            {bioParagraphs.map((paragraph, index) => (
              <FadeIn key={index} delay={index * 0.15} direction="up">
                <p className="text-slate-400 leading-relaxed text-base">{paragraph}</p>
              </FadeIn>
            ))}
          </div>

          {/* Right Column - Photo */}
          <div className="relative">
            <RevealImage
              src="/images/about-photo.jpg"
              alt="About me"
              className="w-full aspect-[4/5]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 md:bottom-6 md:right-6 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-white">Available for projects</span>
            </motion.div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-24">
          <FadeIn>
            <h3 className="text-2xl font-bold text-white text-center mb-12">My Journey</h3>
          </FadeIn>

          <div className="relative max-w-3xl mx-auto">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/30 -translate-x-1/2" />

            <div className="space-y-8 md:space-y-12">
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={index}
                  item={item}
                  index={index}
                  isLeft={index % 2 === 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-24">
          <FadeIn>
            <h3 className="text-2xl font-bold text-white text-center mb-12">
              Skills & <span className="text-emerald-400">Expertise</span>
            </h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {skills.map((skill, index) => (
              <SkillBar
                key={skill.name}
                name={skill.name}
                percentage={skill.percentage}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
