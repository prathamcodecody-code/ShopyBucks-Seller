"use client";

import Link from "next/link";
import LandingNavbar from "@/components/layout/LandingNavbar";
import { 
  Check, 
  X, 
  Info, 
  TrendingUp, 
  ArrowRight, 
  HelpCircle 
} from "lucide-react";

export default function PricingPage() {
  const feeBreakdown = [
    { label: "Commission Fee", value: "0%", description: "We don't take a cut from your sales." },
    { label: "Listing Fee", value: "FREE", description: "Upload unlimited products at no cost." },
    { label: "Payment Gateway Fee", value: "0%", description: "No processing fees on your transactions." },
    { label: "Subscription Fee", value: "₹0", description: "No monthly or yearly hidden charges." },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-amazon-text">
      <LandingNavbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-amazon-darkBlue py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Keep <span className="text-amazon-orange italic">100% of Your Profits</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto">
            Unlike other marketplaces that charge 15-30% in hidden fees, ShopyBucks offers a 
            completely free platform to help your business scale.
          </p>
        </div>
      </section>

      {/* --- COMPARISON TABLE --- */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-black tracking-tight uppercase">How we compare</h2>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-amazon-borderGray shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amazon-lightGray/50">
                <th className="p-6 text-lg font-black uppercase tracking-tighter">Feature</th>
                <th className="p-6 text-center">
                   <div className="text-[#4F1271] font-black text-xl uppercase tracking-tighter">Shopy<span className="text-amazon-orange italic">Bucks</span></div>
                </th>
                <th className="p-6 text-center text-amazon-mutedText font-bold uppercase text-xs">Other Marketplaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-6 font-bold text-sm">Selling Commission</td>
                <td className="p-6 text-center text-amazon-success font-black text-xl">0%</td>
                <td className="p-6 text-center text-amazon-mutedText text-sm italic">15% - 25%</td>
              </tr>
              <tr>
                <td className="p-6 font-bold text-sm">Fixed Closing Fee</td>
                <td className="p-6 text-center text-amazon-success font-black text-xl">₹0</td>
                <td className="p-6 text-center text-amazon-mutedText text-sm italic">₹15 - ₹60</td>
              </tr>
              <tr>
                <td className="p-6 font-bold text-sm">Listing Fees</td>
                <td className="p-6 text-center text-amazon-success font-black text-xl">Free</td>
                <td className="p-6 text-center text-amazon-mutedText text-sm italic">Paid / Limited</td>
              </tr>
              <tr>
                <td className="p-6 font-bold text-sm">Marketing Fee</td>
                <td className="p-6 text-center text-amazon-success font-black text-xl">Optional</td>
                <td className="p-6 text-center text-amazon-mutedText text-sm italic">Mandatory Deductions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --- TRANSPARENT BREAKDOWN --- */}
      <section className="bg-amazon-lightGray py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tight leading-tight text-amazon-darkBlue">
                Transparent Pricing. <br />
                <span className="text-amazon-orange">Zero Surprises.</span>
              </h2>
              <p className="text-amazon-mutedText leading-relaxed font-medium">
                At ShopyBucks, our mission is to digitize Indian local businesses. To achieve this, 
                we have removed all financial barriers for new and established sellers.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amazon-success/10 p-1 rounded-full text-amazon-success"><Check size={16} /></div>
                  <span className="font-bold text-sm">No Payment Gateway Charges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amazon-success/10 p-1 rounded-full text-amazon-success"><Check size={16} /></div>
                  <span className="font-bold text-sm">No Collection Fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amazon-success/10 p-1 rounded-full text-amazon-success"><Check size={16} /></div>
                  <span className="font-bold text-sm">No Technology Fees</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeBreakdown.map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-amazon-borderGray shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black uppercase text-amazon-mutedText tracking-widest mb-1">{item.label}</p>
                  <p className="text-3xl font-black text-amazon-orange mb-3">{item.value}</p>
                  <p className="text-xs text-amazon-mutedText leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SHIPPING INFO BOX --- */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">
         <div className="flex justify-center"><Info size={48} className="text-[#4F1271]" /></div>
         <h2 className="text-3xl font-black tracking-tight">So, how do we make money?</h2>
         <p className="text-amazon-mutedText font-medium leading-relaxed">
           While selling and listing are free, we offer premium services like **Featured Ads**, 
           **Advanced Analytics**, and **Logistics Insurance** for sellers who want to grow faster. 
           These are completely optional — you only pay if you choose to use them.
         </p>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto bg-amazon-orange rounded-[3rem] p-12 text-center shadow-2xl shadow-amazon-orange/30">
           <h2 className="text-3xl md:text-5xl font-black text-amazon-darkBlue tracking-tight">Start for Free Today</h2>
           <p className="text-amazon-darkBlue/70 font-bold uppercase tracking-widest text-sm mt-4">Zero commission. Zero risk.</p>
           <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-12 py-4 bg-amazon-darkBlue text-white rounded-2xl text-xl font-black transition-all hover:bg-amazon-navy active:scale-95 shadow-lg"
              >
                Create Seller Account
              </Link>
              <Link
                href="/how-it-works"
                className="px-12 py-4 bg-white text-amazon-darkBlue border-2 border-amazon-darkBlue rounded-2xl text-xl font-black transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                How it works <ArrowRight size={20} />
              </Link>
           </div>
        </div>
      </section>
    </main>
  );
}