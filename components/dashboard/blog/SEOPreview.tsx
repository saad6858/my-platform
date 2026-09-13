/* filepath: components/dashboard/blog/SEOPreview.tsx */
"use client";

import Image from "next/image";

interface SEOPreviewProps {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
}

export function SEOPreview(: JSX.Element {
  title,
  description,
  url,
  ogImage,
}: SEOPreviewProps) {
  const displayTitle = title || "Your Post Title";
  const displayDesc = description || "Your post description will appear here...";
  const displayUrl = url || "https://yourdomain.com/blog/post-slug";

  return (
    <div className="space-y-6">
      {/* Google Search Preview */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Google Search Result
        </h4>
        <div className="rounded-lg border border-white/5 bg-bg-primary p-4">
          <div className="space-y-1">
            <p className="truncate text-xs text-text-secondary">
              {displayUrl.replace(/^https:\/\//, "")}
            </p>
            <h5
              className="text-lg font-medium text-accent-quaternary hover:underline cursor-pointer"
              style={{ color: "#8ab4f8" }}
            >
              {displayTitle.length > 60
                ? displayTitle.substring(0, 57) + "..."
                : displayTitle}
            </h5>
            <p className="text-sm leading-relaxed text-text-secondary">
              {displayDesc.length > 160
                ? displayDesc.substring(0, 157) + "..."
                : displayDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Social Card Preview */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Social Share Card
        </h4>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-bg-secondary">
          {ogImage ? (
            <div className="relative h-32 w-full overflow-hidden">
              <Image
                src={ogImage}
                alt="OG preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-bg-secondary">
              <span className="text-sm text-text-secondary/50">No image set</span>
            </div>
          )}
          <div className="p-3">
            <p className="truncate text-xs uppercase tracking-wide text-text-secondary">
              {displayUrl.replace(/^https:\/\//, "").split("/")[0]}
            </p>
            <h5 className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary">
              {displayTitle}
            </h5>
            <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
              {displayDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Character Counts */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-lg border p-3 ${
            displayTitle.length > 60
              ? "border-accent-tertiary/30 bg-accent-tertiary/5"
              : "border-accent-primary/30 bg-accent-primary/5"
          }`}
        >
          <p className="text-xs text-text-secondary">Title Length</p>
          <p
            className={`text-lg font-semibold ${
              displayTitle.length > 60 ? "text-accent-tertiary" : "text-accent-primary"
            }`}
          >
            {displayTitle.length}{" "}
            <span className="text-xs text-text-secondary">/ 60</span>
          </p>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            displayDesc.length > 160
              ? "border-accent-tertiary/30 bg-accent-tertiary/5"
              : "border-accent-primary/30 bg-accent-primary/5"
          }`}
        >
          <p className="text-xs text-text-secondary">Description Length</p>
          <p
            className={`text-lg font-semibold ${
              displayDesc.length > 160 ? "text-accent-tertiary" : "text-accent-primary"
            }`}
          >
            {displayDesc.length}{" "}
            <span className="text-xs text-text-secondary">/ 160</span>
          </p>
        </div>
      </div>
    </div>
  );
}
