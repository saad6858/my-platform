/* filepath: components/PortfolioCard.tsx */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { PortfolioItem } from "./types";

interface PortfolioCardProps {
  project: PortfolioItem;
  index: number;
  featured?: boolean;
  onClick?: () => void;
}

const STATUS_VARIANT_MAP: Record<
  string,
  { variant: "lead" | "project" | "general"; label: string }
> = {
  complete: { variant: "lead", label: "Complete" },
  in_progress: { variant: "project", label: "In Progress" },
  planned: { variant: "general", label: "Planned" },
};

export function PortfolioCard({
  project,
  index,
  featured = false,
  onClick,
}: PortfolioCardProps) {
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const statusInfo = STATUS_VARIANT_MAP[project.status] || {
    variant: "general" as const,
    label: project.status,
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-bg-secondary/50 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-bg-secondary">
            {project.beforeImage && project.afterImage && showBeforeAfter ? (
              <BeforeAfterSlider
                beforeImage={project.beforeImage}
                afterImage={project.afterImage}
                className="absolute inset-0"
              />
            ) : (
              <Image
                src={project.image || "/images/placeholder.jpg"}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="flex items-center gap-2 text-text-primary font-medium text-lg">
                View Project <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>

            {/* Category badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-primary border border-accent-primary/30 backdrop-blur-sm">
              {project.category}
            </span>

            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <StatusBadge variant={statusInfo.variant}>
                {statusInfo.label}
              </StatusBadge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5">
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
              {project.title}
            </h3>
            {project.location && (
              <p className="text-text-secondary text-sm">{project.location}</p>
            )}
            <p className="text-text-secondary leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tech?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-bg-primary text-text-secondary border border-slate-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
            {project.beforeImage && project.afterImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBeforeAfter(!showBeforeAfter);
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-accent-primary/10 text-accent-primary text-sm font-semibold hover:bg-accent-primary/20 transition-colors duration-300 border border-accent-primary/20"
              >
                {showBeforeAfter ? "Show Original" : "Before / After"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image container */}
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-bg-secondary">
        <Image
          src={project.image || "/images/placeholder.jpg"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="flex items-center gap-2 text-text-primary font-medium">
            View Project <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        {/* Category badge */}
        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-primary border border-accent-primary/30 backdrop-blur-sm">
          {project.category}
        </span>

        {/* Status indicator */}
        <div className="absolute top-4 right-4">
          <StatusBadge variant={statusInfo.variant}>
            {statusInfo.label}
          </StatusBadge>
        </div>
      </div>

      {/* Text below image */}
      <div className="mt-5 space-y-3">
        <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent-primary transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tech?.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-secondary text-text-secondary border border-slate-700/50"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
