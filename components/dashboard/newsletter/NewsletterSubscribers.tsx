/* filepath: components/NewsletterSubscribers.tsx */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Download,
  Search,
  Filter,
  Mail,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { SubscriberTable } from "./SubscriberTable";
import { BroadcastModal } from "./BroadcastModal";
import { cn } from "@/lib/utils";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed";
  createdAt: Timestamp | Date;
  source?: string;
}

export function NewsletterSubscribers() : JSX.Element {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, "newsletter"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            email: d.email || "",
            name: d.name || "",
            status: (d.status as "active" | "unsubscribed") || "active",
            createdAt: d.createdAt || new Date(),
            source: d.source || "website",
          } as NewsletterSubscriber;
        });
        setSubscribers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading subscribers:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredSubscribers = useMemo(() => {
    let result = [...subscribers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          (s.name && s.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [subscribers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.status === "active").length;
    const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length;

    // Calculate growth (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Days = subscribers.filter((s) => {
      const date = s.createdAt instanceof Date ? s.createdAt : s.createdAt.toDate();
      return date >= thirtyDaysAgo;
    }).length;

    const previous30Days = subscribers.filter((s) => {
      const date = s.createdAt instanceof Date ? s.createdAt : s.createdAt.toDate();
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    let growthPercent = 0;
    if (previous30Days > 0) {
      growthPercent = ((last30Days - previous30Days) / previous30Days) * 100;
    } else if (last30Days > 0) {
      growthPercent = 100;
    }

    return {
      total,
      active,
      unsubscribed,
      growthPercent,
      last30Days,
    };
  }, [subscribers]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "newsletter", id));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
    }
  };

  const exportData = () => {
    const data = filteredSubscribers.map((s) => ({
      Email: s.email,
      Name: s.name || "",
      Status: s.status,
      Date: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt.toDate().toISOString(),
      Source: s.source || "",
    }));
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-accent-quaternary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Newsletter Subscribers</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your newsletter subscriber list</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm font-medium hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-quaternary hover:bg-accent-quaternary/90 text-text-primary rounded-lg text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Subscribers",
            value: stats.total,
            icon: Users,
            color: "text-text-primary",
          },
          {
            label: "Active",
            value: stats.active,
            icon: Mail,
            color: "text-accent-primary",
          },
          {
            label: "Unsubscribed",
            value: stats.unsubscribed,
            icon: Mail,
            color: "text-text-secondary",
          },
          {
            label: "Growth (30d)",
            value: `${stats.growthPercent >= 0 ? "+" : ""}${stats.growthPercent.toFixed(1)}%`,
            icon: stats.growthPercent > 0 ? TrendingUp : stats.growthPercent < 0 ? TrendingDown : Minus,
            color:
              stats.growthPercent > 0
                ? "text-accent-primary"
                : stats.growthPercent < 0
                ? "text-danger"
                : "text-text-secondary",
          },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
              </div>
              <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by email or name..."
            className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary placeholder:text-text-secondary/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setCurrentPage(1);
            }}
            className="pl-9 pr-8 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent-quaternary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <SubscriberTable
          subscribers={paginatedSubscribers}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSubscribers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

        {filteredSubscribers.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
            <p className="text-text-secondary">No subscribers found</p>
          </div>
        )}
      </GlassCard>

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        subscribers={subscribers.filter((s) => s.status === "active")}
      />
    </div>
  );
}
