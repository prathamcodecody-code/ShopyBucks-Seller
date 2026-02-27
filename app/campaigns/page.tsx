"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SellerLayout from "@/components/layout/SellerLayout";

type CampaignProduct = {
  productId: number;
  allocatedCredits: number;
  remainingCredits: number;
  product: {
    id: number;
    title: string;
  };
};

type Campaign = {
  id: number;
  name: string;
  status: string;
  totalCredits: number;
  createdAt: string;
  products: CampaignProduct[];
};

export default function SellerCampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/campaigns");
      setCampaigns(res.data);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  /* ================= ACTIONS ================= */

  const pauseCampaign = async (id: number) => {
    setActionLoading(id);
    await api.post(`/seller/campaigns/${id}/pause`);
    await loadCampaigns();
    setActionLoading(null);
  };

  const resumeCampaign = async (id: number) => {
    setActionLoading(id);
    await api.post(`/seller/campaigns/${id}/resume`);
    await loadCampaigns();
    setActionLoading(null);
  };

  const cancelCampaign = async (id: number) => {
    const ok = confirm("Cancel this campaign? Remaining credits will be refunded.");
    if (!ok) return;

    setActionLoading(id);
    await api.delete(`/seller/campaigns/${id}`);
    await loadCampaigns();
    setActionLoading(null);
  };

  /* ================= HELPERS ================= */

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-amazon-success", // Using your success color
      PAUSED: "bg-amazon-lightGray text-amazon-mutedText",
      COMPLETED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-amazon-danger", // Using your danger color
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border ${map[status] ?? "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="p-6 text-amazon-mutedText">Loading campaigns...</div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto p-6 text-amazon-text">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amazon-darkBlue">My Campaigns</h1>
          <a
            href="/campaigns/create"
            className="bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            + Create Campaign
          </a>
        </div>

        {campaigns.length === 0 ? (
          <div className="border border-amazon-borderGray rounded-lg p-10 text-center bg-white">
            <p className="text-amazon-mutedText text-lg">No campaigns found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => {
              const spentCredits = c.products.reduce(
                (sum, p) => sum + (p.allocatedCredits - p.remainingCredits),
                0
              );

              return (
                <div
                  key={c.id}
                  className="bg-white border border-amazon-borderGray rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {/* HEADER */}
                  <div className="bg-amazon-lightGray p-4 flex justify-between items-center border-b border-amazon-borderGray">
                    <div>
                      <h2 className="font-bold text-lg text-amazon-navy">{c.name}</h2>
                      <p className="text-xs text-amazon-mutedText">
                        Created: {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {statusBadge(c.status)}
                  </div>

                  {/* BODY */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4 border-b border-amazon-borderGray pb-4">
                      <div>
                        <p className="text-xs uppercase text-amazon-mutedText font-semibold">Total</p>
                        <p className="text-lg font-bold">{c.totalCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-amazon-mutedText font-semibold">Spent</p>
                        <p className="text-lg font-bold text-amazon-success">{spentCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-amazon-mutedText font-semibold">Remaining</p>
                        <p className="text-lg font-bold text-amazon-orange">
                          {c.totalCredits - spentCredits}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-bold text-amazon-navy mb-2">Targeted Products</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {c.products.map((p) => (
                          <li key={p.productId} className="text-sm border-l-2 border-amazon-orange pl-2">
                            <span className="font-medium">{p.product.title}</span>
                            <span className="block text-xs text-amazon-mutedText">
                              {p.remainingCredits} / {p.allocatedCredits} credits remaining
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">
                      {c.status === "ACTIVE" && (
                        <button
                          onClick={() => pauseCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="px-4 py-1.5 border border-amazon-borderGray rounded text-sm font-medium hover:bg-amazon-lightGray disabled:opacity-50"
                        >
                          Pause
                        </button>
                      )}

                      {c.status === "PAUSED" && (
                        <button
                          onClick={() => resumeCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="px-4 py-1.5 border border-amazon-borderGray rounded text-sm font-medium hover:bg-amazon-lightGray disabled:opacity-50"
                        >
                          Resume
                        </button>
                      )}

                      {(c.status === "ACTIVE" || c.status === "PAUSED" || c.status === "PENDING") && (
                        <button
                          onClick={() => cancelCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="px-4 py-1.5 text-amazon-danger border border-amazon-danger/20 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}