"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { type User as FirebaseUser } from "firebase/auth";
import {
  onIdTokenChange,
  signInWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  resetPassword,
  isAdmin,
} from "@/lib/auth";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminStatus, setAdminStatus] = useState<boolean>(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChange((firebaseUser) => {
      setUser(firebaseUser);
      setAdminStatus(isAdmin(firebaseUser));

      if (firebaseUser) {
        firebaseUser.getIdToken(true).then((token) => {
          const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
          const secureFlag = isLocalhost ? "" : "; Secure";
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Strict${secureFlag}`;
        });
      } else {
        document.cookie = `firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }

      setLoading(false);
    });

    // Proactive token refresh every 55 minutes
    refreshTimerRef.current = setInterval(() => {
      const currentUser = user;
      if (currentUser) {
        currentUser.getIdToken(true).then((token) => {
          const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
          const secureFlag = isLocalhost ? "" : "; Secure";
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Strict${secureFlag}`;
        });
      }
    }, 55 * 60 * 1000);

    return () => {
      unsubscribe();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [user]);

  const handleSignIn = useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
    const user = await signInWithEmail(email, password);
    return user;
  }, []);

  const handleSignInWithGoogle = useCallback(async (): Promise<FirebaseUser> => {
    const user = await signInWithGoogle();
    return user;
  }, []);

  const handleSignOut = useCallback(async (): Promise<void> => {
    await authSignOut();
  }, []);

  const handleResetPassword = useCallback(async (email: string): Promise<void> => {
    await resetPassword(email);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: adminStatus,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
