/* filepath: components/Lightbox.tsx */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  type: "image" | "video";
  url: string;
  caption?: string;
}

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

export function Lightbox({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      goTo(currentIndex + 1, 1);
    } else {
      goTo(0, 1);
    }
  }, [currentIndex, media.length, goTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1, -1);
    } else {
      goTo(media.length - 1, -1);
    }
  }, [currentIndex, media.length, goTo]);

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goNext, goPrev]);

  const currentMedia = media[currentIndex];
  if (!currentMedia) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation - Prev */}
          {media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Navigation - Next */}
          {media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Media Content */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[80vh] mx-4 md:mx-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-lg"
                  />
                ) : (
                  <Image
                    src={currentMedia.url}
                    alt={currentMedia.caption || "Portfolio image"}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {media.length}
          </div>

          {/* Caption */}
          {currentMedia.caption && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center text-white/80 text-sm max-w-lg px-4">
              {currentMedia.caption}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
