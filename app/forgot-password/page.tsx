/* filepath: components/ForgotPasswordPage.tsx */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-quaternary">
            <span className="text-xl font-bold text-text-primary">M</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">MY-PLATFORM</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-secondary p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-xl font-bold text-text-primary">Reset Password</h2>
                <p className="mt-1 text-sm text-text-secondary">Enter your email and we will send you a reset link</p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@platform.com" required
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-[#475569] outline-none transition-all focus:border-accent-quaternary/50 focus:bg-white/10 focus:ring-1 focus:ring-accent-quaternary/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-quaternary py-2.5 text-sm font-semibold text-text-primary transition-all hover:bg-[var(--accent-quaternary)] hover:shadow-lg hover:shadow-accent-quaternary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><>Send Reset Link</><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
                  <CheckCircle className="h-8 w-8 text-accent-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Check Your Email</h2>
                <p className="mt-2 text-sm text-text-secondary">We have sent a password reset link to<br /><span className="font-medium text-text-primary">{email}</span></p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Did not receive it? Check your spam folder.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-accent-quaternary transition-colors hover:text-[var(--accent-quaternary)]">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
