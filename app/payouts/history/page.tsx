"use client";

import SellerLayout from "@/components/layout/SellerLayout";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  FileText 
} from "lucide-react";

export default function SellerPayoutHistoryPage() {
  const router = useRouter();

  const history = [
    {
      date: "15 Feb 2026",
      amount: 5800,
      status: "PAID",
      ref: "RPY_784512",
      account: "HDFC ****4920",
    },
    {
      date: "08 Feb 2026",
      amount: 6650,
      status: "PAID",
      ref: "RPY_784200",
      account: "HDFC ****4920",
    },
    {
      date: "01 Feb 2026",
      amount: 4200,
      status: "PAID",
      ref: "RPY_783110",
      account: "HDFC ****4920",
    },
  ];

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-amazon-borderGray"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amazon-text">Payout History</h1>
              <p className="text-sm text-amazon-mutedText">Track all bank transfers and download tax settlements.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-amazon-borderGray rounded-lg hover:bg-gray-50 shadow-sm transition-all">
            <FileText size={16} /> Export Yearly Report
          </button>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search by Reference ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-amazon-borderGray rounded-xl focus:ring-1 focus:ring-amazon-orange outline-none shadow-sm"
          />
        </div>

        {/* --- HISTORY TABLE --- */}
        <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-amazon-borderGray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Settlement Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Bank Account</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Reference ID</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amazon-borderGray">
                {history.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-amazon-text">
                      {p.date}
                    </td>
                    <td className="px-6 py-4 text-amazon-mutedText">
                      {p.account}
                    </td>
                    <td className="px-6 py-4 font-bold text-amazon-text">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-amazon-success border border-green-200">
                        <CheckCircle2 size={12} /> {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-[11px] bg-gray-100 px-2 py-1 rounded text-amazon-mutedText">
                        {p.ref}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-2 text-amazon-mutedText hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <ExternalLink size={18} className="text-blue-600" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Payments are usually reflected in your bank account within **2-3 business days** of the settlement date. 
            If you haven't received your funds, please contact <span className="underline font-bold cursor-pointer">Support</span>.
          </p>
        </div>

      </div>
    </SellerLayout>
  );
}