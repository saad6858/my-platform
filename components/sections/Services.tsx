"use client";

import { motion } from "framer-motion";
import { Clapperboard, Zap, Brain, Check } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { SpotlightCard } from "@/components/animations/SpotlightCard";
import { GlassCard } from "@/components/layout/GlassCard";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Service {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  cta: string;
  badge: string | null;
  opacity: number;
}

const services: Service[] = [
  {
    icon: Clapperboard,
    iconColor: "text-emerald-400",
    title: "AI Property Walkthroughs",
    description:
      "Turn your property photos into stunning cinematic videos. Perfect for Zameen listings, social media, and client presentations.",
    features: [
      "5-10 second cinematic clips",
      "Smooth camera movements",
      "Professional color grading",
      "Music + text overlays",
      "24-hour delivery guarantee",
    ],
    price: "Starting at ₨1,500",
    cta: "Get Free Sample",
    badge: null,
    opacity: 1,
  },
  {
    icon: Zap,
    iconColor: "text-amber-400",
    title: "AI Workflow Automation",
    description:
      "Automate repetitive tasks with custom AI agents. Save hours every week and focus on what matters.",
    features: [
      "Custom AI agent development",
      "n8n / CrewAI integration",
      "Data pipeline automation",
      "WhatsApp business automation",
      "Ongoing maintenance & support",
    ],
    price: "Custom Quote",
    cta: "Discuss Your Needs",
    badge: null,
    opacity: 1,
  },
  {
    icon: Brain,
    iconColor: "text-indigo-400",
    title: "Agentic AI Systems",
    description:
      "Multi-agent systems for complex business workflows. Research, analysis, content generation — all automated.",
    features: [
      "Multi-agent orchestration",
      "Autonomous research agents",
      "Content generation pipelines",
      "Business intelligence dashboards",
      "Scalable architecture",
    ],
    price: "Coming Soon",
    cta: "Join Waitlist",
    badge: "Coming Q4 2026",
    opacity: 0.8,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function Services() {
  const { settings, loading } = useSiteSettings();

  if (loading) return null;
  if (settings.sections?.services === false) return null;

  return (
    <SectionWrapper id="services" className="relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-emerald-500/[0.05] blur-[150px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <SectionLabel text="SERVICES" />
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            What I Can Build For You
          </motion.h2>
          <motion.p
            className="text-text-secondary text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            End-to-end AI solutions tailored for your business needs
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                style={{ opacity: service.opacity }}
              >
                <SpotlightCard
                  className="h-full"
                  spotlightColor="rgba(16, 185, 129, 0.15)"
                  borderColor="rgba(16, 185, 129, 0.2)"
                  tiltMax={8}
                >
                  <GlassCard className="h-full p-8 relative overflow-hidden">
                    {service.badge && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {service.badge}
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <Icon className={service.iconColor} size={48} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {service.title}
                    </h3>

                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                          <Check className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mb-6">
                      <span className="text-2xl font-bold text-emerald-400">
                        {service.price}
                      </span>
                    </div>

                    <MagneticButton className="w-full">
                      {service.cta}
                    </MagneticButton>
                  </GlassCard>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
