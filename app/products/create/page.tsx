"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Upload, X, ChevronRight, Info, Globe, Package, Tag, Layers, 
  IndianRupee, Percent, Truck, BarChart3, Save, Plus, Trash2, Calendar, PartyPopper, Scale
} from "lucide-react";

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SEASONS = ["Summer", "Winter", "Spring", "Autumn", "All Season"];
const OCCASIONS = ["Casual", "Formal", "Party", "Festive", "Wedding", "Sports"];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Pink", "Purple", "Brown", "Grey", "Beige"];

type ProductSize = {
  size: string;
  stock: number;
  price?: number;
};

type Variant = {
  color: string;
  size: string;
  sku?: string;
  price?: number;
  stock: number;
  images: (File | null)[];
};

export default function CreateProductPage() {
  const router = useRouter();

  // BASIC STATES
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); 
  const [stock, setStock] = useState(""); // ✨ NEW: Main product stock
  const [baseColor, setBaseColor] = useState(""); // ✨ NEW: Main product color
  const [sku, setSku] = useState("");
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");
  const [weight, setWeight] = useState("");
  
  // CATEGORY STATES
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");

  // FINANCIAL STATES
  const [discountType, setDiscountType] = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
  const [commissionPct, setCommissionPct] = useState("10"); 

  // SEO & MEDIA
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  
  // ✨ NEW: Main product sizes (when hasVariants = false)
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  
  // ✨ NEW: Product mode toggle
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  // CALCULATIONS
  const sPrice = Number(price) || 0;
  const dValue = Number(discountValue) || 0;
  const itemWeight = Number(weight) || 0;

  let mrp = sPrice;
  if (discountType === "PERCENT" && dValue > 0) mrp = Math.round(sPrice / (1 - dValue / 100));
  if (discountType === "FLAT" && dValue > 0) mrp = sPrice + dValue;

  const estimatedShipping = itemWeight > 0 ? Math.ceil(itemWeight / 500) * 65 : 0;
  const commissionAmt = (sPrice * Number(commissionPct)) / 100;
  const gstAmt = (sPrice * Number(gstPercent)) / 100;
  const totalDeductions = commissionAmt + gstAmt + estimatedShipping;
  const netProfit = sPrice - totalDeductions;

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
      if (!title || !selectedSubtype || !images[0] || sPrice <= 0 || !weight) {
        alert("Please fill all required fields, including Weight and Primary Image.");
        return;
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("categoryId", selectedCategory);
      fd.append("typeId", selectedType);
      fd.append("subtypeId", selectedSubtype);
      fd.append("weight", weight);
      fd.append("price", price);
      
      // ✨ ALWAYS send main product fields
      if (stock) fd.append("stock", stock);
      if (baseColor) fd.append("baseColor", baseColor);
      if (sku) fd.append("sku", sku);
      if (season) fd.append("seasonTags", JSON.stringify([season]));
      if (occasion) fd.append("occasionTags", JSON.stringify([occasion]));

      fd.append("mrp", mrp.toString());
      fd.append("gstPercent", gstPercent);
      fd.append("shippingFee", estimatedShipping.toString());
      
      if (discountType) {
        fd.append("discountType", discountType);
        fd.append("discountValue", dValue.toString());
      }

      // ✨ hasVariants flag - tells DB if product has color variants
      fd.append("hasVariants", hasVariants.toString());

      // ✨ ALWAYS send main product sizes if they exist
      if (productSizes.length > 0) {
        fd.append("productSizes", JSON.stringify(productSizes));
      }

      // ✨ Send variants only if hasVariants is true
      if (hasVariants && variants.length > 0) {
        fd.append("variants", JSON.stringify(variants.map(v => ({
          color: v.color,
          size: v.size,
          sku: v.sku || null,
          stock: v.stock,
          price: v.price || sPrice,
        }))));

        variants.forEach((v, vIndex) => {
          v.images.forEach((img, imgIndex) => {
            if (img) fd.append(`variant_${vIndex}_img${imgIndex + 1}`, img);
          });
        });
      }

      images.forEach((img, i) => { if (img) fd.append(`image${i + 1}`, img); });

      await api.post("/seller/products", fd);
      router.push("/products");
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-[1400px] mx-auto pb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-widest mb-2">
              <Package size={14} /> Catalog <ChevronRight size={12} /> New Listing
            </div>
            <h1 className="text-3xl font-black text-amazon-text tracking-tight">Product Creation</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => router.back()} className="px-6 py-2.5 font-bold border border-amazon-borderGray rounded-xl hover:bg-gray-50 transition-all">
              Discard
            </button>
            <button onClick={createProduct} className="px-10 py-2.5 font-black bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Publish Listing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl focus:bg-white focus:border-amazon-orange outline-none transition-all font-bold" placeholder="e.g. Designer Silk Saree" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText ml-1">Description</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50/50 border-2 border-gray-100 p-3 rounded-xl focus:bg-white focus:border-amazon-orange outline-none transition-all font-medium" placeholder="Describe materials, fit, etc." />
                </div>
              </div>
            </div>

            {/* Pricing & Logistics */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
              <div className="flex items-center gap-3 pb-4 border-b mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text tracking-tight">Pricing & Logistics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Selling Price (₹)</label>
                      <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-green-500 outline-none font-black text-lg" placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Weight (Grams)</label>
                      <div className="relative">
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none font-bold" placeholder="500" />
                        <Scale className="absolute right-3 top-3 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Discount Type</label>
                      <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold">
                        <option value="">No Discount</option>
                        <option value="PERCENT">Percent (%)</option>
                        <option value="FLAT">Flat Off (₹)</option>
                      </select>
                    </div>
                  </div>

                  {discountType && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Discount Value</label>
                      <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold" placeholder={discountType === "PERCENT" ? "%" : "₹"} />
                    </div>
                  )}
                </div>

                {/* Earnings Preview Card */}
                <div className="bg-amazon-darkBlue rounded-2xl p-6 text-white space-y-4 shadow-xl border border-white/5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-amazon-orange" />
                      <span className="text-xs font-black uppercase tracking-widest">Revenue Estimate</span>
                    </div>
                    <span className="text-2xl font-black text-amazon-success tracking-tighter">₹{netProfit.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between opacity-70">
                      <span>Calculated MRP</span>
                      <span>₹{mrp}</span>
                    </div>
                    <div className="flex justify-between text-amazon-orange font-bold">
                      <span>Platform Fee ({commissionPct}%)</span>
                      <span>- ₹{commissionAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span>GST ({gstPercent}%)</span>
                      <span>- ₹{gstAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-300">
                      <div className="flex items-center gap-1">
                        <Truck size={12} />
                        <span>Logistics (Estimate)</span>
                      </div>
                      <span>- ₹{estimatedShipping}</span>
                    </div>
                  </div>
                  <p className="text-[9px] opacity-40 italic leading-tight pt-2">
                    *Logistics Idea is a mock calculation based on {weight || 0}g weight.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Product Details - ALWAYS SHOWN */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text tracking-tight">Main Product Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Base Color</label>
                  <select value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold">
                    <option value="">Select Color</option>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Stock Quantity</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none font-bold" placeholder="0" />
                </div>
              </div>

              {/* Product Sizes - ALWAYS SHOWN */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Product Sizes (Optional)</h3>
                  <button 
                    onClick={() => setProductSizes([...productSizes, { size: "", stock: 0 }])}
                    className="px-3 py-1.5 bg-amazon-darkBlue text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus size={12}/> Add Size
                  </button>
                </div>
                <div className="space-y-3">
                  {productSizes.map((ps, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                      <select 
                        value={ps.size} 
                        onChange={e => { const s = [...productSizes]; s[idx].size = e.target.value; setProductSizes(s); }}
                        className="p-2 rounded border font-bold text-sm"
                      >
                        <option value="">Select Size</option>
                        {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input 
                        type="number" 
                        value={ps.stock} 
                        onChange={e => { const s = [...productSizes]; s[idx].stock = Number(e.target.value); setProductSizes(s); }}
                        className="p-2 rounded border font-bold text-sm"
                        placeholder="Stock"
                      />
                      <button 
                        onClick={() => setProductSizes(productSizes.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Variants - OPTIONAL */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
              <div className="flex items-center gap-6 pb-4 border-b mb-6">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Layers size={20}/></div>
                <h2 className="text-xl font-black text-amazon-text">Color Variants</h2>
                <label className="flex items-center gap-3 cursor-pointer ml-auto">
                  <input 
                    type="checkbox" 
                    checked={hasVariants} 
                    onChange={e => setHasVariants(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-amazon-orange focus:ring-amazon-orange"
                  />
                  <span className="font-bold text-sm">Add color variants</span>
                </label>
              </div>

              {hasVariants ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Add different color options for this product</p>
                    <button onClick={() => setVariants([...variants, { color: "", size: "", stock: 0, images: [null, null, null, null] }])}
                      className="px-4 py-2 bg-amazon-darkBlue text-white text-xs font-black rounded-lg hover:bg-black transition-all flex items-center gap-2">
                      <Plus size={14}/> New Variant
                    </button>
                  </div>

                  <div className="space-y-6">
                    {variants.map((v, idx) => (
                      <div key={idx} className="bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-5 relative">
                        <button onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-white border shadow-sm p-1.5 rounded-full text-red-500 hover:bg-red-50">
                          <Trash2 size={14}/>
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-amazon-mutedText">Color</label>
                            <input value={v.color} onChange={e => { const c = [...variants]; c[idx].color = e.target.value; setVariants(c); }} className="w-full p-2.5 rounded-lg border font-bold text-sm bg-white outline-none" placeholder="Red" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-amazon-mutedText">Size</label>
                            <select value={v.size} onChange={e => { const c = [...variants]; c[idx].size = e.target.value; setVariants(c); }} className="w-full p-2.5 rounded-lg border font-bold text-sm bg-white outline-none">
                              <option value="">Size</option>
                              {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-amazon-mutedText">Stock</label>
                            <input type="number" value={v.stock} onChange={e => { const c = [...variants]; c[idx].stock = Number(e.target.value); setVariants(c); }} className="w-full p-2.5 rounded-lg border font-bold text-sm bg-white outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-amazon-mutedText">Price (Opt)</label>
                            <input type="number" value={v.price || ""} onChange={e => { const c = [...variants]; c[idx].price = Number(e.target.value); setVariants(c); }} className="w-full p-2.5 rounded-lg border font-bold text-sm bg-white outline-none" placeholder={price} />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {v.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="aspect-square bg-white border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden hover:border-amazon-orange transition-all relative group">
                              {img ? (
                                <>
                                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                  <button onClick={() => { const c = [...variants]; c[idx].images[imgIdx] = null; setVariants(c); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X size={16}/></button>
                                </>
                              ) : (
                                <label className="cursor-pointer text-gray-400">
                                  <Plus size={16}/>
                                  <input type="file" className="hidden" accept="image/*" onChange={e => { const c = [...variants]; c[idx].images[imgIdx] = e.target.files?.[0] || null; setVariants(c); }} />
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Layers size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No color variants added</p>
                  <p className="text-xs mt-1">Check the box above to add different colors for this product</p>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6 space-y-5">
              <h3 className="font-black text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest">
                <Layers size={16} className="text-amazon-orange"/> Classification
              </h3>
              <div className="space-y-3">
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

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amazon-mutedText tracking-widest">
                  <Calendar size={14} className="text-amazon-orange"/> Season & Style
                </div>
                <select value={season} onChange={e => setSeason(e.target.value)} className="w-full border-2 border-gray-50 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                  <option value="">Select Season</option>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full border-2 border-gray-50 p-3 rounded-xl font-bold bg-gray-50/50 outline-none">
                  <option value="">Select Occasion</option>
                  {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-6">
              <h3 className="font-black text-amazon-text flex items-center gap-2 uppercase text-xs tracking-widest mb-4">
                <Upload size={16} className="text-amazon-orange"/> Main Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-amazon-orange transition-all bg-gray-50 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <div className="relative w-full h-full group">
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                        <button onClick={() => handleImageChange(idx, null)} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-center group">
                        <Upload size={18} className="mx-auto text-gray-400 group-hover:text-amazon-orange transition-colors" />
                        <span className="text-[8px] font-black uppercase text-gray-400 mt-1 block">Slot {idx+1}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(idx, e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
