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
      <SellerSidebar />

      <div className="flex flex-col flex-1">
        <SellerHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
