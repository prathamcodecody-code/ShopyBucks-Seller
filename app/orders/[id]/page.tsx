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
  Printer,
  Download
} from "lucide-react";

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
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

  const downloadInvoice = async (sellerOrderId: number) => {
    try {
      const res = await api.get(
        `/api/seller/invoice/${sellerOrderId}`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${sellerOrderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed", err);
      alert("Failed to download invoice");
    }
  };

  const downloadShippingLabel = async (sellerOrderId: number) => {
    try {
      const res = await api.get(
        `/api/seller/shipping-label/${sellerOrderId}`,
        { responseType: "blob" }
      );

      // Validate content-type
      if (res.headers["content-type"] !== "application/pdf") {
        const text = await res.data.text();
        throw new Error(text || "Invalid response");
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `shipping-label-${sellerOrderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Shipping label download failed", err);
      alert(
        err?.response?.data?.message ||
          "Failed to download shipping label"
      );
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/seller/orders/${id}`);
      
      console.log("📦 Seller Order Data:", res.data);
      
      // ✅ Store the full order object
      setOrder(res.data);
      
      // ✅ Extract items
      setItems(res.data.items || []);
      
      // ✅ Parse address properly
      const orderAddress = res.data.order?.address;
      if (orderAddress && typeof orderAddress === 'object') {
        setAddress(orderAddress);
      } else {
        setAddress(null);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const updateItemStatus = async (itemId: number, status: string) => {
    try {
      await api.patch(`/seller/orders/item/${itemId}/status`, { status });
      fetchOrder();
    } catch (err) {
      console.error("Failed to update status:", err);
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

  if (!order) return (
    <SellerLayout>
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-amazon-mutedText mb-4">Order not found</p>
        <button 
          onClick={() => router.back()}
          className="text-amazon-orange font-bold"
        >
          Go Back
        </button>
      </div>
    </SellerLayout>
  );

  // ✅ Calculate correct totals
  const itemsSubtotal = items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const quantity = Number(item.quantity || 0);
    return sum + (unitPrice * quantity);
  }, 0);

  const shippingCharge = Number(order.shippingCharge || 0);
  const totalAmount = Number(order.totalAmount || 0);

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
              <p className="text-sm text-amazon-mutedText">
                Status: <span className="font-bold text-amazon-orange uppercase">{order.status}</span>
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => downloadInvoice(Number(id))}
              className="flex items-center gap-2 px-4 py-2 border border-amazon-borderGray rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-all"
            >
              <Printer size={16} /> Invoice
            </button>
            
            <button 
              onClick={() => downloadShippingLabel(Number(id))}
              className="flex items-center gap-2 px-4 py-2 bg-amazon-orange text-white rounded-lg text-sm font-bold hover:bg-amazon-orangeHover shadow-sm transition-all"
            >
              <Download size={16} /> Shipping Label
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT: ITEMS LIST --- */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-amazon-orange" />
                  <h2 className="font-bold text-sm uppercase tracking-wider text-amazon-text">Ordered Items</h2>
                </div>
                <span className="text-xs font-bold text-amazon-mutedText">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              
              <div className="divide-y divide-amazon-borderGray">
                {items.map((item) => {
                  const unitPrice = Number(item.unitPrice || item.price || 0);
                  const quantity = Number(item.quantity || 0);
                  const lineTotal = unitPrice * quantity;
                  
                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-4 flex-1">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product?.img1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-amazon-borderGray"
                            alt={item.product?.title}
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-amazon-text leading-tight">
                              {item.product?.title}
                            </h3>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-amazon-mutedText">
                                Unit Price: <span className="font-bold text-amazon-text">₹{unitPrice.toFixed(2)}</span>
                              </p>
                              <p className="text-sm text-amazon-mutedText">
                                Quantity: <span className="font-bold text-amazon-text">{quantity}</span>
                              </p>
                              <p className="text-sm text-amazon-mutedText">
                                Subtotal: <span className="font-bold text-amazon-orange">₹{lineTotal.toFixed(2)}</span>
                              </p>
                            </div>
                      
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[180px]">
                         
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- RIGHT: CUSTOMER & SHIPPING --- */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <MapPin size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-amazon-text">Shipping To</h2>
              </div>
              <div className="p-5">
                {address ? (
                  <div className="space-y-3">
                    <p className="font-bold text-amazon-text text-base">
                      {address.fullName || address.name || "Customer"}
                    </p>
                    <div className="text-sm text-amazon-mutedText leading-relaxed">
                      {address.addressLine1}<br />
                      {address.addressLine2 && <>{address.addressLine2}<br /></>}
                      {address.city}, {address.state}<br />
                      <span className="font-bold text-amazon-text">{address.pincode}</span>
                    </div>
                    <div className="pt-3 border-t border-amazon-borderGray">
                      <p className="text-xs font-bold text-amazon-mutedText uppercase mb-1">Contact</p>
                      <p className="text-sm font-medium text-amazon-text">{address.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amazon-mutedText italic">Address information unavailable.</p>
                )}
              </div>
            </section>

            {/* Payment Method */}
            {order.order?.paymentMethod && (
              <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amazon-mutedText mb-3">
                  Payment Method
                </h3>
                <p className="text-lg font-bold text-amazon-orange">
                  {order.order.paymentMethod}
                </p>
                {order.order.paymentMethod === "COD" && (
                  <p className="text-xs text-amazon-mutedText mt-1">
                    Collect ₹{totalAmount.toFixed(2)} on delivery
                  </p>
                )}
              </section>
            )}

            {/* Order Summary */}
            <section className="bg-amazon-darkBlue text-white rounded-xl p-6 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Items Subtotal</span>
                  <span className="font-bold">₹{itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Shipping Charge</span>
                  {shippingCharge > 0 ? (
                    <span className="font-bold">₹{shippingCharge.toFixed(2)}</span>
                  ) : (
                    <span className="text-amazon-success font-bold">FREE</span>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-700 flex justify-between items-baseline">
                  <span className="font-bold text-base">Total Amount</span>
                  <span className="text-2xl font-black text-amazon-orange">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Shipment Tracking (if available) */}
            {order.shipment?.trackingId && (
              <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={18} className="text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-900">
                    Shipment Tracking
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-700 font-bold">Tracking ID</p>
                    <p className="text-sm font-mono font-bold text-blue-900">
                      {order.shipment.trackingId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 font-bold">Courier</p>
                    <p className="text-sm font-bold text-blue-900">
                      {order.shipment.courier}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
