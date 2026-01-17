"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import OrdersBarChart from "@/components/charts/OrdersBarChart";
import OrderStatusPie from "@/components/charts/OrderStatusPie";
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    let isMounted = true;

    async function loadDashboard() {
      try {
        // Single status check - if this fails, user isn't a seller
        const profileRes = await api.get("/seller/me");

        if (profileRes.data.sellerStatus !== "APPROVED") {
          router.replace("/seller/onboarding");
          return;
        }

        if (!isMounted) return;

        // If we get here, user is an approved seller
        // Now load dashboard data safely
        const [statsRes, chartsRes, stockRes] = await Promise.all([
          api.get("/seller/dashboard/stats").catch(() => ({ data: null })),
          api.get("/seller/dashboard/charts").catch(() => ({ data: null })),
          api.get("/seller/dashboard/low-stock").catch(() => ({ data: [] })),
        ]);
        
        if (!isMounted) return;

        // Set data with fallbacks for new sellers
        setStats(statsRes.data || {
          products: 0,
          totalOrders: 0,
          pendingOrders: 0,
          revenue: 0,
          todayRevenue: 0,
          recentProducts: []
        });
        
        setCharts(chartsRes.data || {
          revenueTrend: [],
          orderStatus: [],
          ordersTrend: []
        });
        
        setLowStockItems(stockRes.data || []);
      } catch (err: any) {
        if (!isMounted) return;
        
        // Only redirect if user is not authenticated or not a seller
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace("/seller/onboarding");
        } else {
          console.error("Dashboard load failed", err);
          setError("Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon-mutedText font-medium">Loading your insights...</p>
        </div>
      </SellerLayout>
    );
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <AlertTriangle className="text-amazon-danger" size={48} />
          <p className="text-amazon-danger font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amazon-darkBlue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amazon-navy transition-colors"
          >
            Retry
          </button>
        </div>
      </SellerLayout>
    );
  }

  const statCards = [
    { label: "Total Products", value: stats?.products ?? 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amazon-orange", bg: "bg-orange-50" },
    { label: "Total Revenue", value: `₹${(stats?.revenue ?? 0).toLocaleString()}`, icon: IndianRupee, color: "text-amazon-success", bg: "bg-green-50" },
    { label: "Today's Sales", value: `₹${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-amazon-success", bg: "bg-green-100" },
  ];

  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto w-full space-y-8 p-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text">Dashboard Overview</h1>
            <p className="text-sm text-amazon-mutedText">Monitor your sales, inventory, and order status.</p>
          </div>
          <button className="bg-amazon-darkBlue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amazon-navy transition-colors">
            Download Report
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-amazon-borderGray shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${item.bg} ${item.color} p-2 rounded-lg`}>
                  <item.icon size={20} />
                </div>
              </div>
              <p className="text-xs font-bold text-amazon-mutedText uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-amazon-text mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ================= LOW STOCK & ALERTS ================= */}
        {lowStockItems.length > 0 && (
          <div className="bg-white border-l-4 border-amazon-danger rounded-r-xl shadow-sm p-4 flex items-start gap-4">
            <div className="text-amazon-danger mt-1">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amazon-danger text-sm uppercase tracking-tight">Inventory Alert</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {lowStockItems.slice(0, 3).map((p) => (
                  <span key={p.id} className="text-sm text-amazon-text">
                    • {p.title} (<span className="font-bold text-amazon-danger">{p.stock} left</span>)
                  </span>
                ))}
                {lowStockItems.length > 3 && <span className="text-sm text-blue-600 underline cursor-pointer">+{lowStockItems.length - 3} more</span>}
              </div>
            </div>
          </div>
        )}

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-amazon-borderGray shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-amazon-text">Performance Trends</h3>
              <select className="text-xs border rounded p-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px]">
              {revenueData?.length ? (
                <RevenueLineChart data={revenueData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400 text-center">No revenue data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-amazon-borderGray shadow-sm flex flex-col">
            <h3 className="font-bold text-amazon-text mb-6">Order Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              {statusData?.length ? (
                <OrderStatusPie data={statusData} />
              ) : (
                <p className="text-sm text-gray-400 text-center">No Orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= RECENT PRODUCTS & TRENDING ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
            <div className="p-5 border-b border-amazon-borderGray flex items-center justify-between">
              <h2 className="font-bold text-amazon-text">Recently Added</h2>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-amazon-borderGray">
              {stats?.recentProducts?.length > 0 ? (
                stats.recentProducts.map((p: any, idx: number) => (
                  <div key={p.id ?? idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/uploads/products/${p.img1 ?? 'placeholder.png'}`}
                      className="w-12 h-12 rounded-lg object-cover border"
                      alt={p.title ?? 'Product'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-amazon-text truncate">{p.title ?? 'Untitled'}</p>
                      <p className="text-sm text-amazon-success font-medium">₹{Number(p.price ?? 0).toLocaleString()}</p>
                    </div>
                    <Link href={`/products/${p.id}/edit`} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-amazon-borderGray transition-all">
                      <span className="text-xs font-bold text-amazon-mutedText uppercase">Edit</span>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center p-6">No products added yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-6">
            <h3 className="font-bold text-amazon-text mb-4">Volume Trends</h3>
            <div className="h-[250px]">
              {ordersData?.length ? (
                <OrdersBarChart data={ordersData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400 text-center">No Orders are Trending yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}