"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#facc15", "#3b82f6", "#10b981", "#ef4444"];

export default function OrderStatusPie({ data }: { data: any[] }) {
  if (!data?.length) {
    return (
      <div className="text-sm text-gray-400">
        No order status data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          outerRadius={80}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
