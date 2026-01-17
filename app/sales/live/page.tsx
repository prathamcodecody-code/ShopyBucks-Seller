"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import { 
  Flame, 
  Activity, 
  ShoppingBag, 
  TrendingUp, 
  Info,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function LiveSalesPage() {
  // Demo state: set to true to see how a live sale would look
  const hasLiveSale = false; 

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight flex items-center gap-3">
              <Flame className={hasLiveSale ? "text-amazon-orange animate-pulse" : "text-gray-400"} /> 
              Live Performance
            </h1>
            <p className="text-sm text-amazon-mutedText mt-1">
              Real-time tracking of your store performance during platform-wide events.
            </p>
          </div>
          {hasLiveSale && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amazon-orange/10 border border-amazon-orange/20 rounded-full">
              <span className="w-2 h-2 bg-amazon-orange rounded-full animate-ping" />
              <span className="text-[10px] font-bold text-amazon-orange uppercase">Live Now</span>
            </div>
          )}
        </div>

        {!hasLiveSale ? (
          /* ================= EMPTY STATE ================= */
          <div className="space-y-6">
            <div className="bg-white border border-amazon-borderGray rounded-2xl p-12 text-center flex flex-col items-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Activity size={40} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-amazon-text mb-2">No Active Sales</h2>
              <p className="text-sm text-amazon-mutedText max-w-sm mx-auto leading-relaxed">
                There are no platform-wide sales currently running. Live metrics will appear here once an event starts.
              </p>
              <Link 
                href="/sales/upcoming"
                className="mt-8 px-6 py-2.5 bg-amazon-darkBlue text-white font-bold rounded-lg hover:bg-amazon-navy transition-all shadow-md flex items-center gap-2"
              >
                <Calendar size={18} /> View Upcoming Schedule
              </Link>
            </div>

            {/* Preparation Cards while waiting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                <div className="bg-white p-2 rounded-lg h-fit shadow-sm text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Boost Rankings</h4>
                  <p className="text-xs text-blue-700 mt-1">Participating in sales boosts your search visibility by up to 3x even after the sale ends.</p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex gap-4">
                <div className="bg-white p-2 rounded-lg h-fit shadow-sm text-amazon-orange">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm">Inventory Prep</h4>
                  <p className="text-xs text-orange-800 mt-1">Check your low-stock alerts to ensure your best-sellers don't run out during peak hours.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= LIVE STATE (Placeholder) ================= */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-white border-2 border-amazon-orange p-6 rounded-2xl shadow-lg col-span-full">
              <p className="text-amazon-orange font-bold text-sm mb-1 uppercase tracking-widest">Ongoing Event</p>
              <h2 className="text-2xl font-bold text-amazon-text">Flash Sale Friday</h2>
            </div>
            {/* Live metrics would go here */}
          </div>
        )}

        {/* ================= FOOTER INFO ================= */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 border border-amazon-borderGray rounded-xl">
          <Info size={18} className="text-amazon-mutedText shrink-0 mt-0.5" />
          <p className="text-[11px] text-amazon-mutedText leading-relaxed">
            Live sales data is updated every 60 seconds. Sales metrics include only products 
            specifically nominated for the current event. For overall store performance, 
            visit the <Link href="/analytics" className="text-blue-600 font-bold hover:underline">Analytics</Link> page.
          </p>
        </div>

      </div>
    </SellerLayout>
  );
}