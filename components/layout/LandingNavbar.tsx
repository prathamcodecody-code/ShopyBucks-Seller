"use client";

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <header className="flex items-center justify-between px-6 lg:px-16 py-5 border-b bg-white sticky top-0 z-50">
      {/* LOGO SECTION */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex items-center text-2xl font-black uppercase tracking-tighter">
          <span className="text-[#4F1271]">Shopy</span>
          <span className="text-amazon-orange italic ml-0.5 group-hover:text-[#FFD700] transition-colors">
            Bucks
          </span>
        </div>
      </Link>

      {/* NAV LINKS */}
      <nav className="hidden md:flex gap-10 text-sm font-bold uppercase tracking-wider text-amazon-mutedText">
        <Link href="/how-it-works" className="hover:text-amazon-orange transition-colors">
          How it works
        </Link>
        <Link href="/pricing" className="hover:text-amazon-orange transition-colors">
          Pricing
        </Link>
        <Link href="/shipping" className="hover:text-amazon-orange transition-colors">
          Shipping
        </Link>
        <Link href="/gst-help" className="hover:text-amazon-orange transition-colors">
          GST Registration Help
        </Link>
      </nav>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="px-5 py-2 text-sm font-bold hover:bg-gray-100 rounded-md transition-all text-amazon-text"
        >
          Sign In
        </Link>
        <Link
          href="/auth/login"
          className="px-5 py-2 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold rounded-md shadow-sm transition-all"
        >
          Start Selling
        </Link>
      </div>
    </header>
  );
}