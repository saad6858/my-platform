"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { GlassCard } from "@/components/layout/GlassCard";
import { GlowBorder } from "@/components/animations/GlowBorder";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";

type BillingCycle = "monthly" | "project";

interface PricingTier {
  name: string;
  monthlyPrice: string;
  monthlySub: string;
  projectPrice: string;
  projectSub: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    monthlyPrice: "₨25,000",
    monthlySub: "per month",
    projectPrice: "₨1,500",
    projectSub: "Up to 10 photos",
    features: [
      "5-10 cinematic clips",
      "Basic color grading",
      "24h delivery",
      "1 revision",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Professional",
    monthlyPrice: "₨60,000",
    monthlySub: "per month",
    projectPrice: "₨150",
    projectSub: "/photo",
    features: [
      "Unlimited clips",
      "Advanced color grading",
      "Music + text overlays",
      "48h delivery",
      "3 revisions",
      "Social media versions",
    ],
    cta: "Most Popular",
    featured: true,
    badge: "Recommended",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    monthlySub: "Monthly retainer",
    projectPrice: "Custom",
    projectSub: "Bulk / Agency",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom branding",
      "API access",
      "Monthly retainer option",
    ],
    cta: "Contact Me",
    featured: false,
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
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

export function Pricing() {
  const { settings, loading } = useSiteSettings();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("project");

  if (loading) return null;
  if (settings.sections?.pricing === false) return null;

  return (
    <SectionWrapper id="pricing" className="relative overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[400px] rounded-full bg-indigo-500/[0.04] blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-12">
          <SectionLabel text="PRICING" />
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Simple, Transparent Pricing
          </motion.h2>

          {/* Billing toggle */}
          <motion.div
            className="inline-flex items-center gap-2 p-1.5 rounded-full bg-bg-secondary border border-white/10 mt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              type="button"
              onClick={() => setBillingCycle("project")}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                billingCycle === "project"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Project-based
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {tiers.map((tier) => {
            const price =
              billingCycle === "monthly"
                ? tier.monthlyPrice
                : tier.projectPrice;
            const sub =
              billingCycle === "monthly" ? tier.monthlySub : tier.projectSub;

            return (
              <motion.div key={tier.name} variants={cardVariants}>
                {tier.featured ? (
                  <TiltCard className="h-full">
                    <GlowBorder
                      colors={["#10b981", "#34d399", "#6366f1", "#10b981"]}
                      className="h-full"
                    >
                      <GlassCard className="h-full p-8 relative overflow-hidden">
                        {tier.badge && (
                          <div className="absolute top-0 left-0 right-0 flex justify-center">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-b-xl text-xs font-bold bg-emerald-500 text-bg-primary">
                              {tier.badge}
                            </span>
                          </div>
                        )}

                        <div className="pt-6">
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {tier.name}
                          </h3>

                          <div className="mb-1">
                            <span className="text-4xl md:text-5xl font-bold text-text-primary">
                              {price}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mb-6">
                            {sub}
                          </p>

                          <ul className="space-y-4 mb-8">
                            {tier.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-3 text-sm text-text-secondary"
                              >
                                <Check
                                  className="text-emerald-400 shrink-0 mt-0.5"
                                  size={16}
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <MagneticButton className="w-full">
                            {tier.cta}
                          </MagneticButton>
                        </div>
                      </GlassCard>
                    </GlowBorder>
                  </TiltCard>
                ) : (
                  <TiltCard className="h-full">
                    <GlassCard className="h-full p-8 relative overflow-hidden">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {tier.name}
                      </h3>

                      <div className="mb-1">
                        <span className="text-4xl md:text-5xl font-bold text-text-primary">
                          {price}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-6">
                        {sub}
                      </p>

                      <ul className="space-y-4 mb-8">
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm text-text-secondary"
                          >
                            <Check
                              className="text-emerald-400 shrink-0 mt-0.5"
                              size={16}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <MagneticButton className="w-full">
                        {tier.cta}
                      </MagneticButton>
                    </GlassCard>
                  </TiltCard>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
