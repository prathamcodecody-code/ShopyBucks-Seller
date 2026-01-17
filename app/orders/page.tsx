"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  ExternalLink 
} from "lucide-react";

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/orders", { params: { page } });
      setOrders(res.data.orders || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  // Helper for Status Styling
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "bg-orange-100 text-orange-700 border-orange-200";
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text">Order Management</h1>
            <p className="text-sm text-amazon-mutedText">Track and process your incoming store orders.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amazon-borderGray rounded-lg text-sm font-medium hover:bg-gray-50">
              <Filter size={16} /> Filter
            </button>
            <button className="px-4 py-2 bg-amazon-darkBlue text-white rounded-lg text-sm font-medium hover:bg-amazon-navy transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-amazon-borderGray rounded-xl focus:ring-1 focus:ring-amazon-orange outline-none shadow-sm"
          />
        </div>

        {/* --- ORDERS TABLE --- */}
        <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-amazon-borderGray text-xs font-bold text-amazon-mutedText uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amazon-borderGray">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-amazon-mutedText">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-amazon-orange border-t-transparent rounded-full animate-spin" />
                      </div>
                      Loading your orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-amazon-mutedText italic">
                      No orders found yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-amazon-text text-sm">#{o.orderId}</p>
                            <p className="text-[11px] text-amazon-mutedText uppercase">
                              {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-amazon-text">{o.customerName || "Walk-in Customer"}</p>
                        <p className="text-xs text-amazon-mutedText">{o.customerPhone || "No Phone"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-amazon-text">
                        {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 font-bold text-amazon-text text-sm">
                        ₹{o.totalAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(o.status || "PENDING")}`}>
                          {o.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/orders/${o.orderId}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Details <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-amazon-borderGray shadow-sm">
          <p className="text-sm text-amazon-mutedText">
            Page <span className="font-bold text-amazon-text">{page}</span> of <span className="font-bold text-amazon-text">{pages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}