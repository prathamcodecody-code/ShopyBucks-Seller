"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import SellerLayout from "@/components/layout/SellerLayout";
import { 
  HiOutlineChartBar, 
  HiOutlineCursorArrowRays, 
  HiOutlineTicket, 
  HiOutlineStar,
  HiOutlineInformationCircle
} from "react-icons/hi2";
import { HiOutlineLightningBolt } from "react-icons/hi";

export default function CampaignAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/seller/campaigns/${id}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Analytics fetch failed", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SellerLayout>
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amazon-orange"></div>
          <p className="text-amazon-mutedText font-black uppercase tracking-widest text-xs">
            Crunching Data...
          </p>
        </div>
      </SellerLayout>
    );
  }

  const { campaign, products, dailyClicks, performance } = data;

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
        
        {/* HEADER */}
        <div className="border-b-4 border-amazon-darkBlue pb-6">
          <h1 className="text-3xl font-black text-amazon-darkBlue uppercase italic tracking-tighter">
            Campaign <span className="text-amazon-orange">Insights</span>
          </h1>
          <p className="text-amazon-mutedText font-bold text-sm uppercase tracking-widest mt-1">
            Analyzing: {campaign.name}
          </p>
        </div>

        {/* CORE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="Total Clicks" value={campaign.totalClicks} icon={<HiOutlineCursorArrowRays />} />
          <Stat label="Credits Spent" value={campaign.spentCredits} icon={<HiOutlineLightningBolt />} />
          <Stat label="Remaining" value={campaign.remainingCredits} icon={<HiOutlineTicket />} />
          <Stat label="Status" value={campaign.status} isStatus />
        </div>

        {/* PERFORMANCE METRICS */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Stat label="Avg CPC" value={`${performance.avgCpc} Credits`} />
            <Stat label="Utilization" value={`${performance.utilization}%`} />
            <Stat 
              label="Exposure Value" 
              value={`₹${performance.exposureValue}`} 
              hint="Estimated visibility value (not actual revenue)"
            />
          </div>
        )}

        {/* BEST PRODUCT HIGHLIGHT */}
        {performance.bestProduct && (
          <div className="bg-amazon-orange/10 border-4 border-amazon-orange p-6 rounded-2xl flex items-center gap-6 shadow-[6px_6px_0px_0px_rgba(255,153,0,1)] animate-in fade-in zoom-in duration-500">
            <div className="bg-amazon-orange p-4 rounded-xl text-amazon-darkBlue">
              <HiOutlineStar size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-amazon-orange uppercase tracking-[0.2em] mb-1">Top Performer</p>
              <h3 className="text-xl font-black text-amazon-darkBlue uppercase italic tracking-tighter">
                {performance.bestProduct.title}
              </h3>
              <p className="text-amazon-mutedText font-bold text-sm mt-1">
                Generated <span className="text-amazon-darkBlue font-black underline decoration-amazon-orange">{performance.bestProduct.clicks} clicks</span> this period.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PRODUCT PERFORMANCE TABLE */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amazon-mutedText">Product Performance</h2>
            <div className="bg-white border-4 border-amazon-darkBlue rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(19,25,33,1)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-amazon-darkBlue text-white">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Product</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Spent</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-amazon-borderGray font-bold text-sm">
                  {products.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-amazon-lightGray transition-colors">
                      <td className="p-4 text-amazon-darkBlue italic uppercase tracking-tighter">{p.title}</td>
                      <td className="p-4 text-center text-amazon-mutedText">{p.spentCredits}</td>
                      <td className="p-4 text-right">
                        <span className="bg-green-100 text-amazon-success px-2 py-1 rounded border border-green-200">
                          {p.remainingCredits}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DAILY CLICKS LIST */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amazon-mutedText">Last 7 Days</h2>
            <div className="bg-white border-4 border-amazon-darkBlue rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(19,25,33,1)]">
              {dailyClicks.length === 0 ? (
                <p className="text-amazon-mutedText font-bold italic py-4 text-center">No traffic recorded</p>
              ) : (
                <ul className="space-y-4">
                  {dailyClicks.map((d: any) => (
                    <li key={d.date} className="flex justify-between items-center pb-2 border-b-2 border-amazon-lightGray last:border-0 last:pb-0">
                      <span className="text-xs font-black text-amazon-mutedText uppercase tracking-tighter">{d.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black italic text-amazon-darkBlue leading-none">{d.clicks}</span>
                        <span className="text-[10px] font-black text-amazon-orange uppercase tracking-widest">Hits</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

/* -------------------------------------------
   REUSABLE STAT COMPONENT
-------------------------------------------- */
function Stat({ label, value, icon, isStatus, hint }: { label: string; value: any; icon?: React.ReactNode; isStatus?: boolean; hint?: string }) {
  return (
    <div className="bg-white border-4 border-amazon-darkBlue p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(19,25,33,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-[0.15em]">{label}</p>
          {hint && (
            <div className="group relative">
              <HiOutlineInformationCircle className="text-amazon-borderGray cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-amazon-darkBlue text-white text-[10px] rounded shadow-xl z-50">
                {hint}
              </div>
            </div>
          )}
        </div>
        {icon && <div className="text-amazon-orange">{icon}</div>}
      </div>
      <p className={`text-2xl font-black italic tracking-tighter uppercase ${
        isStatus && value === "ACTIVE" ? "text-amazon-success" : "text-amazon-darkBlue"
      }`}>
        {value}
      </p>
    </div>
  );
}