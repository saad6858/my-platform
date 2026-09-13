/* filepath: components/Sidebar.tsx */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, KanbanSquare, BarChart3, CalendarDays,
  Wallet, FileText, Settings, Mail, MailCheck, FolderOpen, LogOut, X, ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Users, label: "Lead Tracker", href: "/dashboard/leads" },
  { icon: KanbanSquare, label: "Project Pipeline", href: "/dashboard/projects" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: CalendarDays, label: "Content Calendar", href: "/dashboard/calendar" },
  { icon: Wallet, label: "Finance", href: "/dashboard/finance" },
  { icon: FileText, label: "Blog CMS", href: "/dashboard/blog" },
  { icon: Settings, label: "Site Settings", href: "/dashboard/settings" },
  { icon: Mail, label: "Contacts", href: "/dashboard/contacts" },
  { icon: MailCheck, label: "Newsletter", href: "/dashboard/newsletter" },
  { icon: FolderOpen, label: "Files", href: "/dashboard/files" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/5 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-quaternary">
            <span className="text-sm font-bold text-text-primary">M</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-text-primary">MY-PLATFORM</span>
        </Link>
        <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-white/5 text-text-primary" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-accent-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-accent-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  )}
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-accent-quaternary" : ""}`} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 text-accent-quaternary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-quaternary/20 text-accent-quaternary">
            <span className="text-sm font-semibold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user?.displayName || "Admin"}</p>
            <p className="truncate text-xs text-text-secondary">{user?.email || "admin@platform.com"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-[260px] flex-shrink-0 border-r border-white/5 bg-bg-secondary lg:block">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-bg-secondary shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
