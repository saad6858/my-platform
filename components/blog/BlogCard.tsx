/* filepath: components/BlogCard.tsx */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import type { Post } from "@/types/index";

interface BlogCardProps {
  post: Post & { id: string };
  index: number;
  variant?: "default" | "featured" | "compact";
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

export function BlogCard({ post, index, variant = "default" }: BlogCardProps) {
  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Link href={`/blog/${post.slug}`} className="group flex gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-bg-secondary shrink-0">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-bg-secondary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishedAt)}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Link href={`/blog/${post.slug}`} className="group block">
          <GlassCard className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-primary/5">
            <div className="relative aspect-[16/9] overflow-hidden">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-bg-secondary" />
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-accent-primary text-bg-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-text-primary group-hover:underline decoration-accent-primary underline-offset-4 transition-all duration-300">
                {post.title}
              </h2>
              <p className="text-text-secondary mt-2 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {calculateReadTime(post.content)}
                </span>
              </div>
            </div>
          </GlassCard>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <GlassCard className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-primary/5">
          <div className="relative aspect-[16/10] overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-bg-secondary" />
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-accent-primary text-bg-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                {post.category}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-text-primary group-hover:underline decoration-accent-primary underline-offset-4 transition-all duration-300">
              {post.title}
            </h3>
            <p className="text-text-secondary text-sm mt-2 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {calculateReadTime(post.content)}
              </span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.article>
  );
}
