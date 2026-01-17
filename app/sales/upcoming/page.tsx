"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import { 
  Calendar, 
  ChevronRight, 
  Info, 
  LayoutList, 
  CheckCircle2,
  Clock
} from "lucide-react";

export default function UpcomingSalesPage() {
  const upcomingSales = [
    {
      name: "Diwali Mega Sale",
      start: "15 Oct 2026",
      end: "22 Oct 2026",
      status: "Planning",
      description: "Our biggest annual event. Electronics, Fashion, and Home Decor will see 10x traffic."
    },
    {
      name: "New Year Bonanza",
      start: "01 Jan 2027",
      end: "05 Jan 2027",
      status: "Announced",
      description: "Kick off 2027 with a clearance event focused on fitness and winter essentials."
    },
  ];

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight flex items-center gap-3">
              <Calendar className="text-blue-600" /> Upcoming Sales
            </h1>
            <p className="text-sm text-amazon-mutedText mt-1">
              Plan your inventory and marketing strategy for the next 6 months.
            </p>
          </div>
        </div>

        {/* ================= PREPARATION TIMELINE ================= */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <LayoutList size={16} /> Preparation Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Optimize Listings", desc: "Update photos and SEO keywords." },
              { title: "Stock Check", desc: "Ensure you have enough units for high volume." },
              { title: "Price Mapping", desc: "Calculate your margins for deep discounts." },
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">{step.title}</p>
                  <p className="text-xs text-blue-700 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SALES LIST ================= */}
        <div className="space-y-4">
          {upcomingSales.map((sale, i) => (
            <div
              key={i}
              className="bg-white border border-amazon-borderGray rounded-2xl p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-amazon-text group-hover:text-blue-600 transition-colors">
                      {sale.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-amazon-mutedText border uppercase">
                      {sale.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-amazon-mutedText max-w-xl">
                    {sale.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amazon-text bg-gray-50 px-3 py-1.5 rounded-lg border">
                      <Clock size={14} className="text-blue-600" />
                      Starts: {sale.start}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amazon-text bg-gray-50 px-3 py-1.5 rounded-lg border">
                      <CheckCircle2 size={14} className="text-amazon-success" />
                      Ends: {sale.end}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end min-w-[200px]">
                  <button
                    disabled
                    className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed border border-gray-200 flex items-center justify-center gap-2"
                  >
                    Opens Soon <ChevronRight size={16} />
                  </button>
                  <p className="text-[10px] text-amazon-mutedText mt-2 italic">
                    Selection opens 14 days before start
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= INFO BOX ================= */}
        <div className="flex items-start gap-4 p-5 bg-white border-l-4 border-amazon-orange rounded-r-xl shadow-sm">
          <Info className="text-amazon-orange mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-amazon-text">Why participate?</h4>
            <p className="text-xs text-amazon-mutedText leading-relaxed mt-1">
              Participating in upcoming sales gives you a **"Sale Badge"** on your products, 
              improving search ranking and conversion rates. We recommend nominating at least 
              30% of your catalog for maximum impact.
            </p>
          </div>
        </div>

      </div>
    </SellerLayout>
  );
}