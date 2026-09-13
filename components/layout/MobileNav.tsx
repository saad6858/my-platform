"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Github, Twitter, MessageCircle } from "lucide-react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
  sectionKey: string;
}

interface MobileNavProps {
  links: NavLink[];
  isAdmin: boolean;
  onClose: () => void;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const SOCIAL_LINKS = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: MessageCircle, href: "https://wa.me", label: "WhatsApp" },
];

export function MobileNav({ links, isAdmin, onClose, onLinkClick }: MobileNavProps) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on swipe right
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const startX = touch.clientX;

      const handleTouchMove = (ev: TouchEvent) => {
        const moveX = ev.touches[0].clientX;
        if (moveX - startX > 100) {
          onClose();
          cleanup();
        }
      };

      const handleTouchEnd = () => {
        cleanup();
      };

      const cleanup = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 md:hidden"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-slate-900 border-l border-white/10 h-full"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
        >
          <div className="flex flex-col h-full p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-8">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1">
              <ul className="space-y-1">
                {links.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => onLinkClick(e, link.href)}
                      className="block py-3 text-lg font-medium text-slate-300 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                {isAdmin && (
                  <motion.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: links.length * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Link
                      href="/admin"
                      onClick={() => onClose()}
                      className="block py-3 text-lg font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
                    >
                      Dashboard
                    </Link>
                  </motion.li>
                )}
              </ul>
            </nav>

            {/* Social Links */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
