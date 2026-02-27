"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import SellerLayout from "@/components/layout/SellerLayout";

type SellerWallet = {
  totalCredits: number;
  lockedCredits: number;
};

type SellerProduct = {
  id: number;
  title: string;
  img1?: string | null;
};

type CampaignProductInput = {
  productId: number;
  title: string;
  img?: string | null;
  credits: number;
};

export default function CreateCampaignPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    products: CampaignProductInput[];
  }>({
    name: "",
    products: [],
  });

  /* ================= LOAD WALLET & PRODUCTS ================= */
useEffect(() => {
  (async () => {
    try {
      const [walletRes, productRes] = await Promise.all([
        api.get("/seller/wallet"),
        api.get("/seller/products"),
      ]);

      setWallet(walletRes.data);

      const productList =
        Array.isArray(productRes.data)
          ? productRes.data
          : productRes.data?.products ?? [];

      setProducts(productList);
    } catch (err) {
      console.error("Data fetch failed", err);
      setProducts([]); // prevent crash
    }
  })();
}, []);

  const availableCredits = (wallet?.totalCredits ?? 0) - (wallet?.lockedCredits ?? 0);
  const totalAllocatedCredits = form.products.reduce((sum, p) => sum + p.credits, 0);

  /* ================= PRODUCT TOGGLE ================= */
  const toggleProduct = (p: SellerProduct) => {
    const exists = form.products.find((x) => x.productId === p.id);
    if (exists) {
      setForm({
        ...form,
        products: form.products.filter((x) => x.productId !== p.id),
      });
    } else {
      setForm({
        ...form,
        products: [
          ...form.products,
          {
            productId: p.id,
            title: p.title,
            img: p.img1 ?? null,
            credits: 1,
          },
        ],
      });
    }
  };

  /* ================= SUBMIT ================= */
  const submitCampaign = async () => {
    try {
      setLoading(true);
      const res = await api.post("/seller/campaigns", {
        name: form.name,
        products: form.products.map((p) => ({
          productId: p.productId,
          credits: p.credits,
        })),
      });

      await api.post(`/seller/campaigns/${res.data.id}/submit`);
      router.push("/campaigns");
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const StepLabel = ({ num, label }: { num: number; label: string }) => (
    <div className={`flex items-center gap-2 ${step === num ? "text-amazon-orange" : "text-amazon-mutedText"}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === num ? "bg-amazon-orange text-amazon-darkBlue" : "bg-amazon-borderGray"}`}>
        {num}
      </span>
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </div>
  );

  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto p-6 text-amazon-text">
        <h1 className="text-2xl font-bold text-amazon-darkBlue mb-6">Create New Campaign</h1>

        {/* STEPPER */}
        <div className="flex justify-between items-center mb-8 border-b border-amazon-borderGray pb-4">
          <StepLabel num={1} label="Basic Info" />
          <StepLabel num={2} label="Products" />
          <StepLabel num={3} label="Allocation" />
          <StepLabel num={4} label="Review" />
        </div>

        {/* WALLET MINI-CARD */}
        <div className="bg-amazon-lightGray border border-amazon-borderGray rounded-md p-4 mb-8 flex justify-between items-center">
          <span className="text-sm font-medium">Available Balance:</span>
          <span className="text-lg font-bold text-amazon-navy">{availableCredits} Credits</span>
        </div>

        {/* STEP 1: NAME */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-amazon-navy mb-2">Campaign Name</label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Electronics Blowout"
                className="w-full border border-amazon-borderGray rounded px-3 py-2 focus:ring-1 focus:ring-amazon-orange outline-none transition-all"
              />
            </div>
            <button
              disabled={!form.name.trim()}
              onClick={() => setStep(2)}
              className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold py-2 rounded-md shadow-sm disabled:opacity-50"
            >
              Select Products
            </button>
          </div>
        )}

        {/* STEP 2: SELECT */}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-amazon-navy mb-4">Select Products for Campaign</h2>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
              {products.map((p) => {
                const selected = form.products.some((x) => x.productId === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p)}
                    className={`flex justify-between items-center border rounded-md p-4 cursor-pointer transition-colors ${
                      selected ? "border-amazon-orange bg-orange-50" : "border-amazon-borderGray hover:bg-amazon-lightGray"
                    }`}
                  >
                    <span className="font-medium">{p.title}</span>
                    <input type="checkbox" checked={selected} readOnly className="accent-amazon-orange h-5 w-5" />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 border border-amazon-borderGray font-medium py-2 rounded-md hover:bg-amazon-lightGray">
                Back
              </button>
              <button
                disabled={form.products.length === 0}
                onClick={() => setStep(3)}
                className="flex-1 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold py-2 rounded-md disabled:opacity-50"
              >
                Next: Allocate Credits
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ALLOCATE */}
        {step === 3 && (
          <div>
            <h2 className="font-bold text-amazon-navy mb-4">Allocate Credits per Product</h2>
            <div className="space-y-3">
              {form.products.map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-4 bg-white border border-amazon-borderGray p-3 rounded-md">
                  <span className="flex-1 text-sm font-medium truncate">{p.title}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={p.credits}
                      onChange={(e) => {
                        const updated = [...form.products];
                        updated[idx].credits = Math.max(1, Number(e.target.value));
                        setForm({ ...form, products: updated });
                      }}
                      className="w-24 border border-amazon-borderGray rounded px-2 py-1 focus:ring-1 focus:ring-amazon-orange outline-none"
                    />
                    <span className="text-xs text-amazon-mutedText font-bold">Credits</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 border-t border-amazon-borderGray">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Total Allocation:</span>
                <span className={`font-bold ${totalAllocatedCredits > availableCredits ? "text-amazon-danger" : "text-amazon-navy"}`}>
                  {totalAllocatedCredits} / {availableCredits}
                </span>
              </div>
              {totalAllocatedCredits > availableCredits && (
                <p className="text-amazon-danger text-xs text-right">Error: Insufficient credits available</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-amazon-borderGray font-medium py-2 rounded-md hover:bg-amazon-lightGray">
                Back
              </button>
              <button
                disabled={totalAllocatedCredits === 0 || totalAllocatedCredits > availableCredits}
                onClick={() => setStep(4)}
                className="flex-1 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold py-2 rounded-md disabled:opacity-50"
              >
                Review Campaign
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <div>
            <h2 className="font-bold text-amazon-navy mb-4 border-b pb-2">Final Review</h2>
            <div className="bg-amazon-lightGray p-4 rounded-lg space-y-4">
              <div>
                <p className="text-xs uppercase text-amazon-mutedText font-bold">Campaign Name</p>
                <p className="text-lg font-bold">{form.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amazon-mutedText font-bold mb-2">Product Distribution</p>
                <ul className="space-y-1">
                  {form.products.map((p) => (
                    <li key={p.productId} className="flex justify-between text-sm">
                      <span>{p.title}</span>
                      <span className="font-bold">{p.credits} Credits</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-amazon-borderGray flex justify-between">
                <span className="font-bold">Total Credits:</span>
                <span className="font-bold text-amazon-orange text-lg">{totalAllocatedCredits}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-amazon-orange/30 p-4 mt-6 rounded text-sm text-amazon-navy flex gap-3">
              <span className="text-xl">ℹ️</span>
              <p>Your campaign will be submitted for internal review. It usually takes 24-48 hours for a campaign to go live.</p>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(3)} className="flex-1 border border-amazon-borderGray font-medium py-2 rounded-md hover:bg-amazon-lightGray">
                Back
              </button>
              <button
                disabled={loading}
                onClick={submitCampaign}
                className="flex-1 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-extrabold py-2 rounded-md shadow-md"
              >
                {loading ? "Processing..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}