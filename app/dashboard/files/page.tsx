/* filepath: app/dashboard/files/page.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  Search,
  X,
  FileImage,
  FileVideo,
  FileText,
  File,
  FolderOpen,
  ArrowUpDown,
  Image as ImageIcon,
  Film,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { FileUploader } from "@/components/dashboard/files/FileUploader";
import { FileGrid } from "@/components/dashboard/files/FileGrid";
import { formatDistanceToNow } from "date-fns";

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  mimeType: string;
  createdAt: Timestamp | null;
  publicId?: string;
  deleteToken?: string;
}

type FileFilter = "all" | "image" | "video" | "document";
type SortField = "date" | "name" | "size";
type SortOrder = "asc" | "desc";

const FILES_PER_PAGE = 12;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("doc") ||
    mimeType.includes("txt")
  )
    return FileText;
  return File;
}

function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export default function FileManagerPage(): JSX.Element {
  const { loading: authLoading } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FileFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    file: FileItem | null;
    newName: string;
  }>({ open: false, file: null, newName: "" });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    file: FileItem | null;
  }>({ open: false, file: null });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    storageUsed: 0,
    lastUpload: null as string | null,
  });

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "files"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as FileItem[];
      setFiles(data);

      const totalSize = data.reduce((sum, f) => sum + (f.size || 0), 0);
      const last = data[0]?.createdAt
        ? typeof data[0].createdAt === "object" &&
          data[0].createdAt !== null &&
          "toDate" in data[0].createdAt
          ? formatDistanceToNow(data[0].createdAt.toDate(), {
              addSuffix: true,
            })
          : "—"
        : "—";

      setStats({
        total: data.length,
        storageUsed: totalSize,
        lastUpload: last,
      });
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchFiles();
  }, [authLoading]);

  const filteredFiles = files.filter((f) => {
    if (filter !== "all" && getFileCategory(f.mimeType) !== filter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q);
    }
    return true;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
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
    } else if (sortField === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortField === "size") {
      cmp = (b.size || 0) - (a.size || 0);
    }
    return sortOrder === "asc" ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sortedFiles.length / FILES_PER_PAGE);
  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * FILES_PER_PAGE,
    currentPage * FILES_PER_PAGE
  );

  const handleDelete = async () => {
    if (!deleteModal.file) return;
    setActionLoading(deleteModal.file.id);
    try {
      if (deleteModal.file.deleteToken) {
        await deleteFromCloudinary(deleteModal.file.deleteToken).catch(() => {
          // Ignore Cloudinary delete errors
        });
      }
      await deleteDoc(doc(db, "files", deleteModal.file.id));
      setFiles((prev) => prev.filter((f) => f.id !== deleteModal.file!.id));
      setDeleteModal({ open: false, file: null });
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRename = async () => {
    if (!renameModal.file || !renameModal.newName.trim()) return;
    setActionLoading(renameModal.file.id);
    try {
      await updateDoc(doc(db, "files", renameModal.file.id), {
        name: renameModal.newName.trim(),
        updatedAt: Timestamp.now(),
      });
      setFiles((prev) =>
        prev.map((f) =>
          f.id === renameModal.file!.id
            ? { ...f, name: renameModal.newName.trim() }
            : f
        )
      );
      setRenameModal({ open: false, file: null, newName: "" });
    } catch (err) {
      console.error("Error renaming file:", err);
      alert("Failed to rename file.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url);
    }
  };

  const handleDownload = (url: string, name: string) => {
    if (typeof window === "undefined") return;
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadComplete = () => {
    setUploadModalOpen(false);
    fetchFiles();
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
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
              <h1 className="text-3xl font-bold text-text-primary">
                File Manager
              </h1>
              <p className="mt-1 text-text-secondary">
                Manage your uploaded files and assets
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-primary shadow-lg shadow-accent-primary/20 transition-colors hover:bg-accent-secondary"
            >
              <Upload className="h-4 w-4" />
              Upload
            </motion.button>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Files"
              value={stats.total}
              icon={FolderOpen}
              color="indigo"
            />
            <StatCard
              title="Storage Used"
              value={formatFileSize(stats.storageUsed)}
              icon={File}
              color="emerald"
            />
            <StatCard
              title="Last Upload"
              value={stats.lastUpload || "—"}
              icon={Upload}
              color="amber"
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
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-bg-secondary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {([
                  { value: "all", label: "All", icon: FolderOpen },
                  { value: "image", label: "Images", icon: ImageIcon },
                  { value: "video", label: "Videos", icon: Film },
                  { value: "document", label: "Documents", icon: FileSpreadsheet },
                ] as const).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      filter === f.value
                        ? "border-accent-primary/50 bg-accent-primary/10 text-accent-primary"
                        : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <f.icon className="h-4 w-4" />
                    {f.label}
                  </button>
                ))}

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
                      ? "border-accent-primary/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Date
                </button>

                <button
                  onClick={() => {
                    if (sortField === "name") {
                      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                    } else {
                      setSortField("name");
                      setSortOrder("asc");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    sortField === "name"
                      ? "border-accent-primary/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Name
                </button>

                <button
                  onClick={() => {
                    if (sortField === "size") {
                      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
                    } else {
                      setSortField("size");
                      setSortOrder("desc");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    sortField === "size"
                      ? "border-accent-primary/50 bg-accent-primary/10 text-accent-primary"
                      : "border-white/10 bg-bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Size
                </button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* File Grid */}
        <FadeIn delay={0.3}>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            </div>
          ) : paginatedFiles.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <FolderOpen className="h-12 w-12 text-text-secondary" />
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                No files found
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Upload your first file to get started"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-text-primary hover:bg-accent-secondary"
                >
                  <Upload className="h-4 w-4" />
                  Upload Files
                </motion.button>
              )}
            </div>
          ) : (
            <>
              <FileGrid
                files={paginatedFiles.map((f) => ({
                  id: f.id,
                  name: f.name,
                  url: f.url,
                  size: formatFileSize(f.size),
                  rawSize: f.size,
                  type: f.mimeType,
                  date: f.createdAt
                    ? typeof f.createdAt === "object" &&
                      f.createdAt !== null &&
                      "toDate" in f.createdAt
                      ? formatDistanceToNow(f.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : "—"
                    : "—",
                }))}
                onDelete={(id) => {
                  const file = files.find((f) => f.id === id);
                  if (file) setDeleteModal({ open: true, file });
                }}
                onCopyUrl={(url) => handleCopyUrl(url)}
                onDownload={(id) => {
                  const file = files.find((f) => f.id === id);
                  if (file) handleDownload(file.url, file.name);
                }}
                onPreview={(id) => {
                  const file = files.find((f) => f.id === id);
                  if (file) setPreviewFile(file);
                }}
                onRename={(id) => {
                  const file = files.find((f) => f.id === id);
                  if (file)
                    setRenameModal({ open: true, file, newName: file.name });
                }}
              />

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-text-secondary">
                    Showing{" "}
                    {(currentPage - 1) * FILES_PER_PAGE + 1} to{" "}
                    {Math.min(
                      currentPage * FILES_PER_PAGE,
                      sortedFiles.length
                    )}{" "}
                    of {sortedFiles.length} files
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
        </FadeIn>

        {/* Upload Modal */}
        <AnimatePresence>
          {uploadModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setUploadModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Upload Files
                  </h3>
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="rounded-lg p-1 text-text-secondary hover:text-text-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FileUploader onUpload={handleUploadComplete} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={() => setPreviewFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative mx-4 max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl"
              >
                <button
                  onClick={() => setPreviewFile(null)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-text-primary backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
                {previewFile.mimeType.startsWith("image/") ? (
                  <div className="relative max-h-[80vh]">
                    <Image
                      src={previewFile.url}
                      alt={previewFile.name}
                      width={1200}
                      height={800}
                      className="max-h-[80vh] w-auto object-contain"
                    />
                  </div>
                ) : previewFile.mimeType.startsWith("video/") ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="max-h-[80vh] w-full"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <FileText className="h-16 w-16 text-text-secondary" />
                    <p className="ml-4 text-text-primary">{previewFile.name}</p>
                  </div>
                )}
                <div className="border-t border-white/10 p-4">
                  <p className="font-medium text-text-primary">
                    {previewFile.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatFileSize(previewFile.size)} · {previewFile.mimeType}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rename Modal */}
        <AnimatePresence>
          {renameModal.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setRenameModal({ open: false, file: null, newName: "" })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-text-primary">
                  Rename File
                </h3>
                <input
                  type="text"
                  value={renameModal.newName}
                  onChange={(e) =>
                    setRenameModal((prev) => ({
                      ...prev,
                      newName: e.target.value,
                    }))
                  }
                  className="mt-4 w-full rounded-lg border border-white/10 bg-bg-primary px-4 py-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  autoFocus
                />
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      setRenameModal({ open: false, file: null, newName: "" })
                    }
                    className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    disabled={
                      !renameModal.newName.trim() ||
                      actionLoading === renameModal.file?.id
                    }
                    className="flex-1 rounded-lg bg-accent-primary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-secondary disabled:opacity-50"
                  >
                    {actionLoading === renameModal.file?.id
                      ? "Renaming..."
                      : "Rename"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteModal({ open: false, file: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                  <AlertTriangle className="h-6 w-6 text-danger" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  Delete File
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Are you sure you want to delete &quot;{deleteModal.file?.name}
                  &quot;? This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ open: false, file: null })
                    }
                    className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!!actionLoading}
                    className="flex-1 rounded-lg bg-danger py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-danger/80 disabled:opacity-50"
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
