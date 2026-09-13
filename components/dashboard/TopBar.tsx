/* filepath: components/TopBar.tsx */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Search, Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const [notifications] = useState<Notification[]>([
    { id: "1", message: "New lead: TechCorp Inc.", timestamp: new Date(Date.now() - 1000 * 60 * 5), read: false },
    { id: "2", message: "Blog post published successfully", timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false },
    { id: "3", message: "Project Web App moved to Done", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: true },
    { id: "4", message: "New contact form submission", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-bg-secondary/50 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary lg:text-xl">{title}</h1>
      </div>

      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text" placeholder="Search dashboard..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-text-primary placeholder-[var(--text-muted)] outline-none transition-all focus:border-accent-quaternary/50 focus:bg-white/10 focus:ring-1 focus:ring-accent-quaternary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-xl p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-tertiary text-[10px] font-bold text-bg-primary">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  <button className="text-xs text-accent-quaternary hover:text-[var(--accent-quaternary)]">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`flex items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${!notif.read ? "bg-accent-quaternary/5" : ""}`}>
                      <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${!notif.read ? "bg-accent-quaternary" : "bg-[var(--border-color)]"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{notif.message}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{timeAgo(notif.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 rounded-xl p-1.5 pr-3 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-quaternary/20 text-sm font-semibold text-accent-quaternary">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}
            </div>
            <span className="hidden text-sm font-medium text-text-primary md:block">{user?.displayName || "Admin"}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${userOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl"
              >
                <div className="border-b border-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">{user?.displayName || "Admin"}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user?.email || "admin@platform.com"}</p>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-white/5" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
