/* filepath: components/seed-page.tsx */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { seedDatabase, type SeedResult } from "@/lib/seed";
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Shield,
  FileText,
  Users,
  FolderKanban,
  CreditCard,
  CalendarDays,
  Briefcase,
  Settings,
} from "lucide-react";

const seedItems = [
  {
    collection: "site_settings",
    label: "Site Settings",
    count: 1,
    icon: Settings,
    description: "Default site configuration and metadata",
  },
  {
    collection: "leads",
    label: "Leads",
    count: 4,
    icon: Users,
    description: "Sample CRM leads with various statuses",
  },
  {
    collection: "projects",
    label: "Projects",
    count: 3,
    icon: FolderKanban,
    description: "Kanban board projects with tasks",
  },
  {
    collection: "posts",
    label: "Blog Posts",
    count: 3,
    icon: FileText,
    description: "Published blog articles with categories",
  },
  {
    collection: "transactions",
    label: "Transactions",
    count: 5,
    icon: CreditCard,
    description: "Income and expense records",
  },
  {
    collection: "content_calendar",
    label: "Content Items",
    count: 3,
    icon: CalendarDays,
    description: "Scheduled content for various platforms",
  },
  {
    collection: "portfolio",
    label: "Portfolio Items",
    count: 3,
    icon: Briefcase,
    description: "Showcase projects with links",
  },
];

export default function SeedPage(): JSX.Element {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // In a real app, check admin claims here
        // For now, assume any authenticated user can seed
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setShowConfirm(false);

    try {
      const seedResults = await seedDatabase();
      setResults(seedResults);
    } catch (err) {
      console.error("Seed error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSeeding(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-accent-tertiary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Access Denied
          </h1>
          <p className="text-text-secondary">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  const totalItems = seedItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
              <Database className="w-8 h-8 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Seed Database
              </h1>
              <p className="text-text-secondary mt-1">
                Populate your database with default sample data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 rounded-2xl bg-accent-primary/10 border border-accent-primary/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-8 h-8 text-accent-primary" />
                <h2 className="text-xl font-semibold text-accent-primary">
                  Database Seeded Successfully
                </h2>
              </div>
              <p className="text-text-secondary mb-4">
                The following collections have been populated:
              </p>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.collection}
                    className="flex items-center justify-between py-2 px-4 rounded-lg bg-bg-secondary/50"
                  >
                    <span className="text-text-primary capitalize">
                      {result.collection.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-3">
                      {result.skipped ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent-tertiary/10 text-accent-tertiary">
                          Skipped (already exists)
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent-primary/10 text-accent-primary">
                          {result.created} created
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Preview */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary" />
              What will be created
            </h2>
            <div className="grid gap-3">
              {seedItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.collection}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="p-2.5 rounded-lg bg-accent-primary/10">
                      <Icon className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">
                          {item.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-quaternary/10 text-accent-quaternary">
                          {item.count} items
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-accent-tertiary/5 border border-accent-tertiary/10 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-tertiary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-accent-tertiary font-medium">
                  Important Note
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Collections that already contain data will be skipped to
                  prevent duplicates. This action is safe to run multiple times.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSeeding}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent-primary text-bg-primary font-semibold text-lg hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Seed Database with Default Data
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md p-6 rounded-2xl bg-bg-secondary border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent-tertiary/10">
                    <AlertTriangle className="w-6 h-6 text-accent-tertiary" />
                  </div>
                  <h3 className="text-xl font-semibold">Confirm Seed</h3>
                </div>

                <p className="text-text-secondary mb-2">
                  You are about to create{" "}
                  <span className="text-text-primary font-medium">
                    {totalItems} sample records
                  </span>{" "}
                  across {seedItems.length} collections.
                </p>
                <p className="text-sm text-text-secondary mb-6">
                  Existing data will not be overwritten. This action is safe and
                  idempotent.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-text-primary font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSeed}
                    className="flex-1 px-4 py-3 rounded-xl bg-accent-primary text-bg-primary font-semibold hover:bg-accent-secondary transition-colors"
                  >
                    Confirm Seed
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seeding Progress Overlay */}
        <AnimatePresence>
          {isSeeding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-accent-primary/20" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-accent-primary border-t-transparent animate-spin" />
                  <Database className="absolute inset-0 m-auto w-8 h-8 text-accent-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Seeding Database
                </h3>
                <p className="text-text-secondary">
                  Creating {totalItems} sample records...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
