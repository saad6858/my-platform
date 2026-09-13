/* filepath: app/contact/page.tsx */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SEOHead } from "@/components/layout/SEOHead";
import { Contact } from "@/components/sections/Contact";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What services do you offer?",
    answer:
      "I specialize in AI-powered video content for real estate, workflow automation, and agentic AI solutions. From property walkthrough videos to fully automated lead nurturing systems, I help businesses leverage cutting-edge AI technology.",
  },
  {
    question: "How quickly can you deliver a project?",
    answer:
      "Typical turnaround is 1-2 weeks for video content and 2-4 weeks for automation projects. Complex agentic AI implementations may take 4-8 weeks depending on scope and integrations required.",
  },
  {
    question: "Do you work with international clients?",
    answer:
      "Absolutely! I work with clients globally. With modern collaboration tools and async communication, timezone differences are never an issue. I've successfully delivered projects for clients in US, UK, UAE, and across Asia.",
  },
  {
    question: "What is your pricing structure?",
    answer:
      "I offer both project-based and retainer pricing. Video content starts from $500 per project, automation setups from $2,000, and ongoing AI consulting retainers from $1,500/month. Every project gets a custom quote based on requirements.",
  },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <GlassCard key={index} className="overflow-hidden">
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <span className="text-text-primary font-semibold pr-4">
              {item.question}
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="px-6 pb-6 text-text-secondary leading-relaxed border-t border-white/10 pt-4">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ))}
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <SEOHead
        title="Get in Touch — Contact"
        description="Let's work together. Reach out for AI video, automation, and agentic AI solutions."
      />

      <main className="min-h-screen bg-bg-primary">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary">
                Get in Touch
              </h1>
              <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">
                Have a project in mind? Let&apos;s discuss how we can work
                together to bring your vision to life.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Contact Section */}
        <Contact />

        {/* FAQ Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-12">
                Frequently Asked Questions
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <FAQAccordion items={FAQS} />
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
