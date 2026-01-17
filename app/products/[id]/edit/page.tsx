"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Globe, 
  Package, 
  Trash2, 
  Plus, 
  Layers 
} from "lucide-react";

type SizeInput = {
  size: string;
  stock: number;
};

export default function SellerEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = Number(id);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [sizes, setSizes] = useState<SizeInput[]>([]);

  // Image States
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [existingImages, setExistingImages] = useState<(string | null)[]>([null, null, null, null]);

  useEffect(() => {
    api.get(`/seller/products/${productId}`).then((res) => {
      const p = res.data;
      setProduct(p);
      setTitle(p.title);
      setDescription(p.description);
      setPrice(String(p.price));
      setStock(String(p.stock));
      setExistingImages([p.img1, p.img2, p.img3, p.img4]);
      setMetaTitle(p.metaTitle || "");
      setMetaDescription(p.metaDescription || "");
      setMetaKeywords(p.metaKeywords || "");
      if (Array.isArray(p.productsize)) {
        setSizes(p.productsize.map((s: any) => ({ size: s.size, stock: s.stock })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const handleImageChange = (index: number, file: File) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
    const existing = [...existingImages];
    existing[index] = null;
    setExistingImages(existing);
  };

  const removeImage = (index: number) => {
    const updatedNew = [...images];
    updatedNew[index] = null;
    setImages(updatedNew);
    const updatedOld = [...existingImages];
    updatedOld[index] = null;
    setExistingImages(updatedOld);
  };

  const updateProduct = async () => {
    const formData = new FormData();
    // (Your existing logic for appending changed fields...)
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("metaKeywords", metaKeywords);
    
    images.forEach((img, i) => { if (img) formData.append(`image${i + 1}`, img); });

    try {
      await api.patch(`/seller/products/${productId}`, formData);
      alert("Product updated successfully");
      router.push("/products");
    } catch (err) {
      alert("Failed to update product");
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-amazon-mutedText font-medium">Loading Product Data...</p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto pb-20 p-6">
        {/* Navigation */}
        <button 
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amazon-text tracking-tight">Edit Product</h1>
            <p className="text-amazon-mutedText">ID: #PROD-{productId} — Update your listing details.</p>
          </div>
          <button 
            onClick={updateProduct} 
            className="px-8 py-2.5 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold rounded-lg shadow-sm border border-orange-500 transition-colors"
          >
            Update Listing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* BASIC DETAILS */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex items-center gap-2">
                <Package size={18} className="text-amazon-orange" />
                <h2 className="font-bold text-amazon-text">Basic Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1.5">Product Title</label>
                  <input
                    className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    className="w-full border border-amazon-borderGray focus:ring-1 focus:ring-amazon-orange outline-none p-2.5 rounded-lg"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1.5">Price (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-amazon-borderGray outline-none p-2.5 rounded-lg"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1.5">Total Inventory</label>
                    <input
                      type="number"
                      className="w-full border border-amazon-borderGray outline-none p-2.5 rounded-lg"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SIZES */}
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-amazon-orange" />
                  <h2 className="font-bold text-amazon-text">Sizes & Stock</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSizes([...sizes, { size: "", stock: 0 }])}
                  className="flex items-center gap-1 text-xs font-bold bg-amazon-darkBlue text-white px-3 py-1.5 rounded-md"
                >
                  <Plus size={14} /> Add Size
                </button>
              </div>
              <div className="p-6 space-y-3">
                {sizes.length === 0 ? (
                  <p className="text-sm text-amazon-mutedText text-center py-4 italic">No variant sizes configured for this product.</p>
                ) : (
                  sizes.map((s, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-transparent hover:border-amazon-borderGray transition-all">
                      <input
                        className="flex-1 border border-amazon-borderGray p-2 rounded-md bg-white text-sm outline-none focus:ring-1 focus:ring-amazon-orange"
                        placeholder="Size (e.g. XL)"
                        value={s.size}
                        onChange={(e) => {
                          const updated = [...sizes];
                          updated[i].size = e.target.value;
                          setSizes(updated);
                        }}
                      />
                      <input
                        type="number"
                        className="w-24 border border-amazon-borderGray p-2 rounded-md bg-white text-sm outline-none focus:ring-1 focus:ring-amazon-orange"
                        placeholder="Qty"
                        value={s.stock}
                        onChange={(e) => {
                          const updated = [...sizes];
                          updated[i].stock = Number(e.target.value);
                          setSizes(updated);
                        }}
                      />
                      <button onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} className="text-amazon-danger p-2 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-5">
              <h2 className="font-bold text-amazon-text mb-4">Gallery</h2>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative aspect-square rounded-lg border-2 border-dashed border-amazon-borderGray hover:border-amazon-orange transition-colors group overflow-hidden bg-gray-50">
                    {existingImages[i] || images[i] ? (
                      <>
                        <img 
                          src={existingImages[i] ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${existingImages[i]}` : URL.createObjectURL(images[i]!)} 
                          className="w-full h-full object-cover" 
                        />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-amazon-danger hover:bg-white shadow-md">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <Upload size={18} className="text-gray-400 group-hover:text-amazon-orange" />
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Replace</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageChange(i, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-amazon-borderGray shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-blue-600" />
                <h2 className="font-bold text-amazon-text">SEO Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-amazon-mutedText uppercase mb-1">Meta Title</label>
                  <input className="w-full border border-amazon-borderGray rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-amazon-orange" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amazon-mutedText uppercase mb-1">Meta Description</label>
                  <textarea rows={3} className="w-full border border-amazon-borderGray rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-amazon-orange" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}