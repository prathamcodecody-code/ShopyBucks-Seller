"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrdersBarChart({ data }: { data: any[] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No orders data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="orders" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
