/* filepath: app/dashboard/blog/page.tsx */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  X,
  AlertCircle,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { DashboardLayout } from "@/components/sections/DashboardLayout";
import { StatCard } from "@/components/sections/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/types/index";

type PostStatus = "all" | "draft" | "published" | "scheduled";
type SortField = "date" | "views" | "title";
type SortOrder = "asc" | "desc";

const CATEGORIES = [
  "All",
  "AI Video",
  "Real Estate",
  "Agentic AI",
  "Learning Journey",
  "Tech",
  "Personal",
];

export default function BlogManagementPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    views: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    post: Post | null;
  }>({ open: false, post: null });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const postsPerPage = 10;

  useEffect(() => {
    if (authLoading) return;
    fetchPosts();
    fetchStats();
  }, [authLoading, statusFilter, categoryFilter, sortField, sortOrder]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );

      if (statusFilter !== "all") {
        q = query(q, where("status", "==", statusFilter));
      }

      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Post[];

      if (categoryFilter !== "All") {
        data = data.filter((p) => p.category === categoryFilter);
      }

      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        data = data.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            p.excerpt?.toLowerCase().includes(lower) ||
            p.content.toLowerCase().includes(lower)
        );
      }

      data.sort((a, b) => {
        let cmp = 0;
        if (sortField === "date") {
          const aTime = a.createdAt
            ? typeof a.createdAt === "object" && "seconds" in a.createdAt
              ? a.createdAt.seconds
              : 0
            : 0;
          const bTime = b.createdAt
            ? typeof b.createdAt === "object" && "seconds" in b.createdAt
              ? b.createdAt.seconds
              : 0
            : 0;
          cmp = bTime - aTime;
        } else if (sortField === "views") {
          cmp = (b.views || 0) - (a.views || 0);
        } else if (sortField === "title") {
          cmp = a.title.localeCompare(b.title);
        }
        return sortOrder === "asc" ? -cmp : cmp;
      });

      setPosts(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const totalSnap = await getCountFromServer(collection(db, "posts"));
      const publishedSnap = await getCountFromServer(
        query(collection(db, "posts"), where("status", "==", "published"))
      );
      const draftsSnap = await getCountFromServer(
        query(collection(db, "posts"), where("status", "==", "draft"))
      );
      const scheduledSnap = await getCountFromServer(
        query(collection(db, "posts"), where("status", "==", "scheduled"))
      );

      const allPostsSnap = await getDocs(collection(db, "posts"));
      const totalViews = allPostsSnap.docs.reduce(
        (sum, d) => sum + (d.data().views || 0),
        0
      );

      setStats({
        total: totalSnap.data().count,
        published: publishedSnap.data().count,
        drafts: draftsSnap.data().count,
        scheduled: scheduledSnap.data().count,
        views: totalViews,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.post) return;
    setActionLoading(deleteModal.post.id);
    try {
      await deleteDoc(doc(db, "posts", deleteModal.post.id));
      setPosts((prev) => prev.filter((p) => p.id !== deleteModal.post!.id));
      setDeleteModal({ open: false, post: null });
      fetchStats();
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (
    post: Post,
    newStatus: "published" | "draft"
  ) => {
    setActionLoading(post.id);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
        publishedAt:
          newStatus === "published" ? Timestamp.now() : post.publishedAt,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: newStatus, updatedAt: Timestamp.now() }
            : p
        )
      );
      fetchStats();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return CheckCircle2;
      case "draft":
        return FileText;
      case "scheduled":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-accent-primary/10 text-accent-primary";
      case "draft":
        return "bg-accent-tertiary/10 text-accent-tertiary";
      case "scheduled":
        return "bg-accent-quaternary/10 text-accent-quaternary";
      default:
        return "bg-bg-primary0/10 text-text-secondary";
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "—";
    try {
      const date =
        typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp
          ? (timestamp as Timestamp).toDate()
          : new Date(timestamp as string);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "—";
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Blog Posts</h1>
              <p className="mt-1 text-text-secondary">Manage your blog content</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/blog/new")}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-primary shadow-lg shadow-emerald-500/20 transition-colors hover:bg-accent-secondary"
            >
              <Plus className="h-4 w-4" />
              New Post
            </motion.button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              title="Total Posts"
              value={stats.total}
              icon={FileText}
              color="indigo"
            />
            <StatCard
              title="Published"
              value={stats.published}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Drafts"
              value={stats.drafts}
              icon={FileText}
              color="amber"
            />
            <StatCard
              title="Scheduled"
              value={stats.scheduled}
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Total Views"
              value={stats.views.toLocaleString()}
              icon={Eye}
              color="indigo"
            />
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.2}>
          <GlassCard className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
                  className="w-full rounded-lg border border-white/10 bg-bg-secondary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      fetchPosts();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as PostStatus)
                  }
                  className="rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    if (sortField === "date") {
                      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
                    } else {
                      setSortField("date");
                      setSortOrder("desc");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    sortField === "date"
                      ? "border-emerald-500/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Date
                </button>

                <button
                  onClick={() => {
                    if (sortField === "views") {
                      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
                    } else {
                      setSortField("views");
                      setSortOrder("desc");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    sortField === "views"
                      ? "border-emerald-500/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Views
                </button>

                <button
                  onClick={() => {
                    if (sortField === "title") {
                      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                    } else {
                      setSortField("title");
                      setSortOrder("asc");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    sortField === "title"
                      ? "border-emerald-500/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Title
                </button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.3}>
          <GlassCard className="overflow-hidden p-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : paginatedPosts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  No posts found
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {searchQuery
                    ? "Try adjusting your filters"
                    : "Get started by creating your first post"}
                </p>
                {!searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/blog/new")}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-secondary"
                  >
                    <Plus className="h-4 w-4" />
                    New Post
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Cover
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Title
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Category
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Status
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Date
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Views
                        </th>
                        <th className="px-4 py-3 font-medium text-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPosts.map((post, idx) => {
                        const StatusIcon = getStatusIcon(post.status);
                        return (
                          <motion.tr
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                            onClick={() =>
                              router.push(`/dashboard/blog/edit/${post.id}`)
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-bg-secondary">
                                {post.coverImage ? (
                                  <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <FileText className="h-5 w-5 text-text-secondary" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-xs">
                                <p className="line-clamp-1 font-medium text-text-primary">
                                  {post.title}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                                  {post.excerpt || "No excerpt"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-accent-quaternary/10 px-2.5 py-1 text-xs font-medium text-accent-quaternary">
                                {post.category || "Uncategorized"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColorClass(
                                  post.status
                                )}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {post.status.charAt(0).toUpperCase() +
                                  post.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-secondary">
                              {formatDate(post.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-text-secondary">
                              {(post.views || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/blog/edit/${post.id}`
                                    )
                                  }
                                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    window.open(`/blog/${post.slug}`, "_blank")
                                  }
                                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </motion.button>
                                {post.status === "draft" && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleStatusToggle(post, "published")
                                    }
                                    disabled={actionLoading === post.id}
                                    className="rounded-lg p-2 text-accent-primary transition-colors hover:bg-accent-primary/10"
                                    title="Publish"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </motion.button>
                                )}
                                {post.status === "published" && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleStatusToggle(post, "draft")
                                    }
                                    disabled={actionLoading === post.id}
                                    className="rounded-lg p-2 text-accent-tertiary transition-colors hover:bg-accent-tertiary/10"
                                    title="Unpublish"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    setDeleteModal({ open: true, post })
                                  }
                                  disabled={actionLoading === post.id}
                                  className="rounded-lg p-2 text-danger transition-colors hover:bg-danger/10"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                    <p className="text-sm text-text-secondary">
                      Showing{" "}
                      {(currentPage - 1) * postsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * postsPerPage,
                        posts.length
                      )}{" "}
                      of {posts.length} posts
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg border border-white/10 p-2 text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-accent-primary text-text-primary"
                              : "text-text-secondary hover:bg-white/10 hover:text-text-primary"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-white/10 p-2 text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </FadeIn>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteModal({ open: false, post: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                  <Trash2 className="h-6 w-6 text-danger" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  Delete Post
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Are you sure you want to delete &quot;{deleteModal.post?.title}
                  &quot;? This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ open: false, post: null })
                    }
                    className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!!actionLoading}
                    className="flex-1 rounded-lg bg-danger py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-danger disabled:opacity-50"
                  >
                    {actionLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
