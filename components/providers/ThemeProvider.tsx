"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { subscribeToDocument, updateDocument } from "@/lib/db";
import { useAuthContext } from "@/components/providers/AuthProvider";
import type { SiteSettings } from "@/types";
import type { Unsubscribe } from "firebase/firestore";

const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  brand: {
    name: "My Platform",
    tagline: "Premium digital solutions",
  },
  sections: {
    hero: true,
    about: true,
    services: true,
    portfolio: true,
    blog: true,
    contact: true,
    testimonials: true,
    faq: true,
    cta: true,
    pricing: true,
    process: true,
    stats: true,
  },
  appearance: {
    accentColor: "#10b981",
    fontFamily: "Inter",
    enableCustomCursor: true,
    enableParticles: true,
    enableAurora: true,
  },
  announcement: {
    enabled: false,
    text: "",
    link: "",
    bgColor: "#10b981",
    textColor: "#030712",
    borderColor: "#334155",
  },
  seo: {
    title: "My Platform",
    description: "Premium digital solutions",
    ogImage: "/og-image.jpg",
    keywords: "portfolio, real estate, automation",
    canonical: "https://my-platform.vercel.app",
  },
  pricing: {
    baseRate: 5000,
    perPicRate: 500,
    currency: "PKR",
  },
  contact: {
    whatsapp: "",
    email: "hello@myplatform.com",
    location: "Lahore, Pakistan",
    linkedin: "",
    github: "",
  },
  updatedAt: new Date(),
};

interface ThemeContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    try {
      unsubscribe = subscribeToDocument<SiteSettings>("site_settings", "default", (data) => {
        if (data) {
          setSettings(data);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (settings.appearance.accentColor) {
      document.documentElement.style.setProperty("--accent-primary", settings.appearance.accentColor);
    }
  }, [settings.appearance.accentColor]);

  const updateSettings = useCallback(
    async (newSettings: Partial<SiteSettings>): Promise<void> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admins can update site settings");
      }
      await updateDocument<SiteSettings>("site_settings", "default", {
        ...newSettings,
        updatedAt: new Date(),
      });
    },
    [isAdmin]
  );

  return (
    <ThemeContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
