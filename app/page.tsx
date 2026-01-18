"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import LandingNavbar from "@/components/layout/LandingNavbar"; // Adjust path as needed
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Globe, 
  CheckCircle2 
} from "lucide-react";

export default function SellerLandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <main className="min-h-screen bg-white font-sans text-amazon-text">
      <LandingNavbar />

      {/* HERO SECTION */}
      <section className="px-6 lg:px-16 py-20 lg:py-32 bg-amazon-darkBlue text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-block bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              India's Most Seller-Friendly Marketplace
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
              Sell to Millions with 
              <span className="text-amazon-orange italic"> 0% Commission</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              Join 50,000+ businesses growing with ShopyBucks. Reach every pincode in India with our robust logistics and instant payouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/auth/login"
                className="px-10 py-4 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-lg text-lg font-black text-center transition-all shadow-lg active:scale-95"
              >
                Launch Your Store
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 text-amazon-mutedText border border-white/10 rounded-lg">
                <ShieldCheck className="text-amazon-success" />
                <span className="text-sm font-bold text-gray-300">GST Registration Required</span>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
             <div className="bg-gradient-to-br from-amazon-navy to-amazon-darkBlue border border-white/10 rounded-2xl aspect-square lg:aspect-video shadow-2xl flex items-center justify-center p-8">
                <div className="w-full h-full border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-4">
                   <TrendingUp size={64} className="text-amazon-orange opacity-50" />
                   <p className="text-amazon-mutedText font-bold uppercase tracking-tighter">Marketplace Growth Data</p>
                </div>
             </div>
             <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl text-amazon-darkBlue hidden md:block border border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                   <CheckCircle2 className="text-amazon-success" />
                   <span className="font-black text-xl text-amazon-text">₹0</span>
                </div>
                <p className="text-[10px] font-bold uppercase text-amazon-mutedText tracking-widest">Setup Fees Forever</p>
             </div>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-amazon-orange/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ... (Rest of your sections remain the same) ... */}
      
      {/* VALUE PROPS */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
           <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-amazon-text">Why sell on ShopyBucks?</h2>
           <p className="text-amazon-mutedText font-medium">Everything you need to succeed in India's digital economy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Profit Maximization", desc: "With 0% commission, you take home 100% of your sale price. No hidden charges, no surprises.", icon: TrendingUp },
            { title: "Instant Payouts", desc: "Get your payments within 7 days of delivery. Maintain healthy cash flow for your business operations.", icon: Zap },
            { title: "Pan-India Reach", desc: "Deliver to 28,000+ pincodes. We handle the logistics so you can focus on making great products.", icon: Globe },
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl border border-amazon-borderGray hover:border-amazon-orange/50 transition-colors group">
              <div className="w-14 h-14 bg-amazon-orange/10 rounded-xl flex items-center justify-center text-amazon-orange mb-6 group-hover:bg-amazon-orange group-hover:text-amazon-darkBlue transition-all">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-amazon-text">{item.title}</h3>
              <p className="text-amazon-mutedText text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto bg-amazon-orange rounded-3xl p-12 text-center space-y-8 shadow-xl shadow-amazon-orange/20">
           <h2 className="text-3xl lg:text-5xl font-black text-amazon-darkBlue tracking-tight">Ready to grow your business?</h2>
           <p className="text-amazon-darkBlue/70 font-bold uppercase tracking-widest text-sm">Takes less than 10 minutes to register</p>
           <Link
             href="/auth/login"
             className="inline-block px-12 py-5 bg-amazon-darkBlue text-white rounded-xl text-xl font-black transition-all hover:bg-amazon-navy active:scale-95 shadow-2xl"
           >
             Get Started Now
           </Link>
        </div>
      </section>
    </main>
  );
}
