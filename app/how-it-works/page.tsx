"use client";

import Link from "next/link";
import { 
  UserPlus, 
  PackageSearch, 
  Truck, 
  Wallet, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import LandingNavbar from "@/components/layout/LandingNavbar";

export default function HowItWorksPage() {
  const steps = [
    {
      id: "01",
      title: "Register Your Account",
      description: "Sign up with your GSTIN and Bank Account. It takes less than 10 minutes to set up your basic profile.",
      icon: <UserPlus size={32} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: "02",
      title: "Upload Your Catalog",
      description: "List your products with high-quality images and descriptions. Use our bulk upload tool for faster processing.",
      icon: <PackageSearch size={32} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      id: "03",
      title: "Receive Orders & Ship",
      description: "Once an order is placed, pack the product. Our logistics partners will pick it up from your doorstep.",
      icon: <Truck size={32} />,
      color: "bg-orange-50 text-amazon-orange"
    },
    {
      id: "04",
      title: "Receive Payments",
      description: "Payments are deposited directly into your bank account within 7 days of successful delivery.",
      icon: <Wallet size={32} />,
      color: "bg-green-50 text-amazon-success"
    }
  ];

  return (
    <>
    <LandingNavbar />
    <main className="min-h-screen bg-white text-amazon-text">
      {/* --- HERO SECTION --- */}
      <section className="bg-amazon-darkBlue py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Start Your Selling Journey in <span className="text-amazon-orange italic">4 Simple Steps</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium">
            ShopyBucks provides the tools and reach; you provide the quality products. 
            Together, we grow your business.
          </p>
        </div>
      </section>

      {/* --- STEPS JOURNEY --- */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-0.5 bg-gray-100 -z-10" />

          {steps.map((step, index) => (
            <div key={step.id} className="group flex flex-col items-center text-center space-y-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${step.color}`}>
                {step.icon}
              </div>
              <div className="space-y-3">
                <span className="text-xs font-black text-amazon-orange uppercase tracking-[0.2em]">Step {step.id}</span>
                <h3 className="text-xl font-black">{step.title}</h3>
                <p className="text-sm text-amazon-mutedText leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- DOCUMENT CHECKLIST --- */}
      <section className="bg-amazon-lightGray py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-xl border border-amazon-borderGray">
          <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-tight">Documents Needed to Start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              "GSTIN Number",
              "Active Bank Account",
              "Valid Email & Phone",
              "Signature Copy",
              "PAN Card Copy",
              "Pickup Address Detail"
            ].map((doc) => (
              <div key={doc} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-amazon-orange/30 transition-all">
                <CheckCircle2 className="text-amazon-success shrink-0" />
                <span className="font-bold text-sm text-amazon-text">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REASONS TO JOIN --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Why sellers prefer <br />
            <span className="text-amazon-orange underline decoration-4 underline-offset-8">ShopyBucks Logistics</span>
          </h2>
          <p className="text-amazon-mutedText leading-relaxed">
            We handle the heavy lifting. Our integrated logistics network ensures your products 
            reach every corner of India safely and quickly.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-amazon-orange shrink-0" />
              <p className="text-sm font-bold">Doorstep Pickup: No need to visit courier offices.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-amazon-orange shrink-0" />
              <p className="text-sm font-bold">Automated Tracking: Real-time updates for you and the customer.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-amazon-orange shrink-0" />
              <p className="text-sm font-bold">Fast Deliveries: Reach major cities in 48-72 hours.</p>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
          <img 
            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=800" 
            alt="Logistics" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-amazon-darkBlue rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black">Ready to scale?</h2>
            <p className="text-gray-400 font-medium">Join thousands of successful sellers today.</p>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-3 bg-amazon-orange text-amazon-darkBlue px-10 py-4 rounded-2xl font-black text-xl hover:bg-amazon-orangeHover transition-all"
            >
              Start Registration <ArrowRight />
            </Link>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amazon-orange/10 rounded-full blur-3xl" />
        </div>
      </section>
    </main>
    </>
  );
}