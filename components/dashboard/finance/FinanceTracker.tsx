/* filepath: components/FinanceTracker.tsx */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { TransactionTable } from "./TransactionTable";
import { TransactionModal } from "./TransactionModal";
import { FinanceChart } from "./FinanceChart";
import { Transaction } from "@/types/index";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  AlertCircle,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function FinanceTracker() : JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTransactions();
  }, [user, authLoading, router]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Transaction[];
      // Sort by date descending
      data.sort((a, b) => {
        const da = toDate(a.date);
        const db = toDate(b.date);
        if (!da || !db) return 0;
        return db.getTime() - da.getTime();
      });
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      const tDate = toDate(t.date);
      if (!tDate) return false;
      if (filterDateStart) {
        const start = new Date(filterDateStart);
        if (tDate < start) return false;
      }
      if (filterDateEnd) {
        const end = new Date(filterDateEnd);
        end.setHours(23, 59, 59, 999);
        if (tDate > end) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, filterDateStart, filterDateEnd]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0),
    [transactions]
  );

  const netProfit = totalIncome - totalExpenses;

  const outstandingPayments = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income" && t.status === "pending")
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    [transactions]
  );

  const monthlyChartData: MonthlyData[] = useMemo(() => {
    const months = 12;
    const data: MonthlyData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = formatMonthLabel(date);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthTransactions = transactions.filter((t) => {
        const tDate = toDate(t.date);
        if (!tDate) return false;
        return tDate >= monthStart && tDate <= monthEnd;
      });

      data.push({
        month: monthStr,
        income: monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        expenses: monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + (t.amount || 0), 0),
      });
    }
    return data;
  }, [transactions]);

  const runningBalance = useMemo(() => {
    let balance = 0;
    return [...filteredTransactions].reverse().map((t) => {
      balance += t.type === "income" ? (t.amount || 0) : -(t.amount || 0);
      return { ...t, balance };
    });
  }, [filteredTransactions]);

  const handleAddTransaction = async (
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await addDoc(collection(db, "transactions"), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleEditTransaction = async (
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!editingTransaction) return;
    try {
      const ref = doc(db, "transactions", editingTransaction.id);
      await updateDoc(ref, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
      await fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Description", "Client/Project", "Amount", "Status"];
    const rows = filteredTransactions.map((t) => {
      const date = toDate(t.date);
      return [
        date ? date.toLocaleDateString("en-US") : "",
        t.type,
        t.category,
        t.description || "",
        t.client || t.project || "",
        t.amount.toString(),
        t.status || "completed",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return ["all", ...Array.from(cats)];
  }, [transactions]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-quaternary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Finance</h1>
            <p className="text-text-secondary mt-1">
              Track income, expenses, and financial performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-quaternary hover:bg-accent-quaternary/90 rounded-lg text-text-primary font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0.1}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Income</p>
                <p className="text-2xl font-bold text-accent-secondary mt-1">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-accent-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent-secondary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.15}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Expenses</p>
                <p className="text-2xl font-bold text-danger mt-1">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-danger/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Net Profit</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    netProfit >= 0 ? "text-accent-quaternary" : "text-danger"
                  }`}
                >
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className="p-3 bg-accent-quaternary/10 rounded-lg">
                <Wallet className="w-6 h-6 text-accent-quaternary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Outstanding</p>
                <p className="text-2xl font-bold text-accent-tertiary mt-1">
                  {formatCurrency(outstandingPayments)}
                </p>
              </div>
              <div className="p-3 bg-accent-tertiary/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-accent-tertiary" />
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Monthly Chart */}
      <FadeIn delay={0.3}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Monthly Breakdown
          </h3>
          <div className="h-[300px]">
            <FinanceChart data={monthlyChartData} />
          </div>
        </GlassCard>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.35}>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as "all" | "income" | "expense");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterDateStart}
            onChange={(e) => {
              setFilterDateStart(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
            placeholder="From"
          />

          <input
            type="date"
            value={filterDateEnd}
            onChange={(e) => {
              setFilterDateEnd(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary"
            placeholder="To"
          />

          {(filterType !== "all" ||
            filterCategory !== "all" ||
            filterDateStart ||
            filterDateEnd) && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterCategory("all");
                setFilterDateStart("");
                setFilterDateEnd("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </FadeIn>

      {/* Transaction Table */}
      <FadeIn delay={0.4}>
        <TransactionTable
          transactions={paginatedTransactions}
          runningBalance={runningBalance}
          onEdit={handleEditClick}
          onDelete={handleDeleteTransaction}
        />
      </FadeIn>

      {/* Pagination */}
      {totalPages > 1 && (
        <FadeIn delay={0.45}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} transactions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    page === currentPage
                      ? "bg-accent-quaternary text-text-primary"
                      : "border border-white/10 text-text-secondary hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        transaction={editingTransaction}
        onSave={editingTransaction ? handleEditTransaction : handleAddTransaction}
      />
    </div>
  );
}
