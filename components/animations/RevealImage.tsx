"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function RevealImage({
  src,
  alt,
  className = "",
  delay = 0,
  fill = false,
  width,
  height,
  priority = false,
}: RevealImageProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-bg-secondary"
        style={{ zIndex: 2 }}
        variants={{
          hidden: { x: 0 },
          visible: {
            x: "100%",
            transition: {
              duration: 0.8,
              delay,
              ease: [0.76, 0, 0.24, 1],
            },
          },
        }}
      />

      <motion.div
        className="relative w-full h-full"
        variants={{
          hidden: { scale: 1.1 },
          visible: {
            scale: 1,
            transition: {
              duration: 0.8,
              delay: delay + 0.1,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        }}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className="object-cover w-full h-full"
            priority={priority}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
