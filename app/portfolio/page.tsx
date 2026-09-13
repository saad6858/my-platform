/* filepath: components/PortfolioPage.tsx */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { SEOHead } from "@/components/layout/SEOHead";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioFilter } from "@/components/portfolio/PortfolioFilter";
import { Lightbox } from "@/components/portfolio/Lightbox";
import { PortfolioItem } from "@/types";

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

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<PortfolioItem[]>(DEFAULT_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);

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

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

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
    <>
      <SEOHead
        title="My Portfolio | Recent Work & Projects"
        description="Explore my recent projects in real estate, automation, and AI systems. See before/after transformations and detailed case studies."
      />

      <main className="min-h-screen bg-bg-primary pt-24 pb-32">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent">
                  My Portfolio
                </span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed">
                A curated collection of recent work across real estate
                visualization, automation systems, and AI-powered content
                pipelines.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* Filter & Grid */}
        <section>
          <Container>
            <div className="flex justify-center mb-12">
              <PortfolioFilter
                categories={CATEGORIES}
                active={activeFilter}
                onChange={setActiveFilter}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-2xl bg-bg-secondary animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, index) => (
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
                </AnimatePresence>
              </motion.div>
            )}

            {!isLoading && filteredProjects.length === 0 && (
              <div className="text-center py-24">
                <p className="text-text-secondary text-lg">
                  No projects found in this category.
                </p>
              </div>
            )}
          </Container>
        </section>
      </main>

      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={lightboxMedia}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
