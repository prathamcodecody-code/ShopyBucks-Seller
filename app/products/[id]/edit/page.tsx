"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Upload, X, Globe, Package, Trash2, Plus, Layers, 
  IndianRupee, BarChart3, Save, Calendar, Scale, ChevronRight, Info, Truck
} from "lucide-react";

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SEASONS = ["Summer", "Winter", "Spring", "Autumn", "All Season"];
const OCCASIONS = ["Casual", "Formal", "Party", "Festive", "Wedding", "Sports"];

type Variant = {
  id?: number;
  color: string;
  size: string;
  sku?: string;
  price?: number;
  stock: number;
  images: (File | string | null)[]; // Can be URL string or new File
};

export default function SellerEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = Number(id);

  const [loading, setLoading] = useState(true);

  // BASIC STATES
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); 
  const [sku, setSku] = useState("");
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");
  const [weight, setWeight] = useState("");

  // FINANCIAL STATES
  const [discountType, setDiscountType] = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
  const [commissionPct, setCommissionPct] = useState("10");

  // MEDIA & VARIANTS
  const [images, setImages] = useState<(File | string | null)[]>([null, null, null, null]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    api.get(`/seller/products/${productId}`).then((res) => {
      const p = res.data;
      setTitle(p.title || "");
      setDescription(p.description || "");
      setPrice(String(p.price || ""));
      setSku(p.sku || "");
      setWeight(String(p.weight || ""));
      setSeason(p.seasonTags?.[0] || "");
      setOccasion(p.occasionTags?.[0] || "");
      setDiscountType(p.discountType || "");
      setDiscountValue(String(p.discountValue || ""));
      setGstPercent(String(p.gstPercent || "18"));
      setMetaTitle(p.metaTitle || "");
      setSlug(p.slug || "");
      
      // Load Main Images (Existing URLs)
      setImages([p.image1, p.image2, p.image3, p.image4]);

      // Load Variants
      if (p.variants) {
        setVariants(p.variants.map((v: any) => ({
          id: v.id,
          color: v.color,
          size: v.size,
          sku: v.sku,
          stock: v.stock,
          price: v.price,
          images: [v.image1, v.image2, v.image3, v.image4]
        })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  // CALCULATIONS (Same as Create Page)
  const sPrice = Number(price) || 0;
  const dValue = Number(discountValue) || 0;
  const itemWeight = Number(weight) || 0;
  let mrp = sPrice;
  if (discountType === "PERCENT" && dValue > 0) mrp = Math.round(sPrice / (1 - dValue / 100));
  if (discountType === "FLAT" && dValue > 0) mrp = sPrice + dValue;
  const estimatedShipping = itemWeight > 0 ? Math.ceil(itemWeight / 500) * 65 : 0;
  const commissionAmt = (sPrice * Number(commissionPct)) / 100;
  const gstAmt = (sPrice * Number(gstPercent)) / 100;
  const netProfit = sPrice - (commissionAmt + gstAmt + estimatedShipping);

  const updateProduct = async () => {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("price", price);
      fd.append("weight", weight);
      fd.append("mrp", mrp.toString());
      fd.append("gstPercent", gstPercent);
      fd.append("discountType", discountType);
      fd.append("discountValue", dValue.toString());
      if (season) fd.append("seasonTags", JSON.stringify([season]));
      if (occasion) fd.append("occasionTags", JSON.stringify([occasion]));

      // Main Images Handling
      images.forEach((img, i) => {
        if (img instanceof File) fd.append(`image${i + 1}`, img);
        else if (typeof img === 'string') fd.append(`existing_image${i + 1}`, img);
      });

      // Variants Handling
      fd.append("variants", JSON.stringify(variants.map(v => ({
        id: v.id,
        color: v.color,
        size: v.size,
        stock: v.stock,
        price: v.price || sPrice,
      }))));

      await api.patch(`/seller/products/${productId}`, fd);
      router.push("/products");
    } catch (err) {
      alert("Failed to update product");
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;

  return (
    <SellerLayout>
      <div className="max-w-[1400px] mx-auto pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pt-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-amazon-mutedText hover:text-amazon-text font-bold text-sm">
            <ArrowLeft size={16}/> Back
          </button>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={updateProduct} className="flex-1 md:flex-none px-10 py-2.5 font-black bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Update Listing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20}/></div>
                <h2 className="text-xl font-black">Edit Information</h2>
              </div>
              <div className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl font-bold outline-none" placeholder="Product Title" />
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl font-medium outline-none" placeholder="Description" />
              </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6">
              <div className="flex items-center gap-3 pb-4 border-b mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20}/></div>
                <h2 className="text-xl font-black">Pricing & Logistics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 border-2 p-3 rounded-xl font-black text-lg" placeholder="Price" />
                    <div className="relative">
                      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-gray-50 border-2 p-3 rounded-xl font-bold" placeholder="Grams" />
                      <Scale className="absolute right-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <select value={gstPercent} onChange={e => setGstPercent(e.target.value)} className="w-full bg-gray-50 border-2 p-3 rounded-xl font-bold">
                    <option value="5">5% (Essentials)</option>
                    <option value="12">12% (Standard)</option>
                    <option value="18">18% (Services/Electronics)</option>
                    <option value="28">28% (Luxury)</option>
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full bg-gray-50 border-2 p-3 rounded-xl font-bold">
                      <option value="">No Discount</option>
                      <option value="PERCENT">Percent (%)</option>
                      <option value="FLAT">Flat (₹)</option>
                    </select>
                    {discountType && <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-gray-50 border-2 p-3 rounded-xl font-bold" />}
                  </div>
                </div>

                {/* Profit Preview */}
                <div className="bg-amazon-darkBlue rounded-2xl p-6 text-white space-y-4 shadow-xl">
                   <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-black uppercase text-amazon-orange">Net Earnings</span>
                    <span className="text-2xl font-black text-amazon-success">₹{netProfit.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 text-sm opacity-80">
                    <div className="flex justify-between"><span>MRP</span><span>₹{mrp}</span></div>
                    <div className="flex justify-between"><span>GST</span><span>-₹{gstAmt.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping Idea</span><span>-₹{estimatedShipping}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-xl font-black">Manage Variants</h2>
                <button onClick={() => setVariants([...variants, { color: "", size: "", stock: 0, images: [null, null, null, null] }])} className="px-4 py-2 bg-amazon-darkBlue text-white text-xs font-black rounded-lg"><Plus size={14} className="inline mr-1"/> Add Variant</button>
              </div>
              <div className="space-y-6">
                {variants.map((v, idx) => (
                  <div key={idx} className="bg-gray-50/50 border-2 rounded-2xl p-5 relative">
                    <button onClick={() => setVariants(variants.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white border p-1.5 rounded-full text-red-500 shadow-sm"><Trash2 size={14}/></button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <input value={v.color} onChange={e => { const c = [...variants]; c[idx].color = e.target.value; setVariants(c); }} className="p-2.5 rounded-lg border font-bold text-sm bg-white" placeholder="Color" />
                      <select value={v.size} onChange={e => { const c = [...variants]; c[idx].size = e.target.value; setVariants(c); }} className="p-2.5 rounded-lg border font-bold text-sm bg-white">
                        <option value="">Size</option>
                        {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="number" value={v.stock} onChange={e => { const c = [...variants]; c[idx].stock = Number(e.target.value); setVariants(c); }} className="p-2.5 rounded-lg border font-bold text-sm bg-white" placeholder="Stock" />
                      <input type="number" value={v.price || ""} onChange={e => { const c = [...variants]; c[idx].price = Number(e.target.value); setVariants(c); }} className="p-2.5 rounded-lg border font-bold text-sm bg-white" placeholder={`₹${price}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 space-y-4">
              <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest"><Layers size={16} className="text-amazon-orange"/> Style Tags</h3>
              <select value={season} onChange={e => setSeason(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                <option value="">Select Season</option>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                <option value="">Select Occasion</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6">
              <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest mb-4"><Upload size={16} className="text-amazon-orange"/> Main Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <div className="relative w-full h-full group">
                        <img 
                          src={img instanceof File ? URL.createObjectURL(img) : `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${img}`} 
                          className="w-full h-full object-cover" 
                        />
                        <button onClick={() => { const i = [...images]; i[idx] = null; setImages(i); }} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-md"><X size={12}/></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-center">
                        <Upload size={18} className="mx-auto text-gray-400" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => { const i = [...images]; i[idx] = e.target.files?.[0] || null; setImages(i); }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f0f9ff] rounded-2xl p-6 space-y-4 border border-blue-100">
               <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest text-blue-600"><Globe size={16}/> SEO Settings</h3>
               <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-white border border-blue-200 p-2.5 rounded-lg text-sm font-bold outline-none" placeholder="Meta Title" />
               <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-white border border-blue-200 p-2.5 rounded-lg text-sm font-bold outline-none" placeholder="URL Slug" />
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
