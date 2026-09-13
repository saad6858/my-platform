/* filepath: components/Overview.tsx */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatCard } from "./StatCard";
import { ActivityFeed } from "./ActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { getCollection } from "@/lib/db";
import { Lead, Project } from "@/types/index";
import {
  Users,
  FolderKanban,
  Mail,
  Wallet,
  Plus,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface Activity {
  id: string;
  icon: React.ReactNode;
  text: string;
  timestamp: Date;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isTodayOrPast(dateInput: Date | string | null): boolean {
  if (!dateInput) return false;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

function daysOverdue(dateInput: Date | string | null): number {
  if (!dateInput) return 0;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function Sparkline({ data, color }: { data: number[]; color: string }): JSX.Element {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#spark-${color.replace("#", "")})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

export default function Overview(): JSX.Element {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadTrend: 12,
    activeProjects: 0,
    messagesSent: 0,
    revenue: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsData, projectsData, postsData] = await Promise.all([
          getCollection("leads"),
          getCollection("projects"),
          getCollection("posts"),
        ]);

        const typedLeads = leadsData as Lead[];
        const typedProjects = projectsData as Project[];

        setLeads(typedLeads);
        setProjects(typedProjects);

        const activeProjects = typedProjects.filter(
          (p) => p.status === "pending" || p.status === "in_progress" || p.status === "review"
        ).length;
        const totalRevenue = typedLeads.reduce(
          (sum, lead) => sum + (lead.status === "converted" ? 50000 : 0),
          0
        );

        setStats({
          totalLeads: typedLeads.length,
          leadTrend: 12,
          activeProjects,
          messagesSent: postsData.length * 3 + typedLeads.length,
          revenue: totalRevenue,
        });

        const generatedActivities: Activity[] = typedLeads
          .slice(0, 10)
          .map((lead, i) => ({
            id: `act-${i}`,
            icon: <Mail className="h-4 w-4" />,
            text: `You messaged ${lead.name}${lead.agency ? ` (${lead.agency})` : ""}`,
            timestamp: new Date(Date.now() - i * 1000 * 60 * 30),
          }));
        setActivities(generatedActivities);
      } catch (err) {
        console.error("Error fetching overview data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const followUps = leads.filter((lead) => isTodayOrPast(lead.dateFollowUp));
  const leadSparkline = [12, 18, 15, 22, 28, 24, stats.totalLeads || 30];
  const revenueSparkline = [20000, 35000, 28000, 42000, 38000, 55000, stats.revenue || 60000];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-quaternary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-text-primary lg:text-3xl">
          {getGreeting()}, {user?.displayName || "Admin"}.
        </h2>
        <p className="mt-1 text-text-secondary">{formatDate()}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-wrap gap-3">
        <Link href="/dashboard/leads" className="flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-primary hover:shadow-lg hover:shadow-accent-primary/20">
          <Plus className="h-4 w-4" /> Add Lead
        </Link>
        <Link href="/dashboard/projects" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-white/10">
          <FolderKanban className="h-4 w-4" /> New Project
        </Link>
        <Link href="/dashboard/blog" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-white/10">
          <FileText className="h-4 w-4" /> Write Blog Post
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Leads" value={stats.totalLeads} trend={stats.leadTrend} icon={Users} color="text-accent-quaternary" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={FolderKanban} color="text-accent-primary" />
        <StatCard title="Messages Sent" value={stats.messagesSent} icon={Mail} color="text-accent-tertiary" />
        <StatCard title="Revenue This Month" value={stats.revenue} prefix="₨" icon={Wallet} color="text-accent-secondary" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Leads (Last 7 Days)</h3>
            <span className="flex items-center gap-1 text-xs text-accent-primary">
              <TrendingUp className="h-3 w-3" /> +{stats.leadTrend}%
            </span>
          </div>
          <Sparkline data={leadSparkline} color="var(--accent-quaternary)" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Revenue (Last 7 Days)</h3>
            <span className="flex items-center gap-1 text-xs text-accent-primary">
              <TrendingUp className="h-3 w-3" /> +8%
            </span>
          </div>
          <Sparkline data={revenueSparkline} color="var(--accent-secondary)" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="rounded-2xl border border-white/10 bg-bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
            <Link href="/dashboard/leads" className="text-xs text-accent-quaternary hover:text-accent-quaternary">View All</Link>
          </div>
          <ActivityFeed activities={activities} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="rounded-2xl border border-white/10 bg-bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Follow-ups Due</h3>
            <span className="rounded-full bg-accent-tertiary/10 px-2.5 py-1 text-xs font-medium text-accent-tertiary">
              {followUps.length} pending
            </span>
          </div>
          {followUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <AlertTriangle className="mb-2 h-8 w-8" />
              <p className="text-sm">No follow-ups due today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followUps.slice(0, 8).map((lead) => {
                const overdue = daysOverdue(lead.dateFollowUp);
                return (
                  <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${overdue > 0 ? "bg-danger/10 text-danger" : "bg-accent-tertiary/10 text-accent-tertiary"}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{lead.name}</p>
                      <p className="truncate text-xs text-text-secondary">{lead.agency || "No agency"}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${overdue > 0 ? "text-danger" : "text-accent-tertiary"}`}>
                        {overdue > 0 ? `${overdue}d overdue` : "Today"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-text-muted" />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
