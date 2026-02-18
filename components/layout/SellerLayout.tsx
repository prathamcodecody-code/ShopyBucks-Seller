"use client";

import SellerSidebar from "./SellerSidebar";
import SellerHeader from "./SellerHeader";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-seller-bg">
      {/* Sidebar is fixed, so it stays in place while you scroll */}
      <SellerSidebar />

      {/* 1. md:ml-72: Adds a left margin on desktop so content starts after the sidebar.
          2. pt-16 md:pt-0: Adds top padding on mobile to account for the fixed Mobile Header 
             you have in your Sidebar component.
      */}
      <div className="flex flex-col flex-1 md:ml-72 transition-all duration-300">
        <SellerHeader />
        <main className="p-6 pt-20 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
