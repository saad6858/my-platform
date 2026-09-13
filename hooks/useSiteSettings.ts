"use client";

import { useThemeContext } from "@/components/providers/ThemeProvider";
import type { ThemeContextType } from "@/components/providers/ThemeProvider";

export function useSiteSettings(): ThemeContextType {
  return useThemeContext();
}
