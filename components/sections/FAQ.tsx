/* filepath: components/FAQ.tsx */
"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does video delivery take?",
    answer:
      "Typically 24-48 hours depending on photo count and complexity. Rush delivery is available for premium tiers.",
  },
  {
    question: "What photos do I need to provide?",
    answer:
      "Any property photos work. Higher resolution gives better results. We recommend at least 10-15 images for optimal video quality.",
  },
  {
    question: "Can I request revisions?",
    answer:
      "Yes, revisions are included based on your pricing tier. Basic includes 1 revision, Pro includes 3, and Enterprise offers unlimited revisions.",
  },
  {
    question: "What tools do you use?",
    answer:
      "ZSky AI for video generation, CapCut for editing, and custom AI pipelines built on state-of-the-art diffusion models.",
  },
  {
    question: "Is this service only for real estate?",
    answer:
      "Currently focused on real estate, but we are actively expanding to hospitality, automotive, and e-commerce verticals.",
  },
  {
    question: "Do you offer bulk pricing?",
    answer:
      "Absolutely. Contact us for custom enterprise packages if you need high-volume content production.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-text-primary sm:text-lg">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-accent-primary" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-text-secondary leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number): void => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <SectionWrapper id="faq">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel text="FAQ" />
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Common Questions
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-bg-secondary/30 backdrop-blur-xl">
        {FAQ_ITEMS.map((item, idx) => (
          <AccordionItem
            key={idx}
            item={item}
            isOpen={openIndex === idx}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
