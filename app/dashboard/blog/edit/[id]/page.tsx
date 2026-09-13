/* filepath: app/dashboard/blog/edit/[id]/page.tsx */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Save,
  CheckCircle2,
  Upload,
  RefreshCw,
  X,
  Clock,
  FileText,
  Star,
  AlertTriangle,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { DashboardLayout } from "@/components/sections/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { BlogEditor } from "@/components/dashboard/blog/BlogEditor";
import { BlogPreview } from "@/components/dashboard/blog/BlogPreview";
import { SEOPreview } from "@/components/dashboard/blog/SEOPreview";
import { format } from "date-fns";
import type { Post } from "@/types/index";

type EditorMode = "split" | "write" | "preview";
type PostStatus = "draft" | "published" | "scheduled";

const CATEGORIES = [
  "AI Video",
  "Real Estate",
  "Agentic AI",
  "Learning Journey",
  "Tech",
  "Personal",
];

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
  status: PostStatus;
  scheduledAt: string;
  featured: boolean;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

function timestampToInputValue(ts: unknown): string {
  if (!ts) return "";
  try {
    const date =
      typeof ts === "object" && ts !== null && "toDate" in ts
        ? (ts as Timestamp).toDate()
        : new Date(ts as string);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

function timestampToDisplay(ts: unknown): string {
  if (!ts) return "—";
  try {
    const date =
      typeof ts === "object" && ts !== null && "toDate" in ts
        ? (ts as Timestamp).toDate()
        : new Date(ts as string);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch {
    return "—";
  }
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Tech",
    tags: [],
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    keywords: [],
    status: "draft",
    scheduledAt: "",
    featured: false,
  });
  const [editorMode, setEditorMode] = useState<EditorMode>("split");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch post
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "posts", postId));
        if (!snap.exists()) {
          router.push("/dashboard/blog");
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Post;
        setPost(data);
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          category: data.category || "Tech",
          tags: data.tags || [],
          coverImage: data.coverImage || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          ogImage: data.ogImage || "",
          keywords: data.keywords || [],
          status: (data.status as PostStatus) || "draft",
          scheduledAt: timestampToInputValue(data.scheduledAt),
          featured: data.featured || false,
        });
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    const interval = setInterval(() => {
      setAutoSaveStatus("saving");
      localStorage.setItem(`blog-draft-${postId}`, JSON.stringify(form));
      setTimeout(() => setAutoSaveStatus("saved"), 500);
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, [form, postId, loading]);

  // Word count
  useEffect(() => {
    const words = form.content
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    setWordCount(words);
  }, [form.content]);

  const handleChange = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const kw = keywordInput.trim().replace(/,/g, "");
      if (kw && !form.keywords.includes(kw)) {
        setForm((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
      }
      setKeywordInput("");
    }
  };

  const handleKeywordRemove = (kw: string) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setCoverUploading(true);
    setCoverProgress(0);

    const now = new Date();
    const path = `uploads/${now.getFullYear()}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setCoverProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setCoverUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setForm((prev) => ({ ...prev, coverImage: url, ogImage: url }));
        setCoverUploading(false);
        setCoverProgress(0);
      }
    );
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return "Title is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.content.trim()) return "Content is required";
    if (form.status === "scheduled" && !form.scheduledAt)
      return "Schedule date is required";
    return null;
  };

  const handleUpdate = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        tags: form.tags,
        coverImage: form.coverImage,
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || form.excerpt,
        ogImage: form.ogImage || form.coverImage,
        keywords: form.keywords,
        status: form.status,
        scheduledAt:
          form.status === "scheduled" && form.scheduledAt
            ? Timestamp.fromDate(new Date(form.scheduledAt))
            : null,
        featured: form.featured,
        updatedAt: serverTimestamp(),
        publishedAt:
          form.status === "published" && !post?.publishedAt
            ? serverTimestamp()
            : post?.publishedAt || null,
      };

      await updateDoc(doc(db, "posts", postId), updateData);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`blog-draft-${postId}`);
      }
      router.push("/dashboard/blog");
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "posts", postId));
      if (typeof window !== "undefined") {
        localStorage.removeItem(`blog-draft-${postId}`);
      }
      router.push("/dashboard/blog");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
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
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/blog")}
                className="rounded-lg border border-white/10 p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Edit Blog Post
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Created {timestampToDisplay(post?.createdAt)} · Modified{" "}
                  {timestampToDisplay(post?.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {autoSaveStatus !== "idle" && (
                <span
                  className={`text-xs ${
                    autoSaveStatus === "saved"
                      ? "text-accent-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {autoSaveStatus === "saving" ? "Saving..." : "Auto-saved"}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate}
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-primary shadow-lg shadow-emerald-500/20 transition-colors hover:bg-accent-secondary"
              >
                <Save className="h-4 w-4" />
                {updating ? "Updating..." : "Update"}
              </motion.button>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* LEFT: Editor */}
          <div className="space-y-6 lg:col-span-3">
            <FadeIn delay={0.1}>
              <GlassCard className="space-y-6 p-6">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Post Title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full border-0 border-b border-white/10 bg-transparent pb-3 text-[40px] font-bold leading-tight text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Slug */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">Slug:</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        handleChange("slug", generateSlug(form.title))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-secondary hover:text-text-primary"
                      title="Regenerate slug"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-secondary">
                      Excerpt
                    </label>
                    <span
                      className={`text-xs ${
                        form.excerpt.length > 160
                          ? "text-danger"
                          : "text-text-secondary"
                      }`}
                    >
                      {form.excerpt.length}/160
                    </span>
                  </div>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => handleChange("excerpt", e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Brief description of the post..."
                    className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Category & Tags */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        handleChange("category", e.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagAdd}
                      placeholder="Add tag and press Enter"
                      className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-accent-quaternary/10 px-2.5 py-1 text-xs font-medium text-accent-quaternary"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagRemove(tag)}
                            className="hover:text-text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Cover Image
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      type="text"
                      value={form.coverImage}
                      onChange={(e) =>
                        handleChange("coverImage", e.target.value)
                      }
                      placeholder="Image URL or upload..."
                      className="flex-1 rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={coverUploading}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {coverUploading
                        ? `${Math.round(coverProgress)}%`
                        : "Upload"}
                    </motion.button>
                  </div>
                  {form.coverImage && (
                    <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg">
                      <Image
                        src={form.coverImage}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="text-sm font-medium text-text-secondary">
                      Content
                    </label>
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-bg-secondary p-1">
                      {(["split", "write", "preview"] as EditorMode[]).map(
                        (mode) => (
                          <button
                            key={mode}
                            onClick={() => setEditorMode(mode)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                              editorMode === mode
                                ? "bg-accent-primary/20 text-accent-primary"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {mode}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Editor Area */}
                  <div
                    className={`grid gap-0 overflow-hidden rounded-lg border border-white/10 ${
                      editorMode === "split"
                        ? "grid-cols-1 lg:grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {(editorMode === "split" || editorMode === "write") && (
                      <div
                        className={`${
                          editorMode === "split"
                            ? "border-b border-white/10 lg:border-b-0 lg:border-r"
                            : ""
                        }`}
                      >
                        <BlogEditor
                          value={form.content}
                          onChange={(v) => handleChange("content", v)}
                          minHeight={500}
                        />
                      </div>
                    )}
                    {(editorMode === "split" || editorMode === "preview") && (
                      <div className="min-h-[500px] overflow-y-auto bg-bg-primary p-4">
                        <BlogPreview content={form.content} />
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                    <span>Markdown supported</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          </div>

          {/* RIGHT: SEO + Settings + Danger Zone */}
          <div className="space-y-6 lg:col-span-2">
            <FadeIn delay={0.2}>
              <GlassCard className="space-y-6 p-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  SEO Settings
                </h3>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-secondary">
                      Meta Title
                    </label>
                    <span
                      className={`text-xs ${
                        (form.metaTitle || form.title).length > 60
                          ? "text-accent-tertiary"
                          : "text-text-secondary"
                      }`}
                    >
                      {(form.metaTitle || form.title).length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) =>
                      handleChange("metaTitle", e.target.value)
                    }
                    placeholder={form.title}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-secondary">
                      Meta Description
                    </label>
                    <span
                      className={`text-xs ${
                        (form.metaDescription || form.excerpt).length > 160
                          ? "text-accent-tertiary"
                          : "text-text-secondary"
                      }`}
                    >
                      {(form.metaDescription || form.excerpt).length}/160
                    </span>
                  </div>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) =>
                      handleChange("metaDescription", e.target.value)
                    }
                    placeholder={form.excerpt}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={form.ogImage}
                    onChange={(e) => handleChange("ogImage", e.target.value)}
                    placeholder={form.coverImage}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                  />
                  {form.ogImage && (
                    <div className="relative mt-2 h-24 w-full overflow-hidden rounded-lg">
                      <Image
                        src={form.ogImage}
                        alt="OG preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordAdd}
                    placeholder="Add keyword and press Enter"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-2.5 py-1 text-xs font-medium text-accent-primary"
                      >
                        {kw}
                        <button
                          onClick={() => handleKeywordRemove(kw)}
                          className="hover:text-text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.3}>
              <GlassCard className="space-y-6 p-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  Post Settings
                </h3>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Status
                  </label>
                  <div className="mt-2 space-y-2">
                    {(["draft", "published", "scheduled"] as PostStatus[]).map(
                      (status) => (
                        <label
                          key={status}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                            form.status === status
                              ? "border-emerald-500/50 bg-accent-primary/10"
                              : "border-white/10 bg-transparent hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={form.status === status}
                            onChange={() => handleChange("status", status)}
                            className="h-4 w-4 accent-emerald-500"
                          />
                          <div className="flex items-center gap-2">
                            {status === "draft" && (
                              <FileText className="h-4 w-4 text-accent-tertiary" />
                            )}
                            {status === "published" && (
                              <CheckCircle2 className="h-4 w-4 text-accent-primary" />
                            )}
                            {status === "scheduled" && (
                              <Clock className="h-4 w-4 text-accent-quaternary" />
                            )}
                            <span className="text-sm font-medium capitalize text-text-primary">
                              {status}
                            </span>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {form.status === "scheduled" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="text-sm font-medium text-text-secondary">
                        Schedule Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) =>
                          handleChange("scheduledAt", e.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-white/10 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Author
                  </label>
                  <input
                    type="text"
                    value={user?.displayName || "Admin"}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-lg border border-white/10 bg-bg-secondary/50 px-3 py-2.5 text-sm text-text-secondary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-primary">
                      Featured Post
                    </label>
                    <p className="text-xs text-text-secondary">
                      Highlight on homepage
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange("featured", !form.featured)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.featured ? "bg-accent-primary" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.featured ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <GlassCard className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  Preview
                </h3>
                <SEOPreview
                  title={form.metaTitle || form.title}
                  description={form.metaDescription || form.excerpt}
                  url={`${siteUrl}/blog/${form.slug}`}
                  ogImage={form.ogImage || form.coverImage}
                />
              </GlassCard>
            </FadeIn>

            {/* Danger Zone */}
            <FadeIn delay={0.5}>
              <GlassCard className="space-y-4 border-danger/20 p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                  <h3 className="text-lg font-semibold text-danger">
                    Danger Zone
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  Once deleted, this post cannot be recovered.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-text-primary"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Post
                </motion.button>
              </GlassCard>
            </FadeIn>
          </div>
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteModal(false)}
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
                  Are you sure you want to delete &quot;{post?.title}&quot;? This
                  action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setDeleteModal(false)}
                    className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-danger py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-danger disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
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
