/* filepath: components/ContactSubmissions.tsx */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Download,
  Search,
  Filter,
  Eye,
  Reply,
  Archive,
  Trash2,
  Check,
  Clock,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { ContactDetailModal } from "./ContactDetailModal";
import { cn } from "@/lib/utils";

export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: ContactStatus;
  createdAt: Timestamp | Date;
  repliedAt?: Timestamp | Date;
  replyMessage?: string;
  source?: string;
}

const statusConfig: Record<
  ContactStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  new: { label: "New", color: "bg-accent-primary/20 text-accent-primary border-accent-primary/30", icon: Mail },
  read: { label: "Read", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30", icon: Eye },
  replied: { label: "Replied", color: "bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30", icon: Reply },
  archived: { label: "Archived", color: "bg-white/10 text-text-secondary border-white/10", icon: Archive },
};

export function ContactSubmissions() : JSX.Element {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [detailContact, setDetailContact] = useState<ContactSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof ContactSubmission>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, "contact_submissions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || "",
            email: d.email || "",
            phone: d.phone || "",
            service: d.service || "",
            message: d.message || "",
            status: (d.status as ContactStatus) || "new",
            createdAt: d.createdAt || new Date(),
            repliedAt: d.repliedAt,
            replyMessage: d.replyMessage || "",
            source: d.source || "website",
          } as ContactSubmission;
        });
        setContacts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading contacts:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q) ||
          (c.service && c.service.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((c) => {
        const date = c.createdAt instanceof Date ? c.createdAt : c.createdAt.toDate();
        if (dateFilter === "today") {
          return date.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return date >= monthAgo;
        }
        return true;
      });
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal instanceof Timestamp && bVal instanceof Timestamp) {
        return sortDirection === "asc"
          ? aVal.toMillis() - bVal.toMillis()
          : bVal.toMillis() - aVal.toMillis();
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === "asc"
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return result;
  }, [contacts, searchQuery, statusFilter, dateFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter((c) => c.status === "new").length,
      read: contacts.filter((c) => c.status === "read").length,
      replied: contacts.filter((c) => c.status === "replied").length,
      archived: contacts.filter((c) => c.status === "archived").length,
    };
  }, [contacts]);

  const updateStatus = async (id: string, status: ContactStatus) => {
    try {
      await updateDoc(doc(db, "contact_submissions", id), { status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReply = async (id: string, replyMessage: string) => {
    try {
      await updateDoc(doc(db, "contact_submissions", id), {
        status: "replied",
        replyMessage,
        repliedAt: new Date(),
      });
      setDetailContact(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contact_submissions", id));
      setSelectedContacts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleBulkAction = async (action: "read" | "archive" | "delete") => {
    const promises = Array.from(selectedContacts).map(async (id) => {
      if (action === "delete") {
        await deleteDoc(doc(db, "contact_submissions", id));
      } else {
        await updateDoc(doc(db, "contact_submissions", id), {
          status: action === "read" ? "read" : "archived",
        });
      }
    });
    await Promise.all(promises);
    setSelectedContacts(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === paginatedContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(paginatedContacts.map((c) => c.id)));
    }
  };

  const exportData = () => {
    const data = filteredContacts.map((c) => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone || "",
      Service: c.service || "",
      Message: c.message,
      Status: c.status,
      Date: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt.toDate().toISOString(),
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
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Timestamp | Date) => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
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
          <h1 className="text-2xl font-bold text-text-primary">Contact Submissions</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and respond to contact form submissions</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm font-medium hover:bg-white/5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-text-primary" },
          { label: "New", value: stats.new, color: "text-accent-primary" },
          { label: "Read", value: stats.read, color: "text-accent-quaternary" },
          { label: "Replied", value: stats.replied, color: "text-accent-tertiary" },
          { label: "Archived", value: stats.archived, color: "text-text-secondary" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
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
            placeholder="Search by name, email, message..."
            className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary placeholder:text-text-secondary/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ContactStatus | "all");
              setCurrentPage(1);
            }}
            className="pl-9 pr-8 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent-quaternary"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value as typeof dateFilter);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent-quaternary"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedContacts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-accent-quaternary/10 border border-accent-quaternary/20 rounded-lg"
          >
            <span className="text-sm text-text-primary">
              {selectedContacts.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={() => handleBulkAction("read")}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-accent-quaternary hover:bg-accent-quaternary/10 rounded transition-colors"
            >
              <Eye className="w-3 h-3" />
              Mark Read
            </button>
            <button
              onClick={() => handleBulkAction("archive")}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-primary0/10 rounded transition-colors"
            >
              <Archive className="w-3 h-3" />
              Archive
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
            <button
              onClick={() => setSelectedContacts(new Set())}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4">
                  <button
                    onClick={toggleSelectAll}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {selectedContacts.size === paginatedContacts.length && paginatedContacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => {
                    setSortField("name");
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  }}
                >
                  Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Phone</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Service</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Message</th>
                <th
                  className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase cursor-pointer hover:text-text-primary transition-colors"
                  onClick={() => {
                    setSortField("createdAt");
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  }}
                >
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedContacts.map((contact) => {
                  const status = statusConfig[contact.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelect(contact.id)}
                          className="text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {selectedContacts.has(contact.id) ? (
                            <CheckSquare className="w-4 h-4 text-accent-quaternary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {contact.status === "new" && (
                            <span className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
                          )}
                          <span className="text-sm font-medium text-text-primary">{contact.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{contact.email}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{contact.phone || "—"}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{contact.service || "—"}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary max-w-[200px]">
                        <span className="truncate block">{truncate(contact.message, 50)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            status.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailContact(contact)}
                            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {contact.status === "new" && (
                            <button
                              onClick={() => updateStatus(contact.id, "read")}
                              className="p-1.5 text-accent-quaternary hover:bg-accent-quaternary/10 rounded transition-colors"
                              title="Mark Read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDetailContact(contact)}
                            className="p-1.5 text-accent-tertiary hover:bg-accent-tertiary/10 rounded transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStatus(contact.id, "archived")}
                            className="p-1.5 text-text-secondary hover:bg-bg-primary0/10 rounded transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {paginatedContacts.length === 0 && (
          <div className="py-16 text-center">
            <Mail className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
            <p className="text-text-secondary">No contact submissions found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of{" "}
              {filteredContacts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Detail Modal */}
      <ContactDetailModal
        contact={detailContact}
        onClose={() => setDetailContact(null)}
        onStatusChange={updateStatus}
        onReply={handleReply}
        onDelete={handleDelete}
      />
    </div>
  );
}
