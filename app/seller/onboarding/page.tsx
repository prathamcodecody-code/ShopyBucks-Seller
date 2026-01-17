"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  Fingerprint,
  CheckCircle2,
  FileWarning,
} from "lucide-react";

export default function SellerOnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<"NONE" | "PENDING" | "APPROVED" | "REJECTED">("NONE");
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    panNumber: "",
    gstNumber: "",
    aadhaarLast4: "",
  });

  useEffect(() => {
  const checkAccess = async () => {
    try {
      // 1. Check the request status
      const res = await api.get("/seller/request/me");
      const requestData = res.data;

      // 2. If the request is approved, double check the profile
      if (requestData.status === "APPROVED") {
        const profile = await api.get("/seller/me");
        if (profile.data.sellerStatus === "APPROVED") {
          router.replace("/dashboard");
          return;
        }
      }

      // 3. Otherwise, set the UI states
      setStatus(requestData.status || "NONE");
      if (requestData.reason) setRejectionReason(requestData.reason);

    } catch (err) {
      console.error("Onboarding check failed", err);
      setStatus("NONE");
    } finally {
      setFetching(false);
    }
  };
  checkAccess();
}, [router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.businessName || !form.businessType || !form.panNumber || !form.aadhaarLast4) {
      return setError("All required fields must be filled.");
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      return setError("Invalid PAN number format (e.g. ABCDE1234F)");
    }
    if (!/^\d{4}$/.test(form.aadhaarLast4)) {
      return setError("Aadhaar must be exactly 4 digits");
    }

    setLoading(true);
    try {
      await api.post("/seller/request", form);
      setStatus("PENDING");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // --- UI: PENDING STATE ---
  if (status === "PENDING") {
    return (
      <div className="min-h-screen bg-amazon-lightGray flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-10 rounded-2xl shadow-sm text-center border border-amazon-borderGray">
          <div className="w-20 h-20 bg-orange-50 text-amazon-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-amazon-text">Application Received</h2>
          <p className="mt-4 text-amazon-mutedText leading-relaxed">
            Our team is currently verifying your business documents. This usually takes <strong>24-48 hours</strong>. 
            We'll notify you via email once your store is ready!
          </p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="mt-8 text-sm font-bold text-blue-600 hover:underline"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // --- UI: REJECTED STATE (Enhanced with Reason) ---
  if (status === "REJECTED") {
    return (
      <div className="min-h-screen bg-amazon-lightGray flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileWarning size={32} />
            </div>
            <h2 className="text-xl font-bold text-amazon-text">Application Rejected</h2>
            <p className="mt-2 text-sm text-amazon-mutedText">
              We reviewed your seller application but unfortunately could not approve it at this time.
            </p>
          </div>

          {/* Reason Box */}
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Reason for Rejection:</p>
            <p className="text-sm text-red-800 leading-relaxed italic">
              "{rejectionReason || "No specific reason provided. Please contact support."}"
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              onClick={() => setStatus("NONE")}
              className="w-full bg-amazon-darkBlue text-white py-3 rounded-xl font-bold hover:bg-amazon-navy transition-all"
            >
              Update Details & Re-apply
            </button>
            <p className="text-[11px] text-center text-amazon-mutedText">
              Ensure your PAN and Business Name match your legal documents.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-amazon-lightGray py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-amazon-borderGray overflow-hidden">
          
          <div className="bg-amazon-darkBlue p-8 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-amazon-orange" /> Seller Registration
            </h1>
            <p className="text-gray-400 text-sm mt-2">Complete the form below to start selling on ShopyBucks.</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Business Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-wider mb-2">
                <Building2 size={14} /> Business Information
              </div>
              <input
                name="businessName"
                placeholder="Official Business Name"
                className="w-full border border-amazon-borderGray p-3 rounded-lg outline-none focus:ring-1 focus:ring-amazon-orange transition-all"
                value={form.businessName}
                onChange={handleChange}
              />
              <select
                name="businessType"
                className="w-full border border-amazon-borderGray p-3 rounded-lg outline-none bg-white"
                value={form.businessType}
                onChange={handleChange}
              >
                <option value="">Select Business Type</option>
                <option value="Individual">Individual / Freelancer</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="Company">Private Limited Company</option>
              </select>
            </div>

            {/* Legal Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-wider mb-2">
                <CreditCard size={14} /> Tax & Identity
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="panNumber"
                  placeholder="PAN (ABCDE1234F)"
                  maxLength={10}
                  className="border border-amazon-borderGray p-3 rounded-lg outline-none focus:ring-1 focus:ring-amazon-orange"
                  value={form.panNumber}
                  onChange={handleChange}
                />
                <input
                  name="gstNumber"
                  placeholder="GST Number (Optional)"
                  className="border border-amazon-borderGray p-3 rounded-lg outline-none focus:ring-1 focus:ring-amazon-orange"
                  value={form.gstNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Fingerprint className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  name="aadhaarLast4"
                  type="password"
                  placeholder="Last 4 Digits of Aadhaar"
                  maxLength={4}
                  className="w-full border border-amazon-borderGray p-3 rounded-lg outline-none focus:ring-1 focus:ring-amazon-orange"
                  value={form.aadhaarLast4}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : <><CheckCircle2 size={18} /> Submit Application</>}
            </button>

            <p className="text-[11px] text-amazon-mutedText text-center leading-relaxed">
              By submitting, you agree to the ShopyBucks Seller Terms & Conditions and 
              authorize us to verify your business credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}