/* filepath: components/ColorPicker.tsx */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}

export function ColorPicker(: JSX.Element { colors, selected, onChange }: ColorPickerProps) : JSX.Element {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selected.toLowerCase() === color.toLowerCase();
        return (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(color)}
            className={cn(
              "relative w-10 h-10 rounded-full transition-shadow duration-200",
              isSelected ? "shadow-[0_0_0_2px_white,0_0_0_4px_var(--accent-quaternary)]" : "hover:shadow-lg"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 text-text-primary drop-shadow-md"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
