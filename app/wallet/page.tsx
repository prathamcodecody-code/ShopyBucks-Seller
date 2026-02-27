"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import SellerLayout from "@/components/layout/SellerLayout";

type Wallet = {
  totalCredits: number;
  lockedCredits: number;
};

const PRESET_PACKS = [
  { credits: 100, price: 100 },
  { credits: 250, price: 250 },
  { credits: 500, price: 500 },
  { credits: 1000, price: 1000 },
];

export default function SellerWalletPage() {
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [credits, setCredits] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableCredits = (wallet?.totalCredits ?? 0) - (wallet?.lockedCredits ?? 0);

  const loadWallet = async () => {
    try {
      setLoadingWallet(true);
      setError(null);
      const res = await api.get("/seller/wallet");
      
      if (!res.data) {
        setWallet({ totalCredits: 0, lockedCredits: 0 });
      } else {
        setWallet(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load wallet", err);
      setError(err?.response?.data?.message || "Failed to load wallet");
      setWallet({ totalCredits: 0, lockedCredits: 0 });
    } finally {
      setLoadingWallet(false);
    }
  };

  // ✅ Check for payment status on page load
  useEffect(() => {
    loadWallet();

    const status = searchParams.get("status");
    const creditsAdded = searchParams.get("credits");
    const reason = searchParams.get("reason");

    if (status === "success" && creditsAdded) {
      setSuccessMessage(`✅ Successfully added ${creditsAdded} credits to your wallet!`);
      // Clear URL params after showing message
      window.history.replaceState({}, "", "/seller/wallet");
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } else if (status === "failed") {
      setError(`Payment failed: ${reason || "Unknown error"}`);
      // Clear URL params
      window.history.replaceState({}, "", "/seller/wallet");
    }
  }, [searchParams]);

  const buyCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post("/seller/wallet/buy", { credits });
      
      // ✅ Extract payment URL from response
      if (res.data?.paymentUrl) {
        // Redirect to Easebuzz payment page
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (e: any) {
      console.error("Payment initiation error:", e);
      setError(e?.response?.data?.message || "Unable to start payment");
      setLoading(false);
    }
    // Note: Don't set loading to false here - page will redirect
  };

  if (loadingWallet) {
    return (
      <SellerLayout>
        <div className="p-6 text-amazon-mutedText">Loading wallet...</div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto p-6 text-amazon-text">
        <h1 className="text-2xl font-bold text-amazon-darkBlue mb-6">Wallet & Credits</h1>

        {/* ✅ SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div className="flex-1">
                <p className="font-bold">Payment Successful!</p>
                <p className="text-sm">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-700 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* WALLET SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-amazon-borderGray rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase font-bold text-amazon-mutedText mb-1">Total Credits</p>
            <p className="text-2xl font-bold text-amazon-darkBlue">{wallet?.totalCredits ?? 0}</p>
          </div>

          <div className="bg-white border border-amazon-borderGray rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase font-bold text-amazon-mutedText mb-1">Locked (In Campaigns)</p>
            <p className="text-2xl font-bold text-amazon-navy">{wallet?.lockedCredits ?? 0}</p>
          </div>

          <div className="bg-amazon-lightGray border border-amazon-orange/20 rounded-lg p-5 shadow-sm">
            <p className="text-xs uppercase font-bold text-amazon-orange mb-1">Available to Spend</p>
            <p className="text-2xl font-black text-amazon-darkBlue">{availableCredits}</p>
          </div>
        </div>

        {/* BUY CREDITS SECTION */}
        <div className="bg-white border border-amazon-borderGray rounded-lg overflow-hidden">
          <div className="bg-amazon-lightGray px-6 py-4 border-b border-amazon-borderGray">
            <h2 className="text-lg font-bold text-amazon-navy">Add Credits to Wallet</h2>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-amazon-mutedText mb-4">
              Select a credit pack or enter a custom amount. Credits are added instantly after successful payment.
            </p>

            {/* PRESET PACKS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {PRESET_PACKS.map((p) => (
                <button
                  key={p.credits}
                  onClick={() => setCredits(p.credits)}
                  disabled={loading}
                  className={`relative border-2 rounded-lg p-4 transition-all ${
                    credits === p.credits
                      ? "border-amazon-orange bg-orange-50 shadow-inner"
                      : "border-amazon-borderGray hover:border-amazon-orangeHover"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {credits === p.credits && (
                    <div className="absolute -top-2 -right-2 bg-amazon-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                  <p className="font-bold text-amazon-darkBlue">{p.credits}</p>
                  <p className="text-xs text-amazon-mutedText">₹{p.price}</p>
                </button>
              ))}
            </div>

            {/* CUSTOM INPUT */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-amazon-mutedText">₹</span>
                  <input
                    type="number"
                    min={10}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    disabled={loading}
                    className="w-full border border-amazon-borderGray rounded px-7 py-2 focus:ring-1 focus:ring-amazon-orange outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex-1 pt-5">
                <p className="text-sm italic text-amazon-mutedText">
                  1 Credit = ₹1.00
                </p>
              </div>
            </div>

            {/* FINAL SUMMARY BOX */}
            <div className="bg-amazon-lightGray rounded-md p-4 flex justify-between items-center mb-6">
              <div>
                <p className="text-sm font-medium">Order Summary</p>
                <p className="text-xs text-amazon-mutedText">Subtotal for {credits} Credits</p>
              </div>
              <p className="text-xl font-bold text-amazon-darkBlue">₹{credits.toFixed(2)}</p>
            </div>

            <button
              onClick={buyCredits}
              disabled={loading || credits <= 0}
              className="w-full sm:w-auto px-12 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold py-3 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting to Payment Gateway..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-amazon-mutedText">
          Secure payment processing. By continuing, you agree to our Credit Usage Policy.
        </p>
      </div>
    </SellerLayout>
  );
}