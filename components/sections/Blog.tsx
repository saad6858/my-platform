/* filepath: components/sections/Blog.tsx */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { GlassCard } from "@/components/layout/GlassCard";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Post } from "@/types/index";

interface BlogPost extends Post {
  id: string;
}

function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function Blog() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  if (settingsLoading) return null;
  if (settings?.sections?.blog === false) return null;

  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        if (mounted) setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPosts();
    return () => { mounted = false; };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <SectionWrapper id="blog" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionLabel text="BLOG" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-4">
            Insights & Journey
          </h2>
          <p className="text-text-secondary text-lg mt-4 max-w-2xl">
            Thoughts on AI, real estate, and building in public.
          </p>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bg-secondary rounded-2xl h-[420px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={cardVariants}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <GlassCard className="overflow-hidden h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-primary/5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                          <span className="text-text-secondary text-sm">
                            No image
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-accent-primary text-bg-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-text-primary line-clamp-2 group-hover:underline decoration-accent-primary underline-offset-4 transition-all duration-300">
                        {post.title}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-2 mt-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {calculateReadTime(post.content)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-accent-primary text-sm font-medium group-hover:gap-2 transition-all duration-300">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-accent-primary text-bg-primary px-8 py-3.5 rounded-full font-semibold hover:bg-accent-secondary transition-colors duration-300"
            >
              View All Posts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
