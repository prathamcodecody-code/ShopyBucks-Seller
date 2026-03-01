"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SellerLayout from "@/components/layout/SellerLayout";
import { 
  HiOutlinePlus, 
  HiOutlineChartBar, 
  HiOutlinePause, 
  HiOutlinePlay, 
  HiOutlineTrash,
  HiOutlineCalendar
} from "react-icons/hi2";

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
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACTIVE: "bg-green-50 text-amazon-success border-green-200",
      PAUSED: "bg-amazon-lightGray text-amazon-mutedText border-amazon-borderGray",
      COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
      REJECTED: "bg-red-50 text-amazon-danger border-amazon-danger/30",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${map[status] ?? "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amazon-orange"></div>
          <p className="text-amazon-mutedText font-black uppercase tracking-widest text-xs">Loading Campaigns...</p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-amazon-darkBlue pb-8">
          <div>
            <h1 className="text-3xl font-black text-amazon-darkBlue uppercase italic tracking-tighter">
              Marketing <span className="text-amazon-orange">Campaigns</span>
            </h1>
            <p className="text-amazon-mutedText font-bold text-sm uppercase tracking-widest mt-1">
              Boost your product visibility on ShopyBucks
            </p>
          </div>
          
          <a
            href="/campaigns/create"
            className="flex items-center justify-center gap-2 bg-amazon-orange border-2 border-amazon-darkBlue px-6 py-3 rounded-xl font-black text-amazon-darkBlue uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <HiOutlinePlus strokeWidth={3} />
            Create Campaign
          </a>
        </div>

        {campaigns.length === 0 ? (
          <div className="border-4 border-dashed border-amazon-borderGray rounded-2xl p-20 text-center bg-white/50">
            <p className="text-amazon-mutedText font-black uppercase italic tracking-widest">No active campaigns found.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {campaigns.map((c) => {
              const spentCredits = c.products.reduce(
                (sum, p) => sum + (p.allocatedCredits - p.remainingCredits),
                0
              );

              return (
                <div
                  key={c.id}
                  className="bg-white border-4 border-amazon-darkBlue rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(19,25,33,1)] transition-all"
                >
                  {/* CARD HEADER */}
                  <div className="bg-amazon-lightGray p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-amazon-darkBlue">
                    <div className="flex items-center gap-4">
                      <div className="bg-amazon-darkBlue p-3 rounded-xl text-amazon-orange">
                        <HiOutlineCalendar size={24} />
                      </div>
                      <div>
                        <h2 className="font-black text-xl text-amazon-darkBlue uppercase italic tracking-tighter">{c.name}</h2>
                        <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest">
                          ID: #SB-CP-{c.id} • {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {statusBadge(c.status)}
                  </div>

                  {/* CARD BODY */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-amazon-lightGray/50 p-4 rounded-xl border-2 border-amazon-borderGray">
                        <p className="text-[10px] uppercase text-amazon-mutedText font-black tracking-widest mb-1">Total Budget</p>
                        <p className="text-2xl font-black text-amazon-darkBlue italic tracking-tighter">{c.totalCredits} <span className="text-xs not-italic">Credits</span></p>
                      </div>
                      <div className="bg-green-50/50 p-4 rounded-xl border-2 border-green-100">
                        <p className="text-[10px] uppercase text-green-700 font-black tracking-widest mb-1">Credits Consumed</p>
                        <p className="text-2xl font-black text-amazon-success italic tracking-tighter">{spentCredits}</p>
                      </div>
                      <div className="bg-orange-50/50 p-4 rounded-xl border-2 border-amazon-orange/20">
                        <p className="text-[10px] uppercase text-amazon-orange font-black tracking-widest mb-1">Available Balance</p>
                        <p className="text-2xl font-black text-amazon-orange italic tracking-tighter">
                          {c.totalCredits - spentCredits}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-black text-amazon-darkBlue uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amazon-orange rounded-full" />
                        Targeted Inventory
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {c.products.map((p) => (
                          <div key={p.productId} className="bg-white border-2 border-amazon-borderGray p-3 rounded-xl flex justify-between items-center group hover:border-amazon-darkBlue transition-colors">
                            <span className="font-bold text-sm text-amazon-darkBlue truncate pr-4">{p.product.title}</span>
                            <span className="shrink-0 text-[10px] font-black bg-amazon-lightGray px-2 py-1 rounded border border-amazon-borderGray uppercase tracking-tighter">
                              {p.remainingCredits} LEFT
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-amazon-lightGray">
                      {(c.status === "ACTIVE" || c.status === "PAUSED" || c.status === "COMPLETED") && (
                        <a
                          href={`/campaigns/${c.id}/analytics`}
                          className="flex items-center gap-2 px-6 py-2 bg-amazon-darkBlue text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amazon-navy transition-all shadow-[3px_3px_0px_0px_rgba(255,153,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                          <HiOutlineChartBar size={16} /> Analytics
                        </a>
                      )}

                      {c.status === "ACTIVE" && (
                        <button
                          onClick={() => pauseCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="flex items-center gap-2 px-6 py-2 border-2 border-amazon-darkBlue text-amazon-darkBlue text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amazon-lightGray disabled:opacity-50 transition-all"
                        >
                          <HiOutlinePause size={16} /> Pause
                        </button>
                      )}

                      {c.status === "PAUSED" && (
                        <button
                          onClick={() => resumeCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="flex items-center gap-2 px-6 py-2 bg-amazon-success text-white text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-amazon-darkBlue shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          <HiOutlinePlay size={16} /> Resume
                        </button>
                      )}

                      {(c.status === "ACTIVE" || c.status === "PAUSED" || c.status === "PENDING") && (
                        <button
                          onClick={() => cancelCampaign(c.id)}
                          disabled={actionLoading === c.id}
                          className="flex items-center gap-2 px-6 py-2 text-amazon-danger border-2 border-amazon-danger/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-amazon-danger disabled:opacity-50 transition-all ml-auto"
                        >
                          <HiOutlineTrash size={16} /> Cancel Campaign
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
