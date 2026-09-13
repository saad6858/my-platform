/* filepath: components/AboutPage.tsx */
"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, Briefcase, Code2, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { SEOHead } from "@/components/layout/SEOHead";
import { CTABanner } from "@/components/sections/CTABanner";

const SKILLS = [
  { name: "Next.js / React", level: 95 },
  { name: "TypeScript", level: 92 },
  { name: "Tailwind CSS", level: 90 },
  { name: "Firebase / Firestore", level: 88 },
  { name: "Framer Motion", level: 85 },
  { name: "Node.js", level: 82 },
  { name: "Python / AI APIs", level: 78 },
  { name: "UI/UX Design", level: 80 },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Founded MY-PLATFORM",
    description: "Launched a premium AI-powered portfolio and business platform.",
    icon: Sparkles,
  },
  {
    year: "2023",
    title: "AI Video Generation",
    description: "Built custom pipelines for real estate video content using diffusion models.",
    icon: Code2,
  },
  {
    year: "2022",
    title: "Full-Stack Consultant",
    description: "Delivered scalable web apps for startups and enterprise clients.",
    icon: Briefcase,
  },
  {
    year: "2021",
    title: "Started Development Journey",
    description: "Began building production-grade applications with modern web stacks.",
    icon: Award,
  },
];

const EDUCATION = [
  {
    degree: "B.S. Computer Science",
    school: "University of Technology",
    year: "2017 - 2021",
    description: "Focus on software engineering, algorithms, and machine learning fundamentals.",
  },
  {
    degree: "AI & Machine Learning Certificate",
    school: "DeepLearning.AI",
    year: "2023",
    description: "Specialized in generative AI, diffusion models, and neural networks.",
  },
];

export default function AboutPage(): JSX.Element {
  return (
    <>
      <SEOHead
        title="About | MY-PLATFORM"
        description="Learn more about the team and mission behind MY-PLATFORM."
        url="/about"
      />
      <main className="min-h-screen bg-bg-primary">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl"
            >
              About{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Me
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
            >
              Building the future of AI-powered content creation, one pixel at a time.
            </motion.p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                    Passionate about AI & Design
                  </h2>
                  <p className="mt-4 text-text-secondary leading-relaxed">
                    With over 5 years of experience in full-stack development and AI integration,
                    I specialize in creating premium digital experiences that blend cutting-edge
                    technology with elegant design.
                  </p>
                  <p className="mt-4 text-text-secondary leading-relaxed">
                    My mission is to democratize AI-powered content creation for businesses of all
                    sizes, starting with real estate and expanding across industries.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-primary">50+</div>
                    <div className="mt-1 text-sm text-text-secondary">Projects Delivered</div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-primary">5+</div>
                    <div className="mt-1 text-sm text-text-secondary">Years Experience</div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-primary">100%</div>
                    <div className="mt-1 text-sm text-text-secondary">Client Satisfaction</div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-primary">24/7</div>
                    <div className="mt-1 text-sm text-text-secondary">Support Available</div>
                  </GlassCard>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-bg-secondary/30 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">My Journey</h2>
              <p className="mt-2 text-text-secondary">Key milestones in my career.</p>
            </div>
            <div className="mt-12 space-y-8">
              {TIMELINE.map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <div className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      {idx < TIMELINE.length - 1 && (
                        <div className="mt-2 h-full w-px bg-white/10" />
                      )}
                    </div>
                    <div className="pb-8">
                      <span className="text-sm font-medium text-accent-primary">
                        {item.year}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Skills & Expertise</h2>
              <p className="mt-2 text-text-secondary">Technologies I work with daily.</p>
            </div>
            <div className="mt-12 space-y-6">
              {SKILLS.map((skill, idx) => (
                <FadeIn key={idx} delay={idx * 0.05}>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-text-primary">{skill.name}</span>
                      <span className="text-text-secondary">{skill.level}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                      />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="bg-bg-secondary/30 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Education</h2>
              <p className="mt-2 text-text-secondary">Academic background and certifications.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {EDUCATION.map((edu, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <GlassCard className="p-6">
                    <GraduationCap className="h-6 w-6 text-accent-primary" />
                    <h3 className="mt-3 text-lg font-semibold text-text-primary">{edu.degree}</h3>
                    <p className="mt-1 text-sm text-accent-secondary">{edu.school}</p>
                    <p className="mt-1 text-xs text-text-secondary">{edu.year}</p>
                    <p className="mt-3 text-sm text-text-secondary">{edu.description}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <CTABanner />
      </main>
    </>
  );
}
