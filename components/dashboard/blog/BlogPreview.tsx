/* filepath: components/dashboard/blog/BlogPreview.tsx */
"use client";

import DOMPurify from "dompurify";

import { useMemo } from "react";

interface BlogPreviewProps {
  content: string;
  className?: string;
}

export function BlogPreview(: JSX.Element { content, className }: BlogPreviewProps) : JSX.Element {
  const html = useMemo(() => {
    if (!content.trim()) {
      return '<p class="text-text-secondary italic">Start typing to see preview...</p>';
    }
    return markdownToHtml(content);
  }, [content]);

  return (
    <div
      className={`prose prose-invert prose-emerald max-w-none ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(DOMPurify.sanitize(html) }}
    />
  );
}

function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Code blocks
    .replace(
      /```([\w]*)([\s\S]*?)```/g,
      '<pre class="overflow-x-auto rounded-lg bg-bg-secondary p-4 my-4"><code class="font-mono text-sm text-accent-secondary">$2</code></pre>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-sm text-accent-secondary">$1</code>'
    )
    // Headers
    .replace(
      /^### (.*$)/gim,
      '<h3 class="mt-6 mb-3 text-xl font-bold text-text-primary">$1</h3>'
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="mt-8 mb-4 text-2xl font-bold text-text-primary">$1</h2>'
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="mt-10 mb-5 text-3xl font-bold text-text-primary">$1</h1>'
    )
    // Bold
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-text-primary">$1</strong>'
    )
    // Italic
    .replace(
      /\*(.*?)\*/g,
      '<em class="italic text-text-secondary">$1</em>'
    )
    // Strikethrough
    .replace(
      /~~(.*?)~~/g,
      '<del class="text-text-secondary/60">$1</del>'
    )
    // Blockquote
    .replace(
      /^> (.*$)/gim,
      '<blockquote class="my-4 border-l-4 border-emerald-500 bg-accent-primary/5 pl-4 py-2 italic text-text-secondary">$1</blockquote>'
    )
    // Horizontal rule
    .replace(
      /^---$/gim,
      '<hr class="my-6 border-white/10" />'
    )
    // Unordered list
    .replace(
      /^\s*[-*] (.*$)/gim,
      '<li class="ml-4 list-disc text-text-primary/80">$1</li>'
    )
    // Ordered list
    .replace(
      /^\s*\d+\. (.*$)/gim,
      '<li class="ml-4 list-decimal text-text-primary/80">$1</li>'
    )
    // Images
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />'
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent-secondary underline hover:text-accent-primary transition-colors" target="_blank" rel="noopener">$1</a>'
    )
    // Paragraphs
    .replace(
      /^(?!<[\/]?[a-z])(.+)$/gim,
      '<p class="my-3 leading-relaxed text-text-primary/80">$1</p>'
    )
    // Line breaks
    .replace(/\n/g, "");

  // Wrap consecutive li in ul/ol
  html = html.replace(
    /(<li class="ml-4 list-disc[^>]*>.*?<\/li>)(\s*<li class="ml-4 list-disc[^>]*>.*?<\/li>)+/g,
    (match) => `<ul class="my-3 space-y-1">${match}</ul>`
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal[^>]*>.*?<\/li>)(\s*<li class="ml-4 list-decimal[^>]*>.*?<\/li>)+/g,
    (match) => `<ol class="my-3 space-y-1">${match}</ol>`
  );

  return html;
}
