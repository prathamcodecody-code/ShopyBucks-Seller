"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Store, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

type Step = "loginPassword" | "loginOtpSend" | "loginOtpVerify" | "signup" | "signupOtp";

export default function SellerAuthPage() {
  const { loginWithToken } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("loginPassword");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSuccess = async (token: string, user: any) => {
    await loginWithToken(token);
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (user.role === "SELLER" && user.sellerStatus === "APPROVED") {
      router.replace("/dashboard");
    } else {
      router.replace("/seller/onboarding");
    }
  };

  const loginPassword = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/password", { email, password });
      await handleSuccess(res.data.token, res.data.user);
    } catch {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const sendLoginOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/login/otp/send", { phone });
      setStep("loginOtpVerify");
    } catch {
      alert("Phone number not registered");
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/otp/verify", { phone, otp });
      await handleSuccess(res.data.token, res.data.user);
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    setLoading(true);
    try {
      await api.post("/auth/signup", { name, email, phone, password });
      setStep("signupOtp");
    } catch {
      alert("User already exists");
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup/verify-otp", { phone, otp });
      await handleSuccess(res.data.token, res.data.user);
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans text-amazon-text">
      
      {/* LEFT PANEL - BRANDING (Visible on Desktop) */}
      <section className="hidden lg:flex flex-col justify-between bg-amazon-darkBlue p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-12">
             <div className="flex items-center text-3xl font-black uppercase tracking-tighter">
                <div className="relative w-32 md:w-44 transition-transform group-hover:scale-105 duration-300">
                  <img src="/shopybucks.jpg" alt="ShopyBucks Logo" className="w-full h-auto object-contain" />
                </div>
             </div>
          </Link>
          
          <h2 className="text-5xl font-black leading-tight mb-8">
            Scale your business with <br />
            <span className="text-amazon-orange italic underline decoration-4 underline-offset-8">Zero Commission</span>
          </h2>
          
          <ul className="space-y-6">
            {[
              { icon: <Store className="text-amazon-orange" />, text: "Reach 50 Million+ Customers" },
              { icon: <TrendingUp className="text-amazon-orange" />, text: "Fastest Payouts in the Industry" },
              { icon: <CheckCircle2 className="text-amazon-orange" />, text: "24/7 Seller Support" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-xl font-bold opacity-90">
                <div className="p-2 bg-white/10 rounded-lg">{item.icon}</div>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <ShieldCheck className="text-amazon-success" size={32} />
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Secure Payments</p>
            <p className="text-xs text-gray-400 font-medium">PCI-DSS Compliant Infrastructure</p>
          </div>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-amazon-orange/5 rounded-full blur-3xl" />
      </section>

      {/* RIGHT PANEL - AUTH FORMS */}
      <section className="flex flex-col items-center justify-center p-8 lg:p-24 relative bg-amazon-lightGray lg:bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden mb-12 text-center">
            <div className="flex items-center text-2xl font-black uppercase tracking-tighter mb-2">
                <div className="relative w-32 md:w-44 transition-transform group-hover:scale-105 duration-300">
                  <img src="/shopybucks.jpg" alt="ShopyBucks Logo" className="w-full h-auto object-contain" />
                </div>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-amazon-mutedText">Seller Central</p>
        </div>

        <div className="w-full max-w-[420px] bg-white lg:bg-transparent p-8 lg:p-0 rounded-[2.5rem] shadow-xl lg:shadow-none border border-gray-100 lg:border-none">
          
          {/* Form Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-amazon-darkBlue">
              {step === "signup" ? "Get Started" : "Welcome Back"}
            </h1>
            <p className="text-amazon-mutedText font-bold mt-2">
              {step === "signup" ? "Enter details to create your seller account" : "Manage your store and orders seamlessly"}
            </p>
          </div>

          <div className="space-y-5">
            {/* LOGIN PASSWORD */}
            {step === "loginPassword" && (
              <>
                <AuthInput label="Email Address" placeholder="name@company.com" value={email} onChange={setEmail} />
                <AuthInput label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
                <div className="pt-2">
                    <SubmitButton loading={loading} onClick={loginPassword}>Log in to Dashboard</SubmitButton>
                </div>
                
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase font-black"><span className="bg-white lg:bg-white px-4 text-amazon-mutedText tracking-widest">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setStep("loginOtpSend")} className="py-3 border-2 border-gray-100 rounded-xl font-bold text-sm hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all">Login with OTP</button>
                    <button onClick={() => setStep("signup")} className="py-3 border-2 border-gray-100 rounded-xl font-bold text-sm hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all">Create Account</button>
                </div>
              </>
            )}

            {/* OTP FLOWS */}
            {step === "loginOtpSend" && (
              <>
                <BackButton onClick={() => setStep("loginPassword")} />
                <AuthInput label="Phone Number" placeholder="Enter registered number" value={phone} onChange={setPhone} />
                <SubmitButton loading={loading} onClick={sendLoginOtp}>Send 6-Digit OTP</SubmitButton>
              </>
            )}

            {(step === "loginOtpVerify" || step === "signupOtp") && (
              <>
                <div className="text-center bg-amazon-orange/10 p-4 rounded-2xl mb-4">
                    <p className="text-sm font-bold text-amazon-darkBlue">Enter code sent to <span className="underline">{phone}</span></p>
                </div>
                <AuthInput label="OTP" placeholder="XXXXXX" maxLength={6} value={otp} onChange={setOtp} className="text-center tracking-[1em] text-2xl font-black" />
                <SubmitButton loading={loading} onClick={step === "signupOtp" ? verifySignupOtp : verifyLoginOtp}>
                   Verify & Access Dashboard
                </SubmitButton>
              </>
            )}

            {/* SIGNUP */}
            {step === "signup" && (
              <>
                <BackButton onClick={() => setStep("loginPassword")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AuthInput label="Business Name" placeholder="Store name" value={name} onChange={setName} />
                    <AuthInput label="Work Email" placeholder="email@biz.com" value={email} onChange={setEmail} />
                </div>
                <AuthInput label="Phone Number" placeholder="+91" value={phone} onChange={setPhone} />
                <AuthInput label="Create Password" type="password" placeholder="Min 8 characters" value={password} onChange={setPassword} />
                <SubmitButton loading={loading} onClick={signup}>Create Seller Account</SubmitButton>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* SUB-COMPONENTS */

function AuthInput({ label, value, onChange, type = "text", placeholder, className = "", ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText ml-1">{label}</label>
      <input
        {...props}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 transition-all font-bold placeholder:font-medium placeholder:text-gray-300 ${className}`}
      />
    </div>
  );
}

function SubmitButton({ children, onClick, loading }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-amazon-orange/20 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="animate-spin" size={24} /> : children}
    </button>
  );
}

function BackButton({ onClick }: any) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amazon-mutedText hover:text-amazon-orange transition-colors mb-4">
      <ArrowLeft size={16} /> Back
    </button>
  );
}
