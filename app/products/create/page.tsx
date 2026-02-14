"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Save, Trash2, Plus, X, Upload, ChevronRight } from "lucide-react";
import { Info, Package, Layers, IndianRupee, Scale } from "lucide-react";

/* ================= CONSTANTS ================= */

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COLORS = [
  "Black", "White", "Red", "Blue", "Green",
  "Yellow", "Orange", "Pink", "Purple", "Brown", "Grey", "Beige"
];

/* ================= TYPES ================= */

type SKU = {
  color: string;
  size: string;
  stock: number;
  price?: number;
  images: (File | null)[];
};

export default function CreateProductPage() {
  const router = useRouter();

  /* ================= BASIC STATE ================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [weight, setWeight] = useState("");

  /* ================= CLASSIFICATION ================= */
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [subtypes, setSubtypes] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");

  /* ================= DISCOUNT ================= */
  const [discountType, setDiscountType] = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");

  /* ================= MEDIA ================= */
  const [mainImages, setMainImages] = useState<(File | null)[]>([null, null, null, null]);

  /* ================= SKU SYSTEM ================= */
  const [skus, setSkus] = useState<SKU[]>([
    {
      color: "",
      size: "",
      stock: 0,
      price: undefined,
      images: [null, null, null],
    },
  ]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    api.get(`/product-types?categoryId=${categoryId}`)
      .then(r => {
        setTypes(r.data || []);
        setTypeId("");
        setSubtypeId("");
        setSubtypes([]);
      });
  }, [categoryId]);

  useEffect(() => {
    if (!typeId) return;
    api.get(`/product-subtypes?typeId=${typeId}`)
      .then(r => {
        setSubtypes(r.data || []);
        setSubtypeId("");
      });
  }, [typeId]);

  /* ================= HELPERS ================= */
  const updateSKU = (index: number, key: keyof SKU, value: any) => {
    const copy = [...skus];
    (copy[index] as any)[key] = value;
    setSkus(copy);
  };

  const updateSKUImage = (skuIndex: number, imgIndex: number, file: File | null) => {
    const copy = [...skus];
    copy[skuIndex].images[imgIndex] = file;
    setSkus(copy);
  };

  const addSKU = () => {
    setSkus([...skus, {
      color: "",
      size: "",
      stock: 0,
      price: undefined,
      images: [null, null, null],
    }]);
  };

  const removeSKU = (index: number) => {
    if (skus.length === 1) {
      alert("At least one SKU is required");
      return;
    }
    setSkus(skus.filter((_, i) => i !== index));
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!title.trim()) return "Product title is required";
    if (!categoryId || !typeId || !subtypeId) return "Please select category, type, and subtype";
    if (!basePrice || Number(basePrice) <= 0) return "Base price is required";
    if (!weight || Number(weight) <= 0) return "Product weight is required";
    if (!mainImages[0]) return "At least one main image is required";

    // Validate SKUs
    const validSKUs = skus.filter(s => s.color && !isNaN(Number(s.stock)) && Number(s.stock) >= 0);
    
    if (validSKUs.length === 0) {
      return "At least one valid SKU (with color and stock) is required";
    }

    const totalStock = validSKUs.reduce((sum, s) => sum + Number(s.stock), 0);
    if (totalStock <= 0) {
      return "Total stock across all SKUs must be greater than 0";
    }

    // Check for duplicate color+size combinations
    const seen = new Set<string>();
    for (const sku of validSKUs) {
      const key = `${sku.color}_${sku.size || "NA"}`;
      if (seen.has(key)) {
        return `Duplicate SKU detected: ${sku.color} ${sku.size || "(no size)"}`;
      }
      seen.add(key);
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      const fd = new FormData();

      // Basic fields
      fd.append("title", title.trim());
      fd.append("description", description);
      fd.append("categoryId", categoryId);
      fd.append("typeId", typeId);
      fd.append("subtypeId", subtypeId);
      fd.append("price", basePrice);
      fd.append("weight", weight);

      // Discount
      if (discountType && discountValue) {
        fd.append("discountType", discountType);
        fd.append("discountValue", discountValue);
      }

      // SKUs - clean and format
      const cleanSKUs = skus
        .filter(s => s.color) // Must have color
        .map(s => ({
          color: s.color,
          size: s.size || null, // Can be empty
          stock: Number(s.stock),
          price: s.price ? Number(s.price) : Number(basePrice), // Use base price if not specified
        }));

      fd.append("sizes", JSON.stringify(cleanSKUs));

      // SKU images
      skus.forEach((sku, si) => {
        sku.images.forEach((img, ii) => {
          if (img) {
            fd.append(`sku_${si}_img${ii + 1}`, img);
          }
        });
      });

      // Main images
      mainImages.forEach((img, i) => {
        if (img) {
          fd.append(`image${i + 1}`, img);
        }
      });

      console.log("🚀 Submitting product with SKUs:", cleanSKUs);

      await api.post("/seller/products", fd);
      alert("✅ Product created successfully!");
      router.push("/products");
    } catch (err: any) {
      console.error("❌ Error:", err);
      alert(err?.response?.data?.message || "Failed to create product");
    }
  };

  /* ================= RENDER ================= */
  return (
    <SellerLayout>
      <div className="max-w-[1200px] mx-auto pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <Package size={14} /> Catalog <ChevronRight size={12} /> New Product
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Product Listing</h1>
            <p className="text-sm text-gray-500 mt-1">All products use SKUs (color + size combinations)</p>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full md:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> Publish Listing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20}/></div>
                <h2 className="text-xl font-black text-gray-800">Basic Information</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                    placeholder="e.g. Vintage Oversized Hoodie"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="Describe material, fit, and style..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Classification */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers size={20}/></div>
                <h2 className="text-xl font-black text-gray-800">Classification</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">Category *</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl font-bold outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">Type *</label>
                  <select disabled={!categoryId} value={typeId} onChange={e => setTypeId(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl font-bold outline-none disabled:opacity-50">
                    <option value="">Select Type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">Subtype *</label>
                  <select disabled={!typeId} value={subtypeId} onChange={e => setSubtypeId(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl font-bold outline-none disabled:opacity-50">
                    <option value="">Select Subtype</option>
                    {subtypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. SKU Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Package size={20}/></div>
                  <div>
                    <h2 className="text-xl font-black text-gray-800">Product SKUs</h2>
                    <p className="text-xs text-gray-500 mt-1">Define color and size combinations</p>
                  </div>
                </div>
                <button 
                  onClick={addSKU}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-black rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} /> Add SKU
                </button>
              </div>

              <div className="space-y-6">
                {skus.map((sku, index) => (
                  <div key={index} className="relative p-6 bg-gray-50/50 rounded-2xl border-2 border-gray-100 space-y-6">
                    {skus.length > 1 && (
                      <button 
                        onClick={() => removeSKU(index)}
                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    
                    <div className="pr-10">
                      <span className="text-xs font-black uppercase text-gray-400">SKU #{index + 1}</span>
                    </div>

                    {/* SKU Fields */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={sku.color} 
                          onChange={e => updateSKU(index, "color", e.target.value)} 
                          className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500"
                        >
                          <option value="">Select Color</option>
                          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Size</label>
                        <select 
                          value={sku.size} 
                          onChange={e => updateSKU(index, "size", e.target.value)}
                          className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500"
                        >
                          <option value="">No Size</option>
                          {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={sku.stock} 
                          onChange={e => updateSKU(index, "stock", e.target.value)}
                          className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                          Price <span className="text-gray-400 text-[9px]">(optional)</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder={basePrice || "Base price"}
                          value={sku.price ?? ""} 
                          onChange={e => updateSKU(index, "price", e.target.value)}
                          className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* SKU Images */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">SKU Images (Max 3)</label>
                      <div className="grid grid-cols-3 gap-4">
                        {sku.images.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-xl bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all overflow-hidden flex items-center justify-center group">
                            {img ? (
                              <>
                                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                                <button 
                                  onClick={() => updateSKUImage(index, i, null)} 
                                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12}/>
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer p-4 flex flex-col items-center gap-1 w-full h-full justify-center">
                                <Upload size={16} className="text-gray-400" />
                                <span className="text-[9px] text-gray-400 font-bold">Upload</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={e => updateSKUImage(index, i, e.target.files?.[0] || null)} 
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SKU Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">Total SKUs:</span>
                  <span className="font-black text-blue-600">{skus.filter(s => s.color).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="font-bold text-gray-700">Total Stock:</span>
                  <span className="font-black text-blue-600">
                    {skus.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20}/></div>
                <h2 className="text-lg font-black text-gray-800">Pricing</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-4 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      min="0"
                      value={basePrice} 
                      onChange={e => setBasePrice(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl font-bold outline-none focus:border-green-500 transition-all" 
                      placeholder="0.00" 
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 ml-1">SKUs without specific price will use this</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">Discount</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={discountType} 
                      onChange={e => setDiscountType(e.target.value as any)} 
                      className="p-3 bg-gray-50 border-2 border-gray-50 rounded-xl font-bold outline-none focus:border-green-500"
                    >
                      <option value="">None</option>
                      <option value="PERCENT">% Off</option>
                      <option value="FLAT">₹ Flat</option>
                    </select>
                    <input 
                      type="number" 
                      min="0"
                      value={discountValue} 
                      onChange={e => setDiscountValue(e.target.value)} 
                      disabled={!discountType} 
                      className="p-3 bg-gray-50 border-2 border-gray-50 rounded-xl font-bold outline-none disabled:opacity-50 focus:border-green-500" 
                      placeholder="Value" 
                    />
                  </div>
                </div>
                
                <div className="pt-4 space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-4 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      min="0"
                      value={weight} 
                      onChange={e => setWeight(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl font-bold outline-none focus:border-blue-500 transition-all" 
                      placeholder="500" 
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 ml-1">In grams</p>
                </div>
              </div>
            </div>

            {/* Main Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Upload size={20}/></div>
                <h2 className="text-lg font-black text-gray-800">Main Images</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {mainImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all flex items-center justify-center overflow-hidden group">
                    {img ? (
                      <>
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                        <button 
                          onClick={() => {
                            const copy = [...mainImages];
                            copy[i] = null;
                            setMainImages(copy);
                          }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14}/>
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center">
                        <Plus size={24} className="text-gray-300 mb-1" />
                        <span className="text-[10px] font-black uppercase text-gray-400">
                          Slot {i + 1}{i === 0 && " *"}
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={e => {
                            const copy = [...mainImages];
                            copy[i] = e.target.files?.[0] || null;
                            setMainImages(copy);
                          }} 
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 text-center">First image is required</p>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
