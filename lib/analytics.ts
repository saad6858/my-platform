/* filepath: components/analytics-lib.ts */
"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "analytics_session_id";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function generateSessionId(): string {
  if (typeof window === "undefined") return "server";

  const existing = sessionStorage.getItem(SESSION_KEY);
  const timestamp = sessionStorage.getItem(`${SESSION_KEY}_time`);

  if (existing && timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed < SESSION_DURATION_MS) {
      sessionStorage.setItem(`${SESSION_KEY}_time`, String(Date.now()));
      return existing;
    }
  }

  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem(SESSION_KEY, newId);
  sessionStorage.setItem(`${SESSION_KEY}_time`, String(Date.now()));
  return newId;
}

export function getDeviceInfo(): {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  platform: string;
} {
  if (typeof window === "undefined") {
    return {
      userAgent: "server",
      screenWidth: 0,
      screenHeight: 0,
      language: "en",
      platform: "server",
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    platform: navigator.platform,
  };
}

export async function trackPageView(page: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const sessionId = generateSessionId();
    const deviceInfo = getDeviceInfo();

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        sessionId,
        userAgent: deviceInfo.userAgent,
        referrer: document.referrer || "direct",
      }),
    });
  } catch (error) {
    console.error("trackPageView error:", error);
  }
}

export function usePageTracking(): void {
  const pathname = usePathname();
  const trackedRef = useRef<string | null>(null);

  const track = useCallback(() => {
    if (!pathname) return;
    if (trackedRef.current === pathname) return;

    trackedRef.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    track();
  }, [track]);
}
