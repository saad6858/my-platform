/* filepath: app/dashboard/blog/new/page.tsx */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Save,
  CheckCircle2,
  Upload,
  RefreshCw,
  X,
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  List,
  ListOrdered,
  Minus,
  Clock,
  FileText,
  Star,
  AlertTriangle,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { DashboardLayout } from "@/components/sections/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { BlogEditor } from "@/components/dashboard/blog/BlogEditor";
import { BlogPreview } from "@/components/dashboard/blog/BlogPreview";
import { SEOPreview } from "@/components/dashboard/blog/SEOPreview";

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

const LOCAL_STORAGE_KEY = "blog-draft-new";

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

const initialFormData: FormData = {
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
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>(initialFormData);
  const [editorMode, setEditorMode] = useState<EditorMode>("split");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setAutoSaveStatus("saving");
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      setTimeout(() => setAutoSaveStatus("saved"), 500);
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, [form]);

  // Word count
  useEffect(() => {
    const words = form.content
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    setWordCount(words);
  }, [form.content]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!form.slug || form.slug === generateSlug(form.title)) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

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

  const handleSave = async (status: PostStatus) => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    if (status === "published") setPublishing(true);
    else setSaving(true);

    try {
      const postData = {
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
        status,
        scheduledAt:
          status === "scheduled" && form.scheduledAt
            ? Timestamp.fromDate(new Date(form.scheduledAt))
            : null,
        featured: form.featured,
        author: {
          uid: user?.uid,
          name: user?.displayName || "Admin",
          email: user?.email,
        },
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: status === "published" ? serverTimestamp() : null,
      };

      await addDoc(collection(db, "posts"), postData);
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      router.push("/dashboard/blog");
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                New Blog Post
              </h1>
              <p className="mt-1 text-text-secondary">
                Create and publish new content
              </p>
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
                onClick={() => handleSave("draft")}
                disabled={saving || publishing}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/5"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Draft"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave("published")}
                disabled={saving || publishing}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-primary shadow-lg shadow-emerald-500/20 transition-colors hover:bg-accent-secondary"
              >
                <CheckCircle2 className="h-4 w-4" />
                {publishing ? "Publishing..." : "Publish"}
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

          {/* RIGHT: SEO + Settings */}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
