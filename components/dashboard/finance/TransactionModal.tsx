/* filepath: components/TransactionModal.tsx */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/index";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSave: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
}

const categories = [
  "Project Payment",
  "Software",
  "Equipment",
  "Marketing",
  "Hosting",
  "Education",
  "Other",
];

const statuses = ["completed", "pending"];

export function TransactionModal(: JSX.Element {
  isOpen,
  onClose,
  transaction,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Project Payment");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("completed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount?.toString() || "");
      setCategory(transaction.category || "Project Payment");
      setDescription(transaction.description || "");
      setClient(transaction.client || "");
      setProject(transaction.project || "");
      setStatus(transaction.status || "completed");
      if (transaction.date) {
        const d = transaction.date instanceof Date
          ? transaction.date
          : new Date(transaction.date);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        setDate(local.toISOString().slice(0, 10));
      } else {
        setDate("");
      }
    } else {
      setType("income");
      setAmount("");
      setCategory("Project Payment");
      setDescription("");
      setClient("");
      setProject("");
      setStatus("completed");
      const today = new Date();
      const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      setDate(local.toISOString().slice(0, 10));
    }
    setErrors({});
  }, [transaction, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    if (!category) newErrors.category = "Category is required";
    if (!date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      type,
      amount: Number(amount),
      category,
      description: description.trim() || undefined,
      client: client.trim() || undefined,
      project: project.trim() || undefined,
      date: new Date(date),
      status: status as "completed" | "pending",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-text-primary">
                {transaction ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Transaction Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                      type === "income"
                        ? "bg-accent-primary/10 border-accent-primary/30 text-accent-secondary"
                        : "bg-bg-primary border-white/10 text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                      type === "expense"
                        ? "bg-danger/10 border-danger/30 text-danger"
                        : "bg-bg-primary border-white/10 text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    Expense
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Amount (PKR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors ${
                    errors.amount ? "border-danger" : "border-white/10"
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-danger">{errors.amount}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors ${
                    errors.category ? "border-danger" : "border-white/10"
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-danger">{errors.category}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors"
                />
              </div>

              {/* Client & Project */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Client
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Client name"
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Project
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="Project name"
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-quaternary transition-colors"
                  />
                </div>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-bg-primary border rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors ${
                      errors.date ? "border-danger" : "border-white/10"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-danger">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-quaternary transition-colors"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-accent-quaternary hover:bg-accent-quaternary/90 rounded-lg text-text-primary font-medium transition-colors"
                >
                  {transaction ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
