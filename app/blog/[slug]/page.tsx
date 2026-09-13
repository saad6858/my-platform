/* filepath: app/blog/[slug]/page.tsx */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { SEOHead } from "@/components/layout/SEOHead";
import { GlassCard } from "@/components/layout/GlassCard";
import { ShareButtons } from "@/components/ShareButtons";
import { BlogCard } from "@/components/BlogCard";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Post } from "@/types/index";

type BlogPost = Post & { id: string };

function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function renderMarkdown(content: string): JSX.Element {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;
  const getKey = () => `md-${key++}`;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={getKey()} className="text-2xl font-bold mt-8 mb-4 text-text-primary">
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={getKey()} className="text-3xl font-bold mt-8 mb-4 text-text-primary">
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={getKey()} className="border-l-4 border-accent-primary pl-4 italic text-text-secondary my-6">
          {line.slice(2)}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={getKey()} className="bg-bg-secondary rounded-lg p-4 overflow-x-auto my-6">
          <code className="text-sm font-mono text-text-primary">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    if (line.includes("`")) {
      const parts = line.split("`");
      const renderedParts: (string | JSX.Element)[] = [];
      for (let j = 0; j < parts.length; j++) {
        if (j % 2 === 1) {
          renderedParts.push(
            <code key={getKey()} className="bg-bg-secondary rounded px-2 py-0.5 font-mono text-sm text-accent-secondary">
              {parts[j]}
            </code>
          );
        } else {
          renderedParts.push(parts[j]);
        }
      }
      elements.push(
        <p key={getKey()} className="text-text-secondary leading-relaxed mb-4">
          {renderedParts}
        </p>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [line.slice(2)];
      while (
        i + 1 < lines.length &&
        (lines[i + 1].startsWith("- ") || lines[i + 1].startsWith("* "))
      ) {
        listItems.push(lines[i + 1].slice(2));
        i++;
      }
      elements.push(
        <ul key={getKey()} className="list-disc pl-6 mb-4 marker:text-accent-primary">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-text-secondary leading-relaxed mb-2">
              {item}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const listItems: string[] = [line.replace(/^\d+\. /, "")];
      while (i + 1 < lines.length && /^\d+\. /.test(lines[i + 1])) {
        listItems.push(lines[i + 1].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={getKey()} className="list-decimal pl-6 mb-4 marker:text-accent-primary">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-text-secondary leading-relaxed mb-2">
              {item}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") continue;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    if (linkRegex.test(line)) {
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;
      linkRegex.lastIndex = 0;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        parts.push(
          <a
            key={getKey()}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-secondary underline hover:text-accent-primary transition-colors"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      elements.push(
        <p key={getKey()} className="text-text-secondary leading-relaxed mb-4">
          {parts}
        </p>
      );
      continue;
    }

    elements.push(
      <p key={getKey()} className="text-text-secondary leading-relaxed mb-4">
        {line}
      </p>
    );
  }

  return <>{elements}</>;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPost() {
      try {
        const q = query(
          collection(db, "posts"),
          where("slug", "==", slug),
          where("status", "==", "published"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const postData = { id: doc.id, ...doc.data() } as BlogPost;
          if (mounted) setPost(postData);

          if (postData.category) {
            const relatedQ = query(
              collection(db, "posts"),
              where("status", "==", "published"),
              where("category", "==", postData.category),
              orderBy("publishedAt", "desc"),
              limit(4)
            );
            const relatedSnapshot = await getDocs(relatedQ);
            const related = relatedSnapshot.docs
              .map((d) => ({ id: d.id, ...d.data() } as BlogPost))
              .filter((p) => p.id !== postData.id)
              .slice(0, 3);
            if (mounted) setRelatedPosts(related);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) fetchPost();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <div className="h-[50vh] bg-bg-secondary animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-bg-secondary rounded-2xl h-96 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Post not found
          </h1>
          <Link
            href="/blog"
            className="text-accent-primary mt-4 inline-flex items-center gap-2 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
        </div>
      </main>
    );
  }

  const postUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEOHead
        title={`${post.title} — Blog`}
        description={post.excerpt}
        image={post.coverImage}
      />

      <main className="min-h-screen bg-bg-primary">
        {/* Cover Image */}
        <div className="relative h-[50vh] min-h-[400px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 pb-24">
          <GlassCard className="bg-bg-secondary rounded-2xl p-8 md:p-12">
            {/* Meta Bar */}
            <FadeIn>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-accent-primary text-bg-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  {calculateReadTime(post.content)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <User className="w-4 h-4" />
                  {post.author || "Anonymous"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
                {post.title}
              </h1>
            </FadeIn>

            {/* Article Content */}
            <motion.article
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {renderMarkdown(post.content)}
            </motion.article>

            {/* Share Buttons */}
            <motion.div
              className="mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                Share this post
              </h3>
              <ShareButtons url={postUrl} title={post.title} />
            </motion.div>
          </GlassCard>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-text-primary mb-8">
                Related Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard
                    key={relatedPost.id}
                    post={relatedPost}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Newsletter CTA */}
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 text-center">
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Enjoyed this?
              </h3>
              <p className="text-text-secondary mb-6">
                Subscribe for more insights on AI, real estate, and building in
                public.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-primary/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent-primary text-bg-primary rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </GlassCard>
          </motion.section>
        </div>
      </main>
    </>
  );
}
