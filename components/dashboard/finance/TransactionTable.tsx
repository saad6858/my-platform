/* filepath: components/TransactionTable.tsx */
"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/index";

interface TransactionWithBalance extends Transaction {
  balance?: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  runningBalance: TransactionWithBalance[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  "Project Payment": "bg-accent-primary/10 text-accent-secondary",
  Software: "bg-accent-quaternary/10 text-accent-quaternary",
  Equipment: "bg-accent-quaternary/10 text-accent-quaternary",
  Marketing: "bg-accent-quaternary/10 text-accent-quaternary",
  Hosting: "bg-accent-secondary/10 text-accent-secondary",
  Education: "bg-accent-tertiary/10 text-accent-tertiary",
  Other: "bg-bg-primary0/10 text-text-muted",
};

function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.Other;
}

export function TransactionTable(: JSX.Element {
  transactions,
  runningBalance,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const balanceMap = new Map<string, number>();
  runningBalance.forEach((t) => {
    balanceMap.set(t.id, t.balance || 0);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Category
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Description
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Client/Project
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Amount
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Balance
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-text-secondary">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white/5 rounded-full">
                    <ArrowUpRight className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p>No transactions found</p>
                  <p className="text-sm text-text-secondary/50">
                    Add your first transaction to get started
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => {
              const date = toDate(transaction.date);
              const isIncome = transaction.type === "income";
              const balance = balanceMap.get(transaction.id);

              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-text-primary whitespace-nowrap">
                    {date ? formatDate(date) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isIncome
                          ? "bg-accent-primary/10 text-accent-secondary"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3" />
                      )}
                      {isIncome ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        transaction.category || "Other"
                      )}`}
                    >
                      {transaction.category || "Other"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary max-w-[200px] truncate">
                    {transaction.description || "—"}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {transaction.client || transaction.project || "—"}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium whitespace-nowrap ${
                      isIncome ? "text-accent-secondary" : "text-danger"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-text-secondary whitespace-nowrap">
                    {balance !== undefined ? formatCurrency(balance) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-accent-quaternary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-danger transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
