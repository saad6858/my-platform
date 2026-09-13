"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function CustomCursor() {
  const { settings } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300 };
  const lagConfig = { damping: 20, stiffness: 100 };

  const dotX = useSpring(cursorX, springConfig);
  const dotY = useSpring(cursorY, springConfig);
  const ringX = useSpring(cursorX, lagConfig);
  const ringY = useSpring(cursorY, lagConfig);

  useEffect(() => {
    if (!settings.appearance.enableCustomCursor) return;

    const checkDevice = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isDesktop = window.innerWidth > 1024;
      setIsVisible(isDesktop && !isTouchDevice);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.style.cursor === "pointer"
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.style.cursor === "pointer"
      ) {
        setIsHovering(false);
      }
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseover", handleMouseOver);
      document.addEventListener("mouseout", handleMouseOut);
    }

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY, isVisible, settings.appearance.enableCustomCursor]);

  if (!settings.appearance.enableCustomCursor) return null;
  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          zIndex: 9999,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full bg-emerald-400"
          animate={{
            width: isHovering ? 0 : 8,
            height: isHovering ? 0 : 8,
            scale: isClicking ? 0.5 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          zIndex: 9999,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full border border-emerald-400"
          style={{
            mixBlendMode: isHovering ? "difference" : "normal",
          }}
          animate={{
            width: isHovering ? 60 : 40,
            height: isHovering ? 60 : 40,
            scale: isClicking ? 0.9 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
