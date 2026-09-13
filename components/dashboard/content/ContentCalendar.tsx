/* filepath: components/ContentCalendar.tsx */
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContentItem } from "@/types/index";

interface ContentCalendarProps {
  items: ContentItem[];
  onDateClick: (date: Date) => void;
  onItemMove: (itemId: string, newDate: Date) => void;
}

const platformColors: Record<string, string> = {
  "Blog Post": "bg-accent-primary",
  LinkedIn: "bg-accent-quaternary",
  Instagram: "bg-accent-quaternary",
  WhatsApp: "bg-accent-primary",
  Twitter: "bg-bg-primary0",
};

function getPlatformColor(platform: string): string {
  return platformColors[platform] || "bg-bg-primary0";
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ContentCalendar(: JSX.Element { items, onDateClick, onItemMove }: ContentCalendarProps) : JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    items.forEach((item) => {
      const date = toDate(item.scheduledDate);
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    return map;
  }, [items]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedItemId) {
      onItemMove(draggedItemId, date);
      setDraggedItemId(null);
    }
  };

  const today = new Date();
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">{monthLabel}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-secondary py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-lg bg-bg-primary/50"
              />
            );
          }

          const isToday = isSameDay(day, today);
          const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayItems = itemsByDate.get(dateKey) || [];
          const uniquePlatforms = [...new Set(dayItems.map((i) => i.platform))];

          return (
            <motion.div
              key={dateKey}
              whileHover={{ scale: 1.02 }}
              onClick={() => onDateClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`aspect-square rounded-lg border border-white/5 p-1.5 cursor-pointer transition-colors relative overflow-hidden ${
                isToday
                  ? "bg-accent-quaternary/10 border-accent-quaternary/30"
                  : "bg-bg-secondary/50 hover:bg-white/5"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-accent-quaternary" : "text-text-secondary"
                }`}
              >
                {day.getDate()}
              </span>

              {dayItems.length > 0 && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                  {uniquePlatforms.slice(0, 3).map((platform) => (
                    <div
                      key={platform}
                      className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`}
                      title={platform}
                    />
                  ))}
                  {uniquePlatforms.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-text-secondary" />
                  )}
                </div>
              )}

              {dayItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="mt-1 px-1.5 py-0.5 rounded text-[10px] truncate bg-white/5 text-text-primary cursor-move hover:bg-white/10 transition-colors"
                >
                  {item.title}
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(platformColors).map(([platform, colorClass]) => (
          <div key={platform} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
            <span className="text-xs text-text-secondary">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
