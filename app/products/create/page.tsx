"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Upload, X, ChevronRight, Info, Globe, Package, Tag, Layers, 
  IndianRupee, Percent, Truck, BarChart3, Save
} from "lucide-react";

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function CreateProductPage() {
  const router = useRouter();

  // BASIC STATES
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // This is our Selling Price
  const [stock, setStock] = useState("");
  
  // CATEGORY STATES
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");

  // FINANCIAL STATES (New additions to match schema)
  const [discountType, setDiscountType] = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
  const [shippingFee, setShippingFee] = useState("0");
  const [commissionPct, setCommissionPct] = useState("10"); // Example 10% platform fee

  // SEO & MEDIA
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);

  // CALCULATIONS
  const sPrice = Number(price) || 0;
  const dValue = Number(discountValue) || 0;
  
  // Logic: MRP is calculated based on discount applied to selling price
  let mrp = sPrice;
  if (discountType === "PERCENT" && dValue > 0) mrp = Math.round(sPrice / (1 - dValue / 100));
  if (discountType === "FLAT" && dValue > 0) mrp = sPrice + dValue;

  // Platform Deductions
  const commissionAmt = (sPrice * Number(commissionPct)) / 100;
  const gstAmt = (sPrice * Number(gstPercent)) / 100;
  const totalDeductions = commissionAmt + gstAmt + Number(shippingFee);
  const netProfit = sPrice - totalDeductions;

  // Auto-calculate Stock from Sizes
  const totalStockFromSizes = sizes.reduce((acc, curr) => acc + curr.stock, 0);
  const finalStock = sizes.length > 0 ? totalStockFromSizes : Number(stock) || 0;

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (selectedCategory) api.get(`/product-types?categoryId=${selectedCategory}`).then(res => setTypes(res.data || []));
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedType) api.get(`/product-subtypes?typeId=${selectedType}`).then(res => setSubtypes(res.data || []));
  }, [selectedType]);

  const handleImageChange = (index: number, file: File | null) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const createProduct = async () => {
    try {
      if (!title || !selectedSubtype || !images[0] || sPrice <= 0) {
        alert("Please fill all required fields and upload a primary image.");
        return;
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("categoryId", selectedCategory);
      fd.append("typeId", selectedType);
      fd.append("subtypeId", selectedSubtype);
      fd.append("price", sPrice.toString());
      fd.append("stock", finalStock.toString());
      
      // Added financial fields
      fd.append("mrp", mrp.toString());
      fd.append("gstPercent", gstPercent);
      fd.append("shippingFee", shippingFee);
      if (discountType) {
        fd.append("discountType", discountType);
        fd.append("discountValue", dValue.toString());
      }

      if (sizes.length > 0) fd.append("sizes", JSON.stringify(sizes));
      images.forEach((img, i) => { if (img) fd.append(`image${i + 1}`, img); });

      await api.post("/seller/products", fd);
      router.push("/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create product");
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-[1400px] mx-auto pb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-widest mb-2">
              <Package size={14} /> Catalog <ChevronRight size={12} /> Add Product
            </div>
            <h1 className="text-3xl font-black text-amazon-text tracking-tight">New Listing</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => router.back()} className="flex-1 md:flex-none px-6 py-2.5 font-bold border border-amazon-borderGray rounded-xl hover:bg-gray-50 transition-all">
              Discard
            </button>
            <button onClick={createProduct} className="flex-1 md:flex-none px-10 py-2.5 font-black bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Publish Listing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Product Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General Info */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text tracking-tight">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText ml-1">Product Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl focus:bg-white focus:border-amazon-orange outline-none transition-all font-bold" placeholder="High-quality name for your product" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText ml-1">Product Story (Description)</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl focus:bg-white focus:border-amazon-orange outline-none transition-all font-medium" placeholder="Material, fit, and style details..." />
                </div>
              </div>
            </div>

            {/* Pricing & Financials */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
              <div className="flex items-center gap-3 pb-4 border-b mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text tracking-tight">Pricing & GST</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Selling Price (₹)</label>
                      <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none font-black text-lg" placeholder="0.00" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">GST Rate (%)</label>
                      <select value={gstPercent} onChange={e => setGstPercent(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold">
                        <option value="0">0% (Exempt)</option>
                        <option value="5">5% (Essentials)</option>
                        <option value="12">12% (Standard)</option>
                        <option value="18">18% (Services/Electronics)</option>
                        <option value="28">28% (Luxury)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Discount Type</label>
                      <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold">
                        <option value="">No Discount</option>
                        <option value="PERCENT">Percent (%)</option>
                        <option value="FLAT">Flat Off (₹)</option>
                      </select>
                    </div>
                    {discountType && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Discount Value</label>
                        <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit Preview Card */}
                <div className="bg-amazon-darkBlue rounded-2xl p-6 text-white space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-amazon-orange border-b border-white/10 pb-3">
                    <BarChart3 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Earnings Preview</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-60">Calculated MRP</span>
                      <span className="font-bold">₹{mrp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amazon-orange">
                      <span className="opacity-80">Platform Fee ({commissionPct}%)</span>
                      <span className="font-bold">- ₹{commissionAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-300">
                      <span className="opacity-80">GST to Govt ({gstPercent}%)</span>
                      <span className="font-bold">- ₹{gstAmt.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase">Net Earnings</span>
                    <span className="text-2xl font-black text-amazon-success tracking-tighter">₹{netProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory & Sizes */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
              <div className="flex items-center gap-3 pb-4 border-b mb-6">
                <div className="p-2 bg-orange-50 text-amazon-orange rounded-lg"><Tag size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text tracking-tight">Stock & Variants</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SIZE_OPTIONS.map((size) => {
                  const existing = sizes.find(s => s.size === size);
                  return (
                    <div key={size} className={`p-4 border-2 rounded-2xl transition-all cursor-pointer ${existing ? "border-amazon-orange bg-orange-50/50" : "border-gray-50 hover:border-gray-200"}`}>
                      <label className="flex items-center gap-2 font-black text-sm mb-3">
                        <input type="checkbox" checked={!!existing} onChange={e => {
                          if (e.target.checked) setSizes([...sizes, { size, stock: 0 }]);
                          else setSizes(sizes.filter(s => s.size !== size));
                        }} className="w-4 h-4 accent-amazon-orange" />
                        {size}
                      </label>
                      {existing && (
                        <input type="number" placeholder="Stock" value={existing.stock} onChange={e => setSizes(sizes.map(s => s.size === size ? { ...s, stock: Number(e.target.value) } : s))} className="w-full bg-white border border-amazon-borderGray p-2 rounded-lg text-sm font-bold outline-none" />
                      )}
                    </div>
                  );
                })}
              </div>

              {!sizes.length && (
                <div className="mt-6 space-y-1.5 max-w-xs">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Total Stock (Simple Product)</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold" placeholder="Total available units" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">
            {/* Classification */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6 space-y-4">
              <h3 className="font-black text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                <Layers size={16} className="text-amazon-orange"/> Classification
              </h3>
              <div className="space-y-4">
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border-2 border-gray-50 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                  <option value="">Category</option>
                  {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <select disabled={!selectedCategory} value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full border-2 border-gray-50 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                  <option value="">Type</option>
                  {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select disabled={!selectedType} value={selectedSubtype} onChange={e => setSelectedSubtype(e.target.value)} className="w-full border-2 border-gray-50 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                  <option value="">Subtype</option>
                  {subtypes.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
               <h3 className="font-black text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest mb-4">
                <Upload size={16} className="text-amazon-orange"/> Product Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-amazon-orange transition-all bg-gray-50 group flex items-center justify-center overflow-hidden">
                    {img ? (
                      <>
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                        <button onClick={() => handleImageChange(idx, null)} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <Upload size={18} className="text-gray-400 group-hover:text-amazon-orange transition-colors" />
                        <span className="text-[9px] font-black text-gray-400 mt-1 uppercase">Img {idx+1}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(idx, e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="bg-[#f0f9ff] rounded-2xl p-6 space-y-4 border border-blue-100">
               <h3 className="font-black text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                <Globe size={16} className="text-blue-600"/> SEO (Optional)
              </h3>
              <div className="space-y-3">
                <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-white border border-blue-200 p-2.5 rounded-lg text-sm font-medium" placeholder="Search Engine Title" />
                <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-white border border-blue-200 p-2.5 rounded-lg text-sm font-medium" placeholder="Custom URL Slug" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
