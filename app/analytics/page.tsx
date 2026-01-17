"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar,
  Download,
  Info
} from "lucide-react";

// reuse existing chart components
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import OrdersBarChart from "@/components/charts/OrdersBarChart";
import OrderStatusPie from "@/components/charts/OrderStatusPie";

export default function AnalyticsPage() {
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const revenueData =
  charts?.revenueTrend?.map((r: any) => ({
    date: r.date || r.day || r.createdAt?.slice(0, 10),
    revenue: Number(r.revenue ?? r.total ?? r.amount ?? 0),
  })) ?? [];

const ordersData =
  charts?.ordersTrend?.map((o: any) => ({
    date: o.date || o.day || o.createdAt?.slice(0, 10),
    orders: Number(o.orders ?? o.count ?? 0),
  })) ?? [];

const statusData = charts?.orderStatus ?? [];

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get("/seller/dashboard/charts");
        setCharts(res.data);
      } catch (err) {
        console.error("Failed to load seller analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-amazon-mutedText font-medium">Generating your sales reports...</p>
        </div>
      </SellerLayout>
    );
  }

  if (!charts) {
    return (
      <SellerLayout>
        <div className="text-center py-24">
          <p className="text-amazon-danger font-bold text-lg">Failed to load analytics data.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:underline">Try Again</button>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        
        {/* --- HEADER & CONTROLS --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight">Sales Analytics</h1>
            <p className="text-amazon-mutedText text-sm">Deep dive into your store's performance and order trends.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-amazon-borderGray px-3 py-2 rounded-lg shadow-sm">
              <Calendar size={16} className="text-amazon-mutedText" />
              <select className="text-sm font-medium bg-transparent outline-none cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            <button className="flex items-center gap-2 bg-amazon-darkBlue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amazon-navy transition-all shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* --- MAIN ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* REVENUE TREND (Large) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-amazon-borderGray shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-amazon-success rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amazon-text">Revenue Growth</h3>
                  <p className="text-[11px] text-amazon-mutedText uppercase tracking-wider">Gross Sales Trend</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-amazon-mutedText uppercase">Growth</p>
                <p className="text-sm font-bold text-amazon-success">+12.5%</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
               <RevenueLineChart data={revenueData} />
            </div>
          </div>

          {/* ORDER STATUS (Side) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-amazon-borderGray shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PieChart size={20} />
              </div>
              <h3 className="font-bold text-amazon-text">Order Status</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
               <OrderStatusPie data={statusData} />
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amazon-mutedText leading-relaxed">
                Reflects real-time distribution of your orders. High 'Pending' rates may affect your seller rating.
              </p>
            </div>
          </div>

          {/* ORDERS VOLUME (Full Width or Bottom) */}
          <div className="lg:col-span-12 bg-white rounded-2xl p-6 border border-amazon-borderGray shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-amazon-text">Volume Analysis</h3>
                <p className="text-[11px] text-amazon-mutedText">Daily Order Count</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <OrdersBarChart data={ordersData} />
            </div>
          </div>

        </div>

        {/* --- FOOTER INSIGHT --- */}
        <div className="p-6 bg-amazon-darkBlue rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amazon-orange/20 flex items-center justify-center rounded-full text-amazon-orange">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="font-bold text-lg text-white">Your store is performing 15% better than last week.</p>
              <p className="text-sm text-gray-400">Keep up the good work! Adding new products can increase visibility.</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-amazon-orange text-amazon-darkBlue font-bold rounded-lg hover:bg-amazon-orangeHover transition-colors whitespace-nowrap">
            View Top Products
          </button>
        </div>

      </div>
    </SellerLayout>
  );
}