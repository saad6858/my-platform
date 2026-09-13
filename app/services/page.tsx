/* filepath: components/ServicesPage.tsx */
"use client";

import { motion } from "framer-motion";
import {
  Video,
  Palette,
  Code2,
  BarChart3,
  Layers,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { SEOHead } from "@/components/layout/SEOHead";
import { CTABanner } from "@/components/sections/CTABanner";
import { FAQ } from "@/components/sections/FAQ";

const SERVICES = [
  {
    icon: Video,
    title: "AI Video Generation",
    description:
      "Transform static property photos into stunning cinematic videos using state-of-the-art AI diffusion models.",
    features: [
      "4K video output",
      "Custom transitions",
      "Music synchronization",
      "Branded overlays",
    ],
  },
  {
    icon: Palette,
    title: "Brand Identity Design",
    description:
      "Complete brand packages including logos, color systems, typography, and brand guidelines.",
    features: [
      "Logo design",
      "Color palettes",
      "Typography systems",
      "Brand guidelines",
    ],
  },
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "End-to-end web application development using Next.js, TypeScript, and modern cloud infrastructure.",
    features: [
      "Next.js 14 apps",
      "Firebase backend",
      "Real-time features",
      "Scalable architecture",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & SEO",
    description:
      "Data-driven insights and search optimization to maximize your digital presence and conversions.",
    features: [
      "Performance tracking",
      "SEO optimization",
      "Conversion analysis",
      "Custom dashboards",
    ],
  },
  {
    icon: Layers,
    title: "Content Strategy",
    description:
      "Strategic content planning and creation to engage your audience and drive meaningful results.",
    features: [
      "Content calendars",
      "Blog management",
      "Social media strategy",
      "Email campaigns",
    ],
  },
  {
    icon: Zap,
    title: "AI Automation",
    description:
      "Streamline workflows with intelligent automation powered by custom AI agents and integrations.",
    features: [
      "Workflow automation",
      "AI chatbots",
      "Data processing",
      "API integrations",
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery",
    description: "We analyze your needs, goals, and target audience to define the project scope.",
  },
  {
    step: "02",
    title: "Strategy",
    description: "Develop a tailored plan with timelines, deliverables, and success metrics.",
  },
  {
    step: "03",
    title: "Creation",
    description: "Build and iterate on designs, code, and content with regular feedback loops.",
  },
  {
    step: "04",
    title: "Launch",
    description: "Deploy, monitor, and optimize for peak performance and user satisfaction.",
  },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$499",
    period: "/project",
    description: "Perfect for small projects and quick turnarounds.",
    features: [
      "1 AI-generated video",
      "Basic editing",
      "48-hour delivery",
      "1 revision",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$1,299",
    period: "/project",
    description: "Ideal for growing businesses with ongoing needs.",
    features: [
      "3 AI-generated videos",
      "Advanced editing",
      "24-hour delivery",
      "3 revisions",
      "Branded overlays",
    ],
    cta: "Most Popular",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for high-volume content needs.",
    features: [
      "Unlimited videos",
      "Priority support",
      "Custom AI pipelines",
      "Dedicated manager",
      "API access",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function ServicesPage(): JSX.Element {
  return (
    <>
      <SEOHead
        title="Services | MY-PLATFORM"
        description="Explore our premium AI-powered services for video generation, development, and design."
        url="/services"
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
              Our{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Services
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
            >
              Premium AI-powered solutions designed to elevate your brand and streamline your workflow.
            </motion.p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <GlassCard className="group h-full p-6 transition-colors hover:border-accent-primary/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-text-secondary">
                          <Check className="h-4 w-4 shrink-0 text-accent-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="bg-bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Our Process</h2>
              <p className="mt-2 text-text-secondary">How we deliver exceptional results every time.</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map((step, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <div className="relative text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10 text-2xl font-bold text-accent-primary">
                      {step.step}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Pricing</h2>
              <p className="mt-2 text-text-secondary">Transparent pricing for every stage of growth.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PRICING_TIERS.map((tier, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <GlassCard
                    className={`relative h-full p-6 ${
                      tier.highlighted
                        ? "border-accent-primary/50 shadow-lg shadow-accent-primary/10"
                        : ""
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-3 py-1 text-xs font-semibold text-bg-primary">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-text-primary">{tier.price}</span>
                      <span className="text-sm text-text-secondary">{tier.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-text-secondary">
                          <Check className="h-4 w-4 shrink-0 text-accent-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
                        tier.highlighted
                          ? "bg-accent-primary text-bg-primary hover:bg-accent-secondary"
                          : "border border-white/10 text-text-primary hover:bg-white/5"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <FAQ />
        <CTABanner />
      </main>
    </>
  );
}
