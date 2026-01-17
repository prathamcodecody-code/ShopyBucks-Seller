"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import Link from "next/link";
import { 
  Flame, 
  CalendarDays, 
  Rocket, 
  TrendingUp, 
  ChevronRight, 
  Megaphone,
  ArrowRight
} from "lucide-react";

export default function SellerSalesPage() {
  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto space-y-10 p-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight flex items-center gap-3">
              <Megaphone className="text-amazon-orange" /> Platform Sales
            </h1>
            <p className="text-sm text-amazon-mutedText max-w-2xl leading-relaxed">
              Participate in ShopyBucks platform-wide events to boost your store's visibility. 
              Sellers who participate in at least one event per month see an average 
              <span className="text-amazon-success font-bold"> 40% increase </span> in revenue.
            </p>
          </div>
          <Link 
            href="/sales/how-it-works" 
            className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
          >
            How it works?
          </Link>
        </div>

        {/* ================= MINI STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-amazon-borderGray p-4 rounded-xl flex items-center gap-4">
            <div className="bg-orange-50 p-2.5 rounded-lg text-amazon-orange">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amazon-mutedText uppercase">Potential Reach</p>
              <p className="text-lg font-bold text-amazon-text">2.5M+ Users</p>
            </div>
          </div>
          <div className="bg-white border border-amazon-borderGray p-4 rounded-xl flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
              <Rocket size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amazon-mutedText uppercase">Avg. Conversion</p>
              <p className="text-lg font-bold text-amazon-text">+22% Growth</p>
            </div>
          </div>
          <div className="bg-white border border-amazon-borderGray p-4 rounded-xl flex items-center gap-4">
            <div className="bg-green-50 p-2.5 rounded-lg text-amazon-success">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amazon-mutedText uppercase">Upcoming Events</p>
              <p className="text-lg font-bold text-amazon-text">4 Active</p>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Link
            href="/sales/upcoming"
            className="group relative bg-white border border-amazon-borderGray rounded-2xl p-8 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarDays size={28} />
                </div>
                <h3 className="text-xl font-bold text-amazon-text mb-2 flex items-center gap-2">
                  Upcoming Events
                </h3>
                <p className="text-sm text-amazon-mutedText leading-relaxed">
                  Prepare your inventory for massive traffic. Nominate products and set discounts early to get featured on the ShopyBucks homepage.
                </p>
              </div>
              
              <div className="mt-8 flex items-center text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                Browse Events <ChevronRight size={18} />
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <CalendarDays size={200} />
            </div>
          </Link>

          <Link
            href="/sales/live"
            className="group relative bg-white border border-amazon-borderGray rounded-2xl p-8 hover:border-amazon-orange hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-orange-50 text-amazon-orange rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Flame size={28} />
                </div>
                <h3 className="text-xl font-bold text-amazon-text mb-2 flex items-center gap-2">
                  Live Sales
                </h3>
                <p className="text-sm text-amazon-mutedText leading-relaxed">
                  Monitor your performance in real-time. Check which products are trending and adjust stock levels to maximize your ROI during active periods.
                </p>
              </div>
              
              <div className="mt-8 flex items-center text-sm font-bold text-amazon-orange group-hover:gap-2 transition-all">
                View Performance <ChevronRight size={18} />
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-amazon-orange">
              <Flame size={200} />
            </div>
          </Link>

        </div>

        {/* ================= FOOTER TIP ================= */}
        <div className="bg-amazon-darkBlue rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/10 p-4 rounded-xl">
             <Rocket className="text-amazon-orange" size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-lg italic">Ready for the Big Billion Days?</h4>
            <p className="text-sm text-gray-400">Our biggest annual sale is approaching. Update your product images and check fulfillment settings to avoid last-minute delays.</p>
          </div>
          <button className="bg-white text-amazon-darkBlue px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amazon-orange transition-colors flex items-center gap-2">
            Check Readiness <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </SellerLayout>
  );
}