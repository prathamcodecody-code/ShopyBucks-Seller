"use client";

import Link from "next/link";
import LandingNavbar from "@/components/layout/LandingNavbar";
import { 
  Scale, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  BadgeIndianRupee,
  ArrowRight
} from "lucide-react";

export default function GSTSupportPage() {
  const benefits = [
    {
      title: "Expert CA Team",
      desc: "Our certified Chartered Accountants handle the entire filing process for you.",
      icon: <Users size={24} />,
    },
    {
      title: "Minimal Service Fee",
      desc: "Get your GST registration at the lowest market price, exclusive to ShopyBucks sellers.",
      icon: <BadgeIndianRupee size={24} />,
    },
    {
      title: "Fast-Track Approval",
      desc: "We ensure all documents are perfect to avoid rejections and speed up the process.",
      icon: <Clock size={24} />,
    },
    {
      title: "End-to-End Support",
      desc: "From document collection to getting your GSTIN, we manage everything.",
      icon: <FileText size={24} />,
    }
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-amazon-text">
      <LandingNavbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-amazon-lightGray py-16 lg:py-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-amazon-orange/30 px-4 py-1.5 rounded-full shadow-sm">
            <Scale className="text-amazon-orange" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Legal & Compliance Support</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
            Don't have a <span className="text-amazon-orange italic">GSTIN</span> yet? <br />
            Our Experts are here to help.
          </h1>
          <p className="text-lg text-amazon-mutedText max-w-2xl mx-auto font-medium">
            Starting your online business shouldn't be blocked by paperwork. Our dedicated CA team helps you get registered quickly at a minimal cost.
          </p>
          <div className="pt-6">
            {/* Added Link to Hero Button */}
            <Link href="https://www.firststartup.in/">
              <button className="bg-amazon-darkBlue text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-amazon-navy transition-all active:scale-95">
                Talk to a GST Expert
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- BENEFITS GRID --- */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-amazon-borderGray hover:border-amazon-orange transition-all group bg-white shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 bg-amazon-orange/10 rounded-xl flex items-center justify-center text-amazon-orange mb-6 group-hover:bg-amazon-orange group-hover:text-amazon-darkBlue transition-all">
                {item.icon}
              </div>
              <h3 className="text-lg font-black mb-3">{item.title}</h3>
              <p className="text-sm text-amazon-mutedText leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS (GST EDITION) --- */}
      <section className="bg-amazon-darkBlue py-20 px-6 overflow-hidden relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white">How we get you registered</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Submit Details", desc: "Fill out a simple form with your basic identity and business proof." },
              { step: "02", title: "CA Verification", desc: "Our team reviews your documents and prepares your GST application." },
              { step: "03", title: "Get GSTIN", desc: "We file the application and track it until your GSTIN is generated." }
            ].map((s, i) => (
              <div key={i} className="relative space-y-4">
                <span className="text-5xl font-black text-amazon-orange/20 absolute -top-6 -left-2">{s.step}</span>
                <h4 className="text-xl font-bold text-white relative z-10">{s.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amazon-orange/10 rounded-full blur-[120px]" />
      </section>

      {/* --- PRICING CTA --- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-[3rem] p-1 bg-gradient-to-br from-amazon-orange to-[#4F1271]">
          <div className="bg-white rounded-[2.9rem] p-10 lg:p-16 text-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight">
              Get Started for as low as <span className="text-amazon-success">₹499*</span>
            </h2>
            <p className="text-amazon-mutedText font-bold uppercase tracking-widest text-xs italic">
              *Exclusive price for ShopyBucks sellers only
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="https://www.firststartup.in/"
                className="w-full sm:w-auto px-10 py-4 bg-amazon-orange text-amazon-darkBlue rounded-2xl font-black text-lg shadow-lg hover:bg-amazon-orangeHover transition-all flex items-center justify-center gap-2"
              >
                Register Now <ArrowRight size={20} />
              </Link>
              <span className="text-amazon-mutedText font-bold text-sm">OR</span>
              <button className="text-amazon-darkBlue font-black border-b-2 border-amazon-darkBlue pb-1 hover:text-amazon-orange hover:border-amazon-orange transition-all">
                Request a Callback
              </button>
            </div>
            
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale contrast-125">
               <span className="text-[10px] font-black uppercase border border-amazon-borderGray py-2 rounded-lg">Reliable</span>
               <span className="text-[10px] font-black uppercase border border-amazon-borderGray py-2 rounded-lg">Paperless</span>
               <span className="text-[10px] font-black uppercase border border-amazon-borderGray py-2 rounded-lg">Secure</span>
               <span className="text-[10px] font-black uppercase border border-amazon-borderGray py-2 rounded-lg">Expert-Led</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ MINI --- */}
      <section className="py-20 px-6 max-w-3xl mx-auto text-center">
         <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Common Questions</h3>
         <div className="text-left space-y-6">
            <div className="p-6 bg-amazon-lightGray rounded-2xl">
               <p className="font-bold text-sm mb-1">How long does it take?</p>
               <p className="text-xs text-amazon-mutedText leading-relaxed font-medium">Typically, it takes 3-7 working days for the government to process and issue a GSTIN after we submit the application.</p>
            </div>
            <div className="p-6 bg-amazon-lightGray rounded-2xl">
               <p className="font-bold text-sm mb-1">What documents do I need?</p>
               <p className="text-xs text-amazon-mutedText leading-relaxed font-medium">Generally, you need your PAN Card, Aadhaar Card, Photo, and Proof of Business Address (like an electricity bill or rent agreement).</p>
            </div>
         </div>
      </section>
    </main>
  );
}
