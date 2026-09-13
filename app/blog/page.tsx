/* filepath: app/blog/page.tsx */
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import {
  FileText,
  TrendingUp,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { SEOHead } from "@/components/layout/SEOHead";
import { BlogCard } from "@/components/BlogCard";
import { BlogSearch } from "@/components/BlogSearch";
import { GlassCard } from "@/components/layout/GlassCard";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Post } from "@/types/index";

type BlogPost = Post & { id: string };

const CATEGORIES = [
  "All",
  "AI Video",
  "Real Estate",
  "Agentic AI",
  "Learning Journey",
  "Tech",
  "Personal",
];

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        if (mounted) setPosts(fetchedPosts);

        const popularQ = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("views", "desc"),
          limit(3)
        );
        const popularSnapshot = await getDocs(popularQ);
        const fetchedPopular = popularSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        if (mounted) setPopularPosts(fetchedPopular);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPosts();
    return () => { mounted = false; };
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (activeCategory !== "All") {
      filtered = filtered.filter((post) => post.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(queryLower) ||
          post.excerpt.toLowerCase().includes(queryLower) ||
          post.content.toLowerCase().includes(queryLower)
      );
    }
    return filtered;
  }, [posts, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    posts.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      <SEOHead
        title="Blog — Insights & Journey"
        description="Thoughts on AI, real estate, and building in public."
      />

      <main className="min-h-screen bg-bg-primary">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary">
                Insights & Journey
              </h1>
              <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">
                Thoughts on AI, real estate, and building in public.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <BlogSearch
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search articles..."
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-accent-primary text-bg-primary"
                      : "border border-white/10 text-text-secondary hover:border-accent-primary/50 hover:text-text-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-bg-secondary rounded-2xl h-[420px] animate-pulse"
                      />
                    ))}
                  </div>
                ) : paginatedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <FileText className="w-16 h-16 text-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">
                      No posts found
                    </h3>
                    <p className="text-text-secondary mt-2">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      layout
                    >
                      <AnimatePresence mode="popLayout">
                        {paginatedPosts.map((post, index) => (
                          <BlogCard
                            key={post.id}
                            post={post}
                            index={index}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-white/10 text-text-secondary disabled:opacity-30 hover:border-accent-primary/50 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                              currentPage === page
                                ? "bg-accent-primary text-bg-primary"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
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
                          className="p-2 rounded-lg border border-white/10 text-text-secondary disabled:opacity-30 hover:border-accent-primary/50 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block w-80">
                <div className="sticky top-24 space-y-6">
                  {/* Search Widget */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Search
                    </h3>
                    <BlogSearch
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search..."
                    />
                  </GlassCard>

                  {/* Categories */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Categories
                    </h3>
                    <ul className="space-y-2">
                      {CATEGORIES.map((category) => (
                        <li key={category}>
                          <button
                            onClick={() => handleCategoryChange(category)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                              activeCategory === category
                                ? "bg-accent-primary/10 text-accent-primary"
                                : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                          >
                            <span>{category}</span>
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full">
                              {categoryCounts[category] || 0}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  {/* Popular Posts */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent-primary" />
                      Popular
                    </h3>
                    <div className="space-y-4">
                      {popularPosts.map((post) => (
                        <a
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <h4 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-text-secondary mt-1">
                            {post.views?.toLocaleString() || 0} views
                          </p>
                        </a>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Newsletter */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent-primary" />
                      Newsletter
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Get the latest posts delivered to your inbox.
                    </p>
                    <form
                      onSubmit={(e) => { e.preventDefault(); }}
                      className="space-y-3"
                    >
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50"
                      />
                      <button
                        type="submit"
                        className="w-full bg-accent-primary text-bg-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-secondary transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                  </GlassCard>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
