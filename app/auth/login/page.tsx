"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { loginWithToken } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone || !name || !email) return;
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone, name, email });
      setStep("otp");
    } catch (err) {
      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const verifyOtp = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const res = await api.post("/auth/verify-otp", { phone, otp });
    const { token, user } = res.data;

    if (!token || !user) throw new Error("Invalid response");

    // 🔑 Store token FIRST (sync)
    await loginWithToken(token); // ✅ Wait for user to be fetched

    // 🔁 Navigate based on role
    if (user.role === "ADMIN") {
  router.replace("/admin/dashboard");
} else if (user.role === "SELLER" && user.sellerStatus === "APPROVED") {
  router.replace("/dashboard"); // Go straight to dashboard
} else {
  router.replace("/seller/onboarding"); // Go to onboarding for PENDING/NONE/REJECTED
}

    // ✅ NEW: Default for USER role → onboarding
    router.replace("/seller/onboarding");
    return;

  } catch (err) {
    alert("OTP verification failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white sm:bg-amazon-lightGray px-4">
      {/* Optional Logo Placeholder */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amazon-darkBlue italic">Shopy Bucks</h1>
      </div>

      <div className="bg-white p-8 w-full max-w-[400px] border border-transparent sm:border-amazon-borderGray rounded-lg shadow-none sm:shadow-sm">
        {step === "details" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-normal text-amazon-text mb-6">Create Account</h2>
            
            <div>
              <label className="block text-sm font-bold mb-1 text-amazon-text">Your name</label>
              <input
                placeholder="First and last name"
                className="w-full border border-gray-400 focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-md transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-amazon-text">Email</label>
              <input
                type="email"
                className="w-full border border-gray-400 focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-md transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-amazon-text">Mobile number</label>
              <input
                placeholder="e.g. +1 234 567 890"
                className="w-full border border-gray-400 focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-md transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-medium py-2 rounded-md shadow-sm border border-orange-500 transition-colors mt-2"
            >
              {loading ? "Sending OTP..." : "Verify Mobile Number"}
            </button>

            <p className="text-xs text-amazon-mutedText leading-relaxed mt-4">
              By creating an account, you agree to our <span className="text-blue-700 hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-blue-700 hover:underline cursor-pointer">Privacy Notice</span>.
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-normal">Verify OTP</h2>
              <button 
                onClick={() => setStep("details")}
                className="text-sm text-blue-700 hover:underline"
              >
                Change
              </button>
            </div>
            
            <p className="text-sm text-amazon-mutedText mb-4">
              We've sent a code to <span className="font-bold">{phone}</span>
            </p>

            <input
              placeholder="6-digit code"
              maxLength={6}
              className="w-full border border-gray-400 focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-md text-center text-xl tracking-widest transition-all"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-medium py-2 rounded-md shadow-sm border border-orange-500 transition-colors"
            >
              {loading ? "Verifying..." : "Create your account"}
            </button>
            
            <button 
              className="w-full text-sm text-amazon-mutedText hover:text-amazon-text mt-4"
              onClick={sendOtp}
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-amazon-mutedText space-x-6">
        <span className="hover:underline cursor-pointer">Conditions of Use</span>
        <span className="hover:underline cursor-pointer">Privacy Notice</span>
        <span className="hover:underline cursor-pointer">Help</span>
      </div>
      <p className="mt-4 text-[11px] text-amazon-mutedText">© 2026, Shopy Bucks</p>
    </div>
  );
}