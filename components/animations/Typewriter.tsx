"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = "",
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    indexRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);
    setShowCursor(true);

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        const char = text[indexRef.current];
        setDisplayedText((prev) => prev + char);
        indexRef.current += 1;

        const variation = Math.random() * 20 - 10;
        const nextSpeed = Math.max(20, speed + variation);

        timeoutRef.current = setTimeout(typeNextChar, nextSpeed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();

        cursorTimeoutRef.current = setTimeout(() => {
          setShowCursor(false);
        }, 1000);
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, speed);
  }, [text, speed, onComplete]);

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      startTyping();
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
    };
  }, [delay, startTyping]);

  useEffect(() => {
    if (showCursor) {
      const blinkInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(blinkInterval);
    }
  }, [showCursor]);

  return (
    <span className={className}>
      {displayedText}
      <AnimatePresence>
        {showCursor && (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block text-emerald-400"
            style={{ marginLeft: "1px" }}
          >
            |
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
