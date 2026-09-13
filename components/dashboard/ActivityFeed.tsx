/* filepath: components/ActivityFeed.tsx */
"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  icon: React.ReactNode;
  text: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0 },
  };

  if (displayActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
        <Clock className="mb-2 h-8 w-8" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      {displayActivities.map((activity) => (
        <motion.li
          key={activity.id}
          variants={itemVariants}
          className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/5"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-quaternary/10 text-accent-quaternary">
            {activity.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-primary">{activity.text}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="h-3 w-3" /> {timeAgo(activity.timestamp)}
            </p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}
