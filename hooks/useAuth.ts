"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";
import type { AuthContextType } from "@/components/providers/AuthProvider";

export function useAuth(): AuthContextType {
  return useAuthContext();
}
