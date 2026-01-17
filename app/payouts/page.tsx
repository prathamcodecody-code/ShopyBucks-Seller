"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";

export default function SellerPayoutPage() {
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const [balance, setBalance] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  

  async function loadData() {
  const bank = await api.get("/seller/settings/bank");

if (!bank.data?.isVerified) {
  alert("Your bank details must be verified before requesting payout.");
  return;
}
  
    try {
      const [balRes, payoutRes] = await Promise.all([
        api.get("/seller/payouts/balance"),
        api.get("/seller/payouts"),
      ]);

      setBalance(balRes.data);
      setPayouts(payoutRes.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function requestPayout() {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (Number(amount) > balance.availableBalance) {
      alert("Amount exceeds available balance");
      return;
    }

    try {
      setRequesting(true);
      await api.post("/seller/payouts/request", {
        amount,
        method: "ONLINE",
        note,
      });
      alert("Payout request submitted");
      setAmount("");
      setNote("");
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to request payout");
    } finally {
      setRequesting(false);
    }
  }

  if (loading) {
    return (
      <SellerLayout>
        <p className="py-24 text-center text-gray-500">Loading payouts…</p>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold">Payouts</h1>

        {/* ================= BALANCE ================= */}
        <div className="bg-white border rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Earned</p>
            <p className="text-xl font-bold">₹{balance.totalEarned}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-xl font-bold">₹{balance.totalPaid}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{balance.availableBalance}
            </p>
          </div>
        </div>

        {/* ================= REQUEST PAYOUT ================= */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Request Payout</h2>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full border rounded p-2 mt-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={requesting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Note (optional)</label>
            <textarea
              className="w-full border rounded p-2 mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={requesting}
            />
          </div>

          <button
            onClick={requestPayout}
            disabled={
              requesting || balance.availableBalance <= 0
            }
            className="bg-brandPink text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Request Payout
          </button>

          {balance.availableBalance <= 0 && (
            <p className="text-sm text-red-500">
              No available balance to withdraw
            </p>
          )}
        </div>

        {/* ================= PAYOUT HISTORY ================= */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Payout History</h2>

          {payouts.length === 0 && (
            <p className="text-sm text-gray-500">
              No payout requests yet.
            </p>
          )}

          {payouts.map((p) => (
            <div
              key={p.id}
              className="border-b last:border-b-0 py-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">₹{p.amount}</p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
                {p.note && (
                  <p className="text-xs text-gray-400">
                    Note: {p.note}
                  </p>
                )}
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  p.status === "PAID"
                    ? "bg-green-100 text-green-700"
                    : p.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </SellerLayout>
  );
}
