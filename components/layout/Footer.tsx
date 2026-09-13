"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowUp, Linkedin, Github, Twitter, MessageCircle, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { addDocument } from "@/lib/db";
import { Container } from "./Container";

const QUICK_LINKS = [
  { label: "Home", href: "/", sectionKey: "home" },
  { label: "About", href: "/#about", sectionKey: "about" },
  { label: "Services", href: "/#services", sectionKey: "services" },
  { label: "Portfolio", href: "/#portfolio", sectionKey: "portfolio" },
  { label: "Blog", href: "/blog", sectionKey: "blog" },
  { label: "Contact", href: "/#contact", sectionKey: "contact" },
];

const SERVICE_LINKS = [
  { label: "Web Development", href: "/#services" },
  { label: "UI/UX Design", href: "/#services" },
  { label: "Mobile Apps", href: "/#services" },
  { label: "Consulting", href: "/#services" },
];

const SOCIAL_LINKS = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: MessageCircle, href: "https://wa.me", label: "WhatsApp" },
];

const CTA_WORDS = ["Let's", "build", "something", "extraordinary."];

export function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  const sections = settings?.sections || {};
  const brandName = settings?.brand?.name || "[YOUR_NAME]";

  const visibleQuickLinks = QUICK_LINKS.filter((link) => {
    if (link.sectionKey === "home") return true;
    return sections[link.sectionKey] !== false;
  });

  const showServices = sections.services !== false;

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setSubscribeError(false);
    try {
      await addDocument("newsletter", {
        email,
        subscribedAt: new Date().toISOString(),
        source: "footer",
      });
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      setSubscribeError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative border-t border-white/5 bg-bg-primary">
      {/* CTA Section */}
      <div ref={ctaRef} className="py-24 md:py-32">
        <Container className="text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
            {CTA_WORDS.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-full transition-colors duration-300"
            >
              Start a Project
            </Link>
          </motion.div>
        </Container>
      </div>

      {/* Main Footer Content */}
      <div className="border-t border-white/5 py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {brandName}
                </span>
              </Link>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                Building premium digital experiences with modern technologies and thoughtful design.
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {visibleQuickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            {showServices && (
              <div>
                <h3 className="text-white font-semibold mb-4">Services</h3>
                <ul className="space-y-3">
                  {SERVICE_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-semibold mb-4">Newsletter</h3>
              <p className="text-slate-400 text-sm mb-4">
                Subscribe for updates on new projects and insights.
              </p>
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Subscribed
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubscribe}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="flex-1 min-w-0 px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-medium text-sm rounded-lg transition-colors duration-300 shrink-0"
                      >
                        {loading ? "..." : "Subscribe"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {subscribeError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-1.5 text-red-400 text-xs"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Subscription failed. Please try again.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} {brandName}. Built with Next.js, Firebase, and AI.
            </p>
            <button
              onClick={scrollToTop}
              className="text-slate-500 hover:text-white text-sm transition-colors duration-300"
            >
              Back to top
            </button>
          </div>
        </Container>
      </div>

      {/* Fixed Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full shadow-lg shadow-emerald-500/20 transition-colors duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
