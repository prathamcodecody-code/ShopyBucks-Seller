"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function SellerHeader() {
  const router = useRouter();
  const { logout, user } = useAuth(); // Assuming user object exists in context

  const sellerDisplayName =
  user?.businessName ||
  user?.shopName ||
  user?.storeName ||
  (user?.name !== "Seller" ? user?.name : null) ||
  user?.email?.split("@")[0] ||
  "Seller";
  
  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  function formatName(name: string) {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

  return (
    <header className="h-16 bg-white border-b border-amazon-borderGray flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Left Section: Branding */}
      <div className="flex items-center gap-4">
        <div className="bg-amazon-darkBlue text-white px-3 py-1 rounded-md font-bold text-sm tracking-tight">
          SELLER
        </div>
        <h1 className="font-bold text-lg text-amazon-text hidden sm:block">
          Central Panel
        </h1>
      </div>

      {/* Right Section: User & Actions */}
      <div className="flex items-center gap-6">
        {/* User Info (Optional) */}
        <div className="hidden md:flex flex-col items-end">
  <span className="text-xs text-amazon-mutedText font-medium">
    Hello,
  </span>
  <span className="text-sm font-bold text-amazon-text">
  {formatName(sellerDisplayName)}
</span>
</div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-amazon-borderGray mx-2 hidden sm:block"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amazon-text bg-gray-50 border border-amazon-borderGray rounded-md hover:bg-gray-100 hover:text-amazon-danger transition-all shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}