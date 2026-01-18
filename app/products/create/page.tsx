"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  X, 
  ChevronRight, 
  Info, 
  Globe, 
  Package, 
  Tag, 
  Layers 
} from "lucide-react";

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function CreateProductPage() {
  const router = useRouter();

  // FORM STATES
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  // DROPDOWN DATA
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);

  // SELECTIONS
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  
  // SEO & IMAGES
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<(File | null)[]>([
  null,
  null,
  null,
  null,
]);
  const [sizes, setSizes] = useState<{ size: string; stock: number; price?: number }[]>([]);

  // Fetch Logic (Simplified for brevity, keep your existing logic)
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
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }

    if (!selectedCategory || !selectedType || !selectedSubtype) {
      alert("Please select category, type and subtype");
      return;
    }

    if (!images[0]) {
      alert("Primary image is required");
      return;
    }

    const hasSizes = sizes.length > 0;

    if (!price || Number(price) <= 0) {
  alert("Base price is required");
  return;
}

if (!stock || Number(stock) < 0) {
  alert("Base stock is required");
  return;
}

if (sizes.length > 0) {
  if (sizes.some(s => !s.size || s.stock <= 0)) {
    alert("Invalid size stock");
    return;
  }
}

    const fd = new FormData();

    fd.append("title", title);
    fd.append("description", description);
    fd.append("categoryId", selectedCategory);
    fd.append("typeId", selectedType);
    fd.append("subtypeId", selectedSubtype);

    fd.append("slug", slug || title.toLowerCase().replace(/\s+/g, "-"));
    fd.append("metaTitle", metaTitle || title);
    fd.append("metaDescription", metaDescription || description.slice(0, 160));
    fd.append("metaKeywords", metaKeywords || "");

    fd.append("price", Number(price).toString());
    fd.append("stock", Number(stock).toString());
    
    if (sizes.length > 0)  {
      fd.append("sizes", JSON.stringify(sizes));
    }

    images.forEach((img, i) => {
      if (img) fd.append(`image${i + 1}`, img);
    });

    await api.post("/seller/products", fd);

    alert("Product created successfully");
    router.push("/products");

  } catch (err: any) {
    console.error("CREATE PRODUCT ERROR", err?.response?.data || err);
    alert(err?.response?.data?.message || "Failed to create product");
  }
};


  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-amazon-mutedText mb-4">
          <span>Inventory</span>
          <ChevronRight size={14} />
          <span className="text-amazon-text font-medium">Add New Product</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight">Create Listing</h1>
            <p className="text-amazon-mutedText">Fill in the details to list your product on Shopy Bucks.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="px-5 py-2 text-sm font-bold border border-amazon-borderGray rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={createProduct} className="px-8 py-2 text-sm font-bold bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-lg shadow-sm">
              Publish Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 1: BASIC INFO */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
                <Package size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-amazon-text">Primary Details</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-amazon-text mb-1.5">Product Title</label>
                  <input
                    placeholder="e.g. Premium Cotton Men's T-Shirt"
                    className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange outline-none p-2.5 rounded-lg transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-amazon-text mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed description of features, material, and fit..."
                    className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange outline-none p-2.5 rounded-lg transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-1.5">Base Price (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-lg"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-1.5">Total Inventory</label>
                    <input
                      type="number"
                      className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-lg"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: CATEGORIZATION */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
                <Layers size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-amazon-text">Classification</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-amazon-text mb-1.5">Category</label>
                  <select
                    className="w-full border border-amazon-borderGray outline-none p-2.5 rounded-lg bg-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-amazon-text mb-1.5">Type</label>
                  <select
                    disabled={!selectedCategory}
                    className="w-full border border-amazon-borderGray outline-none p-2.5 rounded-lg bg-white disabled:bg-gray-50"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">Select</option>
                    {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-amazon-text mb-1.5">Subtype</label>
                  <select
                    disabled={!selectedType}
                    className="w-full border border-amazon-borderGray outline-none p-2.5 rounded-lg bg-white disabled:bg-gray-50"
                    value={selectedSubtype}
                    onChange={(e) => setSelectedSubtype(e.target.value)}
                  >
                    <option value="">Select</option>
                    {subtypes.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 3: SIZES */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
                <Tag size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-amazon-text">Variants & Sizes</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SIZE_OPTIONS.map((size) => {
                    const existing = sizes.find((s) => s.size === size);
                    return (
                      <div key={size} className={`p-3 border rounded-xl transition-all ${existing ? "border-amazon-orange bg-orange-50" : "border-amazon-borderGray"}`}>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            className="accent-amazon-orange"
                            checked={!!existing}
                            onChange={(e) => {
                              if (e.target.checked) setSizes([...sizes, { size, stock: 0 }]);
                              else setSizes(sizes.filter(s => s.size !== size));
                            }}
                          />
                          <span className={`text-sm font-bold ${existing ? "text-amazon-orange" : "text-amazon-text"}`}>{size}</span>
                        </label>
                        {existing && (
                          <input
                            type="number"
                            placeholder="Qty"
                            className="w-full border border-amazon-borderGray rounded p-1.5 text-xs outline-none focus:border-amazon-orange"
                            value={existing.stock}
                            onChange={(e) => setSizes(sizes.map(s => s.size === size ? { ...s, stock: Number(e.target.value) } : s))}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="space-y-6">
            
            {/* MEDIA SECTION */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-5">
              <h2 className="font-bold text-amazon-text mb-4">Gallery</h2>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border-2 border-dashed border-amazon-borderGray hover:border-amazon-orange transition-colors group overflow-hidden bg-gray-50">
                    {img ? (
                      <>
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                        <button onClick={() => handleImageChange(idx, null)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-amazon-danger hover:bg-white shadow-sm">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <Upload size={20} className="text-gray-400 group-hover:text-amazon-orange" />
                        <span className="text-[10px] font-bold text-gray-400 mt-1">IMG {idx + 1}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(idx, e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-amazon-mutedText mt-3 flex items-center gap-1">
                <Info size={12} /> Format: JPG, PNG. Max 2MB.
              </p>
            </section>

            {/* SEO SECTION */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-blue-600" />
                <h2 className="font-bold text-amazon-text">Search Engine (SEO)</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-amazon-mutedText uppercase mb-1">Meta Title</label>
                  <input className="w-full border border-amazon-borderGray rounded-lg p-2 text-sm" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amazon-mutedText uppercase mb-1">URL Slug</label>
                  <input className="w-full border border-amazon-borderGray rounded-lg p-2 text-sm bg-gray-50" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
