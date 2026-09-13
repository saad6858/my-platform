/* filepath: components/Analytics.tsx */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { ChartMessages } from "./ChartMessages";
import { ChartSources } from "./ChartSources";
import { ChartFunnel } from "./ChartFunnel";
import { ChartRevenue } from "./ChartRevenue";
import { Lead } from "@/types/index";
import {
  MessageSquare,
  Reply,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DateRange = "7d" | "30d" | "90d" | "all" | "custom";

interface DailyData {
  date: string;
  messages: number;
  replies: number;
}

interface SourceData {
  source: string;
  count: number;
}

interface FunnelData {
  stage: string;
  count: number;
  rate: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface AgentStats {
  id: string;
  name: string;
  agency: string;
  messagesSent: number;
  replies: number;
  conversionRate: number;
  revenue: number;
}

interface TrendResult {
  value: number;
  isPositive: boolean;
}

interface ReplyRateData {
  date: string;
  rate: number;
}

function getDateRangeStart(range: DateRange, customStart?: string): Date {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "custom":
      return customStart ? new Date(customStart) : new Date(0);
    case "all":
    default:
      return new Date(0);
  }
}

function getDateRangeEnd(range: DateRange, customEnd?: string): Date {
  if (range === "custom" && customEnd) {
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function getTrend(current: number, previous: number): TrendResult {
  if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

const stageOrder = ["Contacted", "Replied", "Sample Sent", "Negotiating", "Converted"];

export default function AnalyticsPage() : JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AgentStats;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const leadsQuery = query(collection(db, "leads"));
      const leadsSnapshot = await getDocs(leadsQuery);
      const leadsData = leadsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];
      setLeads(leadsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startDate = useMemo(
    () => getDateRangeStart(dateRange, customStart),
    [dateRange, customStart]
  );
  const endDate = useMemo(
    () => getDateRangeEnd(dateRange, customEnd),
    [dateRange, customEnd]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const leadDate = toDate(lead.createdAt);
      if (!leadDate) return false;
      return isDateInRange(leadDate, startDate, endDate);
    });
  }, [leads, startDate, endDate]);

  const previousPeriodLeads = useMemo(() => {
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodLength);
    const prevEnd = new Date(startDate.getTime() - 1);
    return leads.filter((lead) => {
      const leadDate = toDate(lead.createdAt);
      if (!leadDate) return false;
      return isDateInRange(leadDate, prevStart, prevEnd);
    });
  }, [leads, startDate, endDate]);

  const totalMessages = useMemo(
    () => filteredLeads.reduce((sum, lead) => sum + (lead.messagesCount || 0), 0),
    [filteredLeads]
  );

  const totalReplies = useMemo(
    () => filteredLeads.reduce((sum, lead) => sum + (lead.repliesCount || 0), 0),
    [filteredLeads]
  );

  const replyRate = useMemo(
    () => (totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0),
    [totalMessages, totalReplies]
  );

  const convertedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.status === "Converted").length,
    [filteredLeads]
  );

  const conversionRate = useMemo(
    () => (filteredLeads.length > 0 ? Math.round((convertedLeads / filteredLeads.length) * 100) : 0),
    [filteredLeads, convertedLeads]
  );

  const totalRevenue = useMemo(
    () =>
      filteredLeads
        .filter((lead) => lead.status === "Converted")
        .reduce((sum, lead) => sum + (lead.value || 0), 0),
    [filteredLeads]
  );

  const prevTotalMessages = useMemo(
    () => previousPeriodLeads.reduce((sum, lead) => sum + (lead.messagesCount || 0), 0),
    [previousPeriodLeads]
  );

  const prevTotalReplies = useMemo(
    () => previousPeriodLeads.reduce((sum, lead) => sum + (lead.repliesCount || 0), 0),
    [previousPeriodLeads]
  );

  const prevReplyRate = useMemo(
    () => (prevTotalMessages > 0 ? Math.round((prevTotalReplies / prevTotalMessages) * 100) : 0),
    [prevTotalMessages, prevTotalReplies]
  );

  const prevConvertedLeads = useMemo(
    () => previousPeriodLeads.filter((lead) => lead.status === "Converted").length,
    [previousPeriodLeads]
  );

  const prevConversionRate = useMemo(
    () =>
      previousPeriodLeads.length > 0
        ? Math.round((prevConvertedLeads / previousPeriodLeads.length) * 100)
        : 0,
    [previousPeriodLeads, prevConvertedLeads]
  );

  const prevTotalRevenue = useMemo(
    () =>
      previousPeriodLeads
        .filter((lead) => lead.status === "Converted")
        .reduce((sum, lead) => sum + (lead.value || 0), 0),
    [previousPeriodLeads]
  );

  const messagesTrend = getTrend(totalMessages, prevTotalMessages);
  const replyRateTrend = getTrend(replyRate, prevReplyRate);
  const conversionTrend = getTrend(conversionRate, prevConversionRate);
  const revenueTrend = getTrend(totalRevenue, prevTotalRevenue);

  const messagesChartData: DailyData[] = useMemo(() => {
    const days = 30;
    const data: DailyData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDateLabel(date);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
      );

      const dayLeads = leads.filter((lead) => {
        const leadDate = toDate(lead.createdAt);
        if (!leadDate) return false;
        return isDateInRange(leadDate, dayStart, dayEnd);
      });

      data.push({
        date: dateStr,
        messages: dayLeads.reduce((sum, lead) => sum + (lead.messagesCount || 0), 0),
        replies: dayLeads.reduce((sum, lead) => sum + (lead.repliesCount || 0), 0),
      });
    }
    return data;
  }, [leads]);

  const sourcesChartData: SourceData[] = useMemo(() => {
    const sourceMap = new Map<string, number>();
    filteredLeads.forEach((lead) => {
      const source = lead.source || "Other";
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    return Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      count,
    }));
  }, [filteredLeads]);

  const funnelChartData: FunnelData[] = useMemo(() => {
    const stageCounts = stageOrder.map((stage) => ({
      stage,
      count: filteredLeads.filter((lead) => lead.status === stage).length,
    }));

    return stageCounts.map((item, index) => {
      const prevCount = index > 0 ? stageCounts[index - 1].count : item.count;
      const rate = prevCount > 0 ? Math.round((item.count / prevCount) * 100) : 0;
      return { ...item, rate };
    });
  }, [filteredLeads]);

  const revenueChartData: MonthlyRevenue[] = useMemo(() => {
    const months = 12;
    const data: MonthlyRevenue[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = formatMonthLabel(date);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthLeads = leads.filter((lead) => {
        const leadDate = toDate(lead.createdAt);
        if (!leadDate || lead.status !== "Converted") return false;
        return isDateInRange(leadDate, monthStart, monthEnd);
      });

      data.push({
        month: monthStr,
        revenue: monthLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
      });
    }
    return data;
  }, [leads]);

  const replyRateChartData: ReplyRateData[] = useMemo(() => {
    const days = 30;
    const data: ReplyRateData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDateLabel(date);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
      );

      const dayLeads = leads.filter((lead) => {
        const leadDate = toDate(lead.createdAt);
        if (!leadDate) return false;
        return isDateInRange(leadDate, dayStart, dayEnd);
      });

      const msgs = dayLeads.reduce((sum, lead) => sum + (lead.messagesCount || 0), 0);
      const reps = dayLeads.reduce((sum, lead) => sum + (lead.repliesCount || 0), 0);
      const rate = msgs > 0 ? Math.round((reps / msgs) * 100) : 0;

      data.push({ date: dateStr, rate });
    }
    return data;
  }, [leads]);

  const agentStats: AgentStats[] = useMemo(() => {
    const agentMap = new Map<string, AgentStats>();
    filteredLeads.forEach((lead) => {
      const key = lead.assignedTo || lead.name || "Unknown";
      const existing = agentMap.get(key);
      const isConverted = lead.status === "Converted";
      if (existing) {
        existing.messagesSent += lead.messagesCount || 0;
        existing.replies += lead.repliesCount || 0;
        if (isConverted) {
          existing.revenue += lead.value || 0;
        }
      } else {
        agentMap.set(key, {
          id: lead.id,
          name: lead.name || "Unknown",
          agency: lead.agency || "Independent",
          messagesSent: lead.messagesCount || 0,
          replies: lead.repliesCount || 0,
          conversionRate: 0,
          revenue: isConverted ? lead.value || 0 : 0,
        });
      }
    });

    const result = Array.from(agentMap.values());
    const totalLeadsPerAgent = new Map<string, number>();
    filteredLeads.forEach((lead) => {
      const key = lead.assignedTo || lead.name || "Unknown";
      totalLeadsPerAgent.set(key, (totalLeadsPerAgent.get(key) || 0) + 1);
    });

    result.forEach((agent) => {
      const key = agent.name;
      const total = totalLeadsPerAgent.get(key) || 1;
      const converted = filteredLeads.filter(
        (l) => (l.assignedTo || l.name || "Unknown") === key && l.status === "Converted"
      ).length;
      agent.conversionRate = Math.round((converted / total) * 100);
    });

    return result;
  }, [filteredLeads]);

  const sortedAgents = useMemo(() => {
    if (!sortConfig) return agentStats;
    const sorted = [...agentStats];
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [agentStats, sortConfig]);

  const handleSort = (key: keyof AgentStats) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "desc" };
      }
      return { key, direction: current.direction === "asc" ? "desc" : "asc" };
    });
  };

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value);
    setShowCustomRange(value === "custom");
  };

  const handleRowClick = (agentId: string) => {
    router.push(`/dashboard/leads?agent=${agentId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-quaternary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
            <p className="text-text-secondary mt-1">
              Track your performance and conversion metrics
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCustomRange(!showCustomRange)}
              className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary hover:bg-bg-secondary/80 transition-colors"
            >
              <Calendar className="w-4 h-4 text-accent-quaternary" />
              {dateRangeOptions.find((o) => o.value === dateRange)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCustomRange && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${
                      dateRange === option.value
                        ? "text-accent-quaternary bg-accent-quaternary/10"
                        : "text-text-secondary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Custom Date Range */}
      {dateRange === "custom" && (
        <FadeIn delay={0.1}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-text-secondary mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary"
              />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0.1}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Messages</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {totalMessages.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {messagesTrend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-accent-secondary" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                  )}
                  <span
                    className={`text-sm ${
                      messagesTrend.isPositive ? "text-accent-secondary" : "text-danger"
                    }`}
                  >
                    {messagesTrend.value}%
                  </span>
                  <span className="text-sm text-text-secondary">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-accent-quaternary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-accent-quaternary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.15}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Reply Rate</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{replyRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  {replyRateTrend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-accent-secondary" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                  )}
                  <span
                    className={`text-sm ${
                      replyRateTrend.isPositive ? "text-accent-secondary" : "text-danger"
                    }`}
                  >
                    {replyRateTrend.value}%
                  </span>
                  <span className="text-sm text-text-secondary">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-accent-primary/10 rounded-lg">
                <Reply className="w-6 h-6 text-accent-secondary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Conversion Rate</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {conversionRate}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {conversionTrend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-accent-secondary" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                  )}
                  <span
                    className={`text-sm ${
                      conversionTrend.isPositive ? "text-accent-secondary" : "text-danger"
                    }`}
                  >
                    {conversionTrend.value}%
                  </span>
                  <span className="text-sm text-text-secondary">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-accent-tertiary/10 rounded-lg">
                <Percent className="w-6 h-6 text-accent-tertiary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {revenueTrend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-accent-secondary" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                  )}
                  <span
                    className={`text-sm ${
                      revenueTrend.isPositive ? "text-accent-secondary" : "text-danger"
                    }`}
                  >
                    {revenueTrend.value}%
                  </span>
                  <span className="text-sm text-text-secondary">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-accent-quaternary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-accent-quaternary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.3}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Messages vs Replies
            </h3>
            <div className="h-[300px]">
              <ChartMessages data={messagesChartData} />
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.35}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Lead Source Breakdown
            </h3>
            <div className="h-[300px]">
              <ChartSources data={sourcesChartData} />
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.4}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Conversion Funnel
            </h3>
            <div className="h-[300px]">
              <ChartFunnel data={funnelChartData} />
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.45}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Revenue Trend
            </h3>
            <div className="h-[300px]">
              <ChartRevenue data={revenueChartData} />
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Reply Rate Trend */}
      <FadeIn delay={0.5}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Reply Rate Trend (7-Day Moving Average)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={replyRateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Reply Rate"]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--accent-quaternary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent-quaternary)", r: 3 }}
                  activeDot={{ r: 5, fill: "var(--accent-quaternary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </FadeIn>

      {/* Top Performing Agents Table */}
      <FadeIn delay={0.55}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent-quaternary" />
            <h3 className="text-lg font-semibold text-text-primary">
              Top Performing Agents
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    onClick={() => handleSort("name")}
                    className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Name {sortConfig?.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("agency")}
                    className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Agency {sortConfig?.key === "agency" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("messagesSent")}
                    className="text-right py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Messages {sortConfig?.key === "messagesSent" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("replies")}
                    className="text-right py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Replies {sortConfig?.key === "replies" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("conversionRate")}
                    className="text-right py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Conv. Rate {sortConfig?.key === "conversionRate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("revenue")}
                    className="text-right py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    Revenue {sortConfig?.key === "revenue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAgents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-text-secondary"
                    >
                      No agents found in selected period
                    </td>
                  </tr>
                ) : (
                  sortedAgents.map((agent, index) => (
                    <motion.tr
                      key={agent.id + agent.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleRowClick(agent.id)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {agent.name}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{agent.agency}</td>
                      <td className="py-3 px-4 text-right text-text-primary">
                        {agent.messagesSent.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-text-primary">
                        {agent.replies.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            agent.conversionRate >= 20
                              ? "bg-accent-primary/10 text-accent-secondary"
                              : agent.conversionRate >= 10
                              ? "bg-accent-tertiary/10 text-accent-tertiary"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {agent.conversionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-text-primary font-medium">
                        {formatCurrency(agent.revenue)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
