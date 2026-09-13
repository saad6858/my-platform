"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "./MobileNav";

interface NavLink {
  label: string;
  href: string;
  sectionKey: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", sectionKey: "home" },
  { label: "About", href: "/#about", sectionKey: "about" },
  { label: "Services", href: "/#services", sectionKey: "services" },
  { label: "Portfolio", href: "/#portfolio", sectionKey: "portfolio" },
  { label: "Blog", href: "/blog", sectionKey: "blog" },
  { label: "Contact", href: "/#contact", sectionKey: "contact" },
];

export function Navbar() {
  const { settings, loading } = useSiteSettings();
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
    if (latest > 200) {
      if (latest > lastScrollYRef.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    } else {
      setHidden(false);
    }
    lastScrollYRef.current = latest;
  });

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("/#")) {
        e.preventDefault();
        const id = href.replace("/#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
      setMobileNavOpen(false);
    },
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  const sections = settings?.sections || {};

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.sectionKey === "home") return true;
    return sections[link.sectionKey] !== false;
  });

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.span
                className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {settings?.brand?.name || "[YOUR_NAME]"}
              </motion.span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="relative group text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-px bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: isActive(link.href) ? "100%" : "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
                >
                  Dashboard
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileNavOpen && (
          <MobileNav
            links={visibleLinks}
            isAdmin={isAdmin}
            onClose={() => setMobileNavOpen(false)}
            onLinkClick={handleLinkClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}
