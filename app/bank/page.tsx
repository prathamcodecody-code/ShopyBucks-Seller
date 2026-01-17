"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";

export default function SellerBankSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bank, setBank] = useState<any>(null);

  const [form, setForm] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  const isVerified = bank?.isVerified;

  async function fetchBankDetails() {
    try {
      const res = await api.get("/seller/settings/bank");
      setBank(res.data);

      if (res.data) {
        setForm({
          accountHolder: res.data.accountHolder || "",
          accountNumber: res.data.accountNumber || "",
          ifscCode: res.data.ifscCode || "",
          bankName: res.data.bankName || "",
          upiId: res.data.upiId || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBankDetails();
  }, []);

  async function submit() {
    try {
      setSaving(true);
      await api.put("/seller/settings/bank", form);
      alert("Bank details saved. Verification pending.");
      fetchBankDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SellerLayout>
        <p className="py-20 text-center text-gray-500">
          Loading bank details…
        </p>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">Bank Details</h1>

        {/* STATUS */}
        {bank && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              bank.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {bank.isVerified
              ? "Bank details verified"
              : "Bank details not verified"}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white border rounded-xl p-6 space-y-4">

          <div>
            <label className="text-sm font-medium">Account Holder Name</label>
            <input
              className="w-full border p-2 rounded mt-1"
              disabled={isVerified}
              value={form.accountHolder}
              onChange={(e) =>
                setForm({ ...form, accountHolder: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Account Number</label>
            <input
              className="w-full border p-2 rounded mt-1"
              disabled={isVerified}
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">IFSC Code</label>
            <input
              className="w-full border p-2 rounded mt-1"
              disabled={isVerified}
              value={form.ifscCode}
              onChange={(e) =>
                setForm({ ...form, ifscCode: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bank Name</label>
            <input
              className="w-full border p-2 rounded mt-1"
              disabled={isVerified}
              value={form.bankName}
              onChange={(e) =>
                setForm({ ...form, bankName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              UPI ID (optional)
            </label>
            <input
              className="w-full border p-2 rounded mt-1"
              disabled={isVerified}
              value={form.upiId}
              onChange={(e) =>
                setForm({ ...form, upiId: e.target.value })
              }
            />
          </div>

          {bank?.isVerified ? (
            <p className="text-green-600 font-semibold">
                    ✅ Bank details verified
                        </p>
                                ) : (
                        <button
                        onClick={submit}
                className="bg-brandPink text-white px-4 py-2 rounded"
                >
    {bank?.rejectedReason ? "Re-Apply Bank Details" : "Save Bank Details"}
  </button>
)}
          {!bank.isVerified && bank.rejectedReason && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
    <b>Bank Details Rejected:</b> {bank.rejectedReason}
  </div>
)}
        </div>
      </div>
    </SellerLayout>
  );
}
