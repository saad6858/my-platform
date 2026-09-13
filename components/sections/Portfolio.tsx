/* filepath: components/Portfolio.tsx */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { Container } from "@/components/layout/Container";
import { PortfolioCard } from "./PortfolioCard";
import { PortfolioFilter } from "./PortfolioFilter";
import { Lightbox } from "./Lightbox";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { PortfolioItem } from "./types";

const CATEGORIES = ["All", "Real Estate", "Automation", "Coming Soon"];

const DEFAULT_PROJECTS: PortfolioItem[] = [
  {
    id: "ghani-estate",
    title: "Ghani Estate — Luxury Modern Home",
    location: "Lahore, Pakistan",
    category: "Real Estate",
    description:
      "11 photos transformed into a 60-second cinematic walkthrough using ZSky AI and CapCut.",
    tech: ["ZSky AI", "CapCut"],
    status: "complete",
    featured: true,
    image: "/images/portfolio/ghani-estate.jpg",
    beforeImage: "/images/portfolio/ghani-estate-before.jpg",
    afterImage: "/images/portfolio/ghani-estate-after.jpg",
    media: [
      { type: "image", url: "/images/portfolio/ghani-estate.jpg" },
      { type: "image", url: "/images/portfolio/ghani-estate-2.jpg" },
      { type: "image", url: "/images/portfolio/ghani-estate-3.jpg" },
    ],
  },
  {
    id: "ai-lead-outreach",
    title: "AI Lead Outreach System",
    category: "Automation",
    description: "Automated WhatsApp outreach pipeline for real estate agents.",
    tech: ["n8n", "Firebase", "WhatsApp API"],
    status: "in_progress",
    image: "/images/portfolio/ai-lead.jpg",
    media: [{ type: "image", url: "/images/portfolio/ai-lead.jpg" }],
  },
  {
    id: "content-automation",
    title: "Content Automation Pipeline",
    category: "Coming Soon",
    description:
      "Auto-generates LinkedIn posts and blog content using multi-agent systems.",
    tech: ["CrewAI", "LangChain"],
    status: "planned",
    image: "/images/portfolio/content-auto.jpg",
    media: [{ type: "image", url: "/images/portfolio/content-auto.jpg" }],
  },
];

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<PortfolioItem[]>(DEFAULT_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);

  const { settings } = useSiteSettings();

  useEffect(() => {
    let mounted = true;
    async function fetchProjects() {
      try {
        if (typeof window !== "undefined") {
          const { getCollection } = await import("@/lib/db");
          const data = await getCollection<PortfolioItem>("portfolio");
          if (mounted && data && data.length > 0) {
            setProjects(data);
          }
        }
      } catch {
        // Fallback to defaults on error
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  if (settings?.sections?.portfolio === false) return null;

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const featuredProject = filteredProjects.find((p) => p.featured);
  const regularProjects = filteredProjects.filter((p) => !p.featured);

  const openLightbox = useCallback((project: PortfolioItem) => {
    const media = project.media ? [...project.media] : [];
    if (media.length === 0 && project.image) {
      media.push({ type: "image", url: project.image });
    }
    if (media.length > 0) {
      setLightboxMedia(media);
      setLightboxIndex(0);
      setLightboxOpen(true);
    }
  }, []);

  return (
    <SectionWrapper id="portfolio" className="py-24 md:py-32">
      <Container>
        <div className="mb-12 md:mb-16">
          <SectionLabel text="PORTFOLIO" />
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            Recent Work
          </h2>
        </div>

        <PortfolioFilter
          categories={CATEGORIES}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl bg-bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div layout className="mt-12">
            <AnimatePresence mode="popLayout">
              {featuredProject && (
                <motion.div
                  key={`featured-${featuredProject.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <PortfolioCard
                    project={featuredProject}
                    index={0}
                    featured
                    onClick={() => openLightbox(featuredProject)}
                  />
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regularProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="cursor-pointer"
                    onClick={() => openLightbox(project)}
                  >
                    <PortfolioCard project={project} index={index} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 transition-colors duration-300 font-medium"
          >
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </Container>

      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={lightboxMedia}
        initialIndex={lightboxIndex}
      />
    </SectionWrapper>
  );
}
