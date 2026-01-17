"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import { useAuth } from "@/app/context/AuthContext";
import { 
  Bell, 
  Flame, 
  Megaphone, 
  ShieldCheck, 
  PartyPopper, 
  ChevronRight, 
  Info
} from "lucide-react";

export default function SellerNotificationsPage() {
  const { user } = useAuth();

  const upcomingSales = [
    { title: "Diwali Mega Sale", date: "Starts in 12 days", urgency: "High" },
    { title: "New Year Sale", date: "Coming Soon", urgency: "Medium" },
    { title: "Fashion Week Sale", date: "February 2026", urgency: "Low" },
  ];

  const announcements = [
    { text: "New seller dashboard launched", type: "update" },
    { text: "Faster payouts coming soon", type: "feature" },
    { text: "Improved order tracking experience", type: "update" },
  ];

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight flex items-center gap-3">
              <Bell className="text-amazon-orange" /> Notifications
            </h1>
            <p className="text-sm text-amazon-mutedText mt-1">
              Platform updates, upcoming sales, and important messages for your store.
            </p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
            Mark all as read
          </button>
        </div>

        {/* ================= WELCOME CARD ================= */}
        <div className="relative overflow-hidden bg-amazon-darkBlue rounded-2xl p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <PartyPopper className="text-amazon-orange" /> Welcome to ShopyBucks, {user?.name || "Seller"}!
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                You are now part of our growing ecosystem. Start listing your products to reach millions of customers. 
                Keep an eye on this page for seasonal sale invites and policy updates.
              </p>
            </div>
            <button className="bg-amazon-orange text-amazon-darkBlue px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amazon-orangeHover transition-all whitespace-nowrap shadow-md">
              Complete Profile
            </button>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amazon-orange/10 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: SALES & ANNOUNCEMENTS (8 Cols equivalent) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* UPCOMING SALES */}
            <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Flame size={18} className="text-amazon-danger" /> Upcoming Sales Events
                </h3>
                <span className="text-[10px] bg-amazon-danger/10 text-amazon-danger px-2 py-0.5 rounded font-bold">LIVE SOON</span>
              </div>

              <div className="divide-y divide-amazon-borderGray">
                {upcomingSales.map((sale, i) => (
                  <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-amazon-orange">
                        <PartyPopper size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-amazon-text group-hover:text-blue-600 transition-colors">{sale.title}</p>
                        <p className="text-xs text-amazon-mutedText">{sale.date}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-amazon-mutedText bg-gray-100 px-3 py-1.5 rounded-md cursor-not-allowed uppercase tracking-tighter">
                      Closed <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PLATFORM ANNOUNCEMENTS */}
            <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50">
                <h3 className="font-bold text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Megaphone size={18} className="text-blue-600" /> Platform News
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {announcements.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <p className="text-sm text-amazon-text font-medium group-hover:translate-x-1 transition-transform cursor-default">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: ACCOUNT STATUS & LOGS */}
          <div className="space-y-6">
            
            {/* ACCOUNT STATUS */}
            <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50">
                <h3 className="font-bold text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                  <ShieldCheck size={18} className="text-amazon-success" /> Account Health
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-amazon-mutedText font-medium">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-amazon-success border border-green-200">
                    {user?.sellerStatus || "ACTIVE"}
                  </span>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                  <ShieldCheck size={16} className="text-amazon-success mt-0.5" />
                  <p className="text-[11px] text-amazon-success font-medium leading-relaxed">
                    Great job! You have zero policy violations and your store is in excellent standing.
                  </p>
                </div>
              </div>
            </div>

            {/* HELPFUL TIPS */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Info size={16} /> Pro Tip
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Stores with at least 4 high-quality images per product see a 20% increase in order conversions.
              </p>
              <button className="mt-4 text-[11px] font-bold text-blue-700 hover:underline uppercase">
                Optimize Inventory
              </button>
            </div>

          </div>
        </div>
      </div>
    </SellerLayout>
  );
}