/* filepath: components/SubscriberTable.tsx */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { NewsletterSubscriber } from "./NewsletterSubscribers";
import { cn } from "@/lib/utils";

interface SubscriberTableProps {
  subscribers: NewsletterSubscriber[];
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function SubscriberTable(: JSX.Element {
  subscribers,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: SubscriberTableProps) {
  const formatDate = (date: Date | string | Timestamp | null) => {
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Email
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Name
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Source
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <motion.tr
                key={subscriber.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent-quaternary" />
                    <span className="text-sm text-text-primary">{subscriber.email}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-secondary">
                  {subscriber.name || "—"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                      subscriber.status === "active"
                        ? "bg-accent-primary/20 text-accent-primary border-accent-primary/30"
                        : "bg-white/10 text-text-secondary border-white/10"
                    )}
                  >
                    {subscriber.status === "active" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {subscriber.status === "active" ? "Active" : "Unsubscribed"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(subscriber.createdAt)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-white/5 rounded text-text-secondary">
                    {subscriber.source || "website"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined" && window.confirm("Delete this subscriber?")) {
                          onDelete(subscriber.id);
                        }
                      }}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-accent-quaternary text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
