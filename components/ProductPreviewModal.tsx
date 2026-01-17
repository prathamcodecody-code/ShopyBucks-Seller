"use client";

import { X, Tag, Package, Calendar, Layers } from "lucide-react";
import { useState } from "react";

type ProductPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: any;
};

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: ProductPreviewModalProps) {
  const [mainImageIdx, setMainImageIdx] = useState(0);

  if (!isOpen || !product) return null;

  const images = [product.img1, product.img2, product.img3, product.img4].filter(Boolean);
  const sizes = Array.isArray(product.productsize) ? product.productsize : [];
  const totalStock = sizes.length
    ? sizes.reduce((sum: number, s: any) => sum + (s.stock || 0), 0)
    : product.stock ?? 0;

  const createdAtValid = product.createdAt && !isNaN(Date.parse(product.createdAt));

  return (
    <div className="fixed inset-0 bg-amazon-darkBlue/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white w-full max-w-[950px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="bg-amazon-orange/10 p-2 rounded-lg">
              <Package size={20} className="text-amazon-orange" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amazon-text leading-none">Product Insights</h2>
              <p className="text-[11px] text-amazon-mutedText uppercase mt-1 tracking-wider font-bold">Internal Preview Mode</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-amazon-mutedText hover:text-amazon-danger"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* LEFT — VISUALS (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-xl border border-amazon-borderGray overflow-hidden bg-gray-50 shadow-inner">
              {images.length > 0 ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/uploads/products/${images[mainImageIdx]}`}
                  className="w-full h-full object-contain p-4"
                  alt="Main preview"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                  No images available
                </div>
              )}
            </div>
            
            {/* THUMBNAILS */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setMainImageIdx(i)}
                  className={`aspect-square rounded-md border-2 transition-all overflow-hidden ${
                    mainImageIdx === i ? "border-amazon-orange ring-2 ring-amazon-orange/20" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/uploads/products/${img}`}
                    className="w-full h-full object-cover"
                    alt={`Thumb ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — DETAILS (7 Cols) */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-amazon-text mb-2">
                {product.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-light text-amazon-text">₹{product.price.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${totalStock > 0 ? "bg-green-100 text-amazon-success border border-green-200" : "bg-red-100 text-amazon-danger border border-red-200"}`}>
                  {totalStock > 0 ? "Live on Store" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-amazon-borderGray">
              <h4 className="text-xs font-bold text-amazon-mutedText uppercase mb-2 flex items-center gap-1">
                <Tag size={14} /> Description
              </h4>
              <p className="text-sm text-amazon-text leading-relaxed italic">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            {/* SIZES TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amazon-mutedText uppercase flex items-center gap-1">
                <Layers size={14} /> Inventory Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sizes.length > 0 ? (
                  sizes.map((s: any) => (
                    <div
                      key={s.id}
                      className={`px-3 py-2 rounded-lg border flex justify-between items-center ${
                        s.stock > 0 ? "bg-white border-amazon-borderGray" : "bg-gray-50 border-dashed text-gray-400"
                      }`}
                    >
                      <span className="font-bold text-sm">{s.size}</span>
                      <span className={`text-xs ${s.stock < 5 ? "text-amazon-orange font-bold" : "text-amazon-mutedText"}`}>
                        {s.stock} left
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-2 px-4 bg-gray-50 rounded border text-sm text-gray-500">
                    One size / Standard inventory: <span className="font-bold text-amazon-text">{totalStock} units</span>
                  </div>
                )}
              </div>
            </div>

            {/* METADATA */}
            <div className="pt-6 border-t border-amazon-borderGray grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-amazon-mutedText uppercase">Categorization</p>
                <p className="text-xs text-amazon-text font-medium flex items-center gap-1">
                  {product.category?.name || "N/A"} 
                  <span className="text-gray-300">/</span> 
                  {product.producttype?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-amazon-mutedText uppercase">Created At</p>
                <p className="text-xs text-amazon-text font-medium flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" />
                  {createdAtValid ? new Date(product.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric"
                  }) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-amazon-text bg-white border border-amazon-borderGray rounded-lg hover:bg-gray-100 transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}