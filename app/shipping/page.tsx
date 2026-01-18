"use client";

import Link from "next/link";
import LandingNavbar from "@/components/layout/LandingNavbar";
import { 
  Truck, 
  MapPin, 
  RotateCcw, 
  ShieldCheck, 
  PackageCheck, 
  ArrowRight,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function ShippingPage() {
  const features = [
    {
      title: "Doorstep Pickup",
      desc: "Our logistics partners come to your warehouse or shop to collect orders. No need to visit courier offices.",
      icon: <MapPin size={28} />,
    },
    {
      title: "Lowest Shipping Rates",
      desc: "Benefit from our negotiated bulk rates. Ship products across India starting at minimal costs.",
      icon: <PackageCheck size={28} />,
    },
    {
      title: "Secure Packaging",
      desc: "Get access to ShopyBucks branded packaging material to ensure your products stay safe during transit.",
      icon: <ShieldCheck size={28} />,
    },
    {
      title: "Hassle-Free Returns",
      desc: "We manage the entire reverse logistics process. Returns are picked up from customers and brought back to you.",
      icon: <RotateCcw size={28} />,
    }
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-amazon-text">
      <LandingNavbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-amazon-darkBlue py-20 px-6 text-center overflow-hidden relative">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amazon-orange/20 text-amazon-orange px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amazon-orange/30">
            Smart Logistics Network
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Focus on Sales, <br />
            <span className="text-amazon-orange italic">We'll Handle the Shipping</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto">
            From pickup to delivery and returns, ShopyBucks provides a seamless logistics 
            experience to help you reach 28,000+ pincodes effortlessly.
          </p>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-amazon-orange/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* --- CORE FEATURES --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-amazon-borderGray hover:border-amazon-orange/50 transition-all group bg-white hover:shadow-xl">
              <div className="w-14 h-14 bg-amazon-orange/10 rounded-2xl flex items-center justify-center text-amazon-orange mb-6 group-hover:bg-amazon-orange group-hover:text-amazon-darkBlue transition-all">
                {item.icon}
              </div>
              <h3 className="text-lg font-black mb-3">{item.title}</h3>
              <p className="text-sm text-amazon-mutedText leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- LOGISTICS PROCESS --- */}
      <section className="bg-amazon-lightGray py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-black tracking-tight uppercase">The Shipping Lifecycle</h2>
            <p className="text-amazon-mutedText font-bold">Simple. Reliable. Automated.</p>
          </div>

          <div className="space-y-4">
            {[
              { step: "01", title: "Order Notification", detail: "Get instant alerts on your seller dashboard and mobile app when a customer buys your product." },
              { step: "02", title: "Pack Your Product", detail: "Wrap the item securely and download the shipping label from our portal. One-click label generation." },
              { step: "03", title: "Courier Pickup", detail: "Our courier partner arrives at your location. Hand over the package and update the status in the app." },
              { step: "04", title: "Last Mile Delivery", detail: "The product is delivered to the customer. Track the journey in real-time until it's successfully handed over." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-amazon-borderGray flex items-center gap-6 group hover:border-amazon-orange transition-colors">
                <span className="text-4xl font-black text-gray-100 group-hover:text-amazon-orange/20 transition-colors">{s.step}</span>
                <div>
                  <h4 className="font-black text-amazon-text uppercase tracking-tight">{s.title}</h4>
                  <p className="text-sm text-amazon-mutedText font-medium">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- RETURN POLICY SECTION --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000" 
            alt="Shipping Logistics" 
            className="w-full h-full object-cover aspect-video lg:aspect-square"
          />
        </div>
        <div className="order-1 lg:order-2 space-y-8">
          <h2 className="text-4xl font-black tracking-tight leading-tight">
            Fair & Transparent <br />
            <span className="text-[#4F1271]">Return Policy</span>
          </h2>
          <p className="text-amazon-mutedText font-medium leading-relaxed">
            Returns are a part of e-commerce, but they shouldn't hurt your wallet. ShopyBucks 
            offers clear RTO (Return to Origin) protection.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 bg-amazon-success/10 text-amazon-success p-1 rounded-full h-fit"><CheckCircle2 size={16} /></div>
              <div>
                <p className="font-black text-sm uppercase">Fraud Protection</p>
                <p className="text-xs text-amazon-mutedText font-bold">We verify every return request to prevent fraudulent claims by buyers.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 bg-amazon-success/10 text-amazon-success p-1 rounded-full h-fit"><CheckCircle2 size={16} /></div>
              <div>
                <p className="font-black text-sm uppercase">Quality Checks</p>
                <p className="text-xs text-amazon-mutedText font-bold">Logistics partners perform a basic check at the time of pickup from the buyer.</p>
              </div>
            </div>
          </div>

          <button className="text-amazon-darkBlue font-black border-b-2 border-amazon-darkBlue pb-1 hover:text-amazon-orange hover:border-amazon-orange transition-all flex items-center gap-2">
            Read Detailed Return Policy <ChevronDown size={16} />
          </button>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-amazon-orange rounded-[3rem] p-12 text-center text-amazon-darkBlue shadow-xl">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Ready to deliver nationwide?</h2>
          <p className="font-bold uppercase tracking-widest text-sm mt-4 opacity-70">Join 28,000+ satisfied sellers</p>
          <div className="mt-10">
            <Link 
              href="/auth/login" 
              className="bg-amazon-darkBlue text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-amazon-navy transition-all shadow-2xl active:scale-95 flex items-center justify-center w-full sm:w-fit mx-auto gap-3"
            >
              Start Selling Today <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}