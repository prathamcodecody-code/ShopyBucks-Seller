"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ShieldAlert, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SellerSuspendedPage() {
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSellerInfo() {
      try {
        const res = await api.get("/seller/profile");
        
        // If not suspended, redirect to appropriate page
        if (res.data.sellerStatus === "APPROVED") {
          router.push("/dashboard");
          return;
        }
        
        if (res.data.sellerStatus === "PENDING") {
          router.push("/seller/onboarding");
          return;
        }
        
        setSellerInfo(res.data);
      } catch (err) {
        console.error("Failed to load seller info", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    loadSellerInfo();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("seller_token");
    document.cookie = "seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amazon-lightGray">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amazon-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-lightGray flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white border-4 border-red-500 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
          
          {/* Header */}
          <div className="bg-red-500 px-8 py-6 flex items-center gap-4">
            <ShieldAlert className="text-white" size={48} />
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Account Suspended
              </h1>
              <p className="text-red-100 font-bold text-sm uppercase tracking-widest mt-1">
                Access Restricted
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            
            {/* Alert Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <p className="text-amazon-darkBlue font-bold mb-2">
                Your seller account has been suspended by our admin team.
              </p>
              <p className="text-amazon-mutedText text-sm">
                You currently do not have access to your seller dashboard, and all your products have been hidden from the marketplace.
              </p>
            </div>

            {/* Suspension Reason */}
            {sellerInfo?.sellerRejectedReason && (
              <div className="bg-white border-2 border-amazon-borderGray rounded-xl p-6">
                <h3 className="font-black text-amazon-darkBlue uppercase text-xs tracking-widest mb-3">
                  Suspension Reason
                </h3>
                <p className="text-amazon-text font-medium bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {sellerInfo.sellerRejectedReason}
                </p>
              </div>
            )}

            {/* What You Can Do */}
            <div className="bg-amazon-lightGray border-2 border-amazon-borderGray rounded-xl p-6">
              <h3 className="font-black text-amazon-darkBlue uppercase text-xs tracking-widest mb-3">
                What You Can Do
              </h3>
              <ul className="space-y-2 text-sm text-amazon-mutedText">
                <li className="flex items-start gap-2">
                  <span className="text-amazon-orange mt-1 text-xl">•</span>
                  <span className="font-bold">Contact our support team to resolve the issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amazon-orange mt-1 text-xl">•</span>
                  <span className="font-bold">Review our seller policies and terms of service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amazon-orange mt-1 text-xl">•</span>
                  <span className="font-bold">Wait for the admin team to review your account</span>
                </li>
              </ul>
            </div>

            {/* Seller Info */}
            <div className="bg-white border-2 border-amazon-borderGray rounded-xl p-6">
              <h3 className="font-black text-amazon-darkBlue uppercase text-xs tracking-widest mb-3">
                Account Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amazon-mutedText font-bold">Business Name:</span>
                  <span className="text-amazon-darkBlue font-black">{sellerInfo?.businessName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-mutedText font-bold">Email:</span>
                  <span className="text-amazon-darkBlue font-black">{sellerInfo?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-mutedText font-bold">Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border-2 border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    SUSPENDED
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 bg-amazon-darkBlue border-2 border-amazon-darkBlue px-6 py-3 rounded-lg text-sm font-black text-white uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Log Out
              </button>
              <a
                href="mailto:support@shopybucks.com?subject=Seller Account Suspension - Appeal"
                className="flex-1 bg-amazon-orange border-2 border-amazon-darkBlue px-6 py-3 rounded-lg text-sm font-black text-amazon-darkBlue uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Mail size={16} /> Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}