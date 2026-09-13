/* filepath: components/CTABanner.tsx */
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTABanner(): JSX.Element {
  const scrollToContact = (): void => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-quaternary to-accent-secondary opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-quaternary/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Ready to transform your business with{" "}
          <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            AI
          </span>
          ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
          Let&apos;s discuss your project and build something extraordinary together.
        </p>
        <motion.button
          onClick={scrollToContact}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-4 text-sm font-semibold text-bg-primary shadow-lg shadow-accent-primary/25 transition-colors hover:bg-accent-secondary"
        >
          Get in Touch
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}
