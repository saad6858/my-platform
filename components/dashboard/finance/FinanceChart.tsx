/* filepath: components/FinanceChart.tsx */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface FinanceChartProps {
  data: MonthlyData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceChart(: JSX.Element { data }: FinanceChartProps) : JSX.Element {
  const chartData = data.map((item) => ({
    ...item,
    netProfit: item.income - item.expenses,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          stroke="var(--text-secondary)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--text-secondary)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => {
            return [formatCurrency(value), name];
          }}
        />
        <Legend
          wrapperStyle={{
            color: "var(--text-secondary)",
            fontSize: "12px",
            paddingTop: "10px",
          }}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill="var(--accent-primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill="var(--danger)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Line
          type="monotone"
          dataKey="netProfit"
          name="Net Profit"
          stroke="var(--accent-quaternary)"
          strokeWidth={2}
          dot={{ fill: "var(--accent-quaternary)", r: 3 }}
          activeDot={{ r: 5, fill: "var(--accent-quaternary)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
