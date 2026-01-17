"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Printer
} from "lucide-react";

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const allowedTransitions: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

  const fetchOrder = async () => {
  try {
    const res = await api.get(`/seller/orders/${id}`);

    setItems(res.data.items);
    setAddress(res.data.order?.address ?? null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrder();
  }, []);

  const updateItemStatus = async (itemId: number, status: string) => {
    try {
      await api.patch(`/seller/orders/item/${itemId}/status`, { status });
      fetchOrder();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return (
    <SellerLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
      </div>
    </SellerLayout>
  );

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amazon-text">Order #{id}</h1>
              <p className="text-sm text-amazon-mutedText">Manage fulfillment and shipping status</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-amazon-borderGray rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm">
            <Printer size={16} /> Print Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT: ITEMS LIST --- */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <Package size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-amazon-text">Ordered Items</h2>
              </div>
              
              <div className="divide-y divide-amazon-borderGray">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-amazon-borderGray"
                          alt={item.product.title}
                        />
                        <div>
                          <h3 className="font-bold text-amazon-text leading-tight">{item.product.title}</h3>
                          <p className="text-sm text-amazon-mutedText mt-1">
                            Price: ₹{item.price} | Qty: <span className="text-amazon-text font-medium">{item.quantity}</span>
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-amazon-text rounded text-[10px] font-bold uppercase border">
                            Status: {item.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <label className="text-[10px] font-bold text-amazon-mutedText uppercase">Update Status</label>
                        <select
                          className="w-full border border-amazon-borderGray p-2 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amazon-orange outline-none"
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, e.target.value)}
                        >
                          {[item.status, ...(allowedTransitions[item.status] || [])].map(
    (s) => (
      <option key={s} value={s}>{s}</option>
    )
  )}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT: CUSTOMER & SHIPPING --- */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <MapPin size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-amazon-text">Shipping To</h2>
              </div>
              <div className="p-5">
                {address ? (
                  <div className="space-y-3">
                    <p className="font-bold text-amazon-text">{address.name}</p>
                    <div className="text-sm text-amazon-mutedText leading-relaxed">
                      {address.addressLine},<br />
                      {address.city}, {address.state}<br />
                      <span className="font-bold text-amazon-text">{address.pincode}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs font-bold text-amazon-mutedText uppercase mb-1">Contact</p>
                      <p className="text-sm font-medium">{address.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amazon-mutedText italic">Address information unavailable.</p>
                )}
              </div>
            </section>

            <section className="bg-amazon-darkBlue text-white rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Fulfillment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>₹{items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-amazon-success font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-700 flex justify-between items-baseline">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-amazon-orange">
                    ₹{items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}