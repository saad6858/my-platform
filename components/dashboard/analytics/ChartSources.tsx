/* filepath: components/ChartSources.tsx */
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SourceData {
  source: string;
  count: number;
}

interface ChartSourcesProps {
  data: SourceData[];
}

const sourceColors: Record<string, string> = {
  zameen: "var(--accent-primary)",
  facebook: "#3b82f6",
  instagram: "#ec4899",
  referral: "var(--accent-tertiary)",
  website: "var(--accent-quaternary)",
  linkedin: "#2563eb",
  other: "var(--text-muted)",
};

function getSourceColor(source: string): string {
  return sourceColors[source] || sourceColors.other;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  count: number;
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  count,
}: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="var(--text-primary)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      <tspan x={x} dy="-0.4em">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em" fontSize={10} fill="var(--text-secondary)">
        {count}
      </tspan>
    </text>
  );
}

export function ChartSources(: JSX.Element { data }: ChartSourcesProps) : JSX.Element {
  const chartData = data.map((item) => ({
    ...item,
    fill: getSourceColor(item.source),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="count"
          nameKey="source"
          labelLine={false}
          label={(props: unknown) =>
            renderCustomLabel(props as CustomLabelProps)
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [value, name]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{
            color: "var(--text-secondary)",
            fontSize: "12px",
            paddingTop: "10px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
