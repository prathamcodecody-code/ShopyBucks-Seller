"use client";

import { X, Package, Tag, Palette, Calendar } from "lucide-react";
import { useState, useMemo } from "react";

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}) {
  const [mode, setMode] = useState<"PRODUCT" | "VARIANT">("PRODUCT");
  const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!isOpen || !product) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

  /* ---------------- MAIN PRODUCT IMAGES ---------------- */
  const productImages = [
    product.img1,
    product.img2,
    product.img3,
    product.img4,
  ].filter(Boolean);

  /* ---------------- VARIANTS ---------------- */
  const variants = product.variants || [];

  const activeVariant =
    mode === "VARIANT" && activeVariantIdx !== null
      ? variants[activeVariantIdx]
      : null;

  /* ---------------- ACTIVE IMAGES ---------------- */
  const images =
    activeVariant
      ? [activeVariant.img1, activeVariant.img2, activeVariant.img3].filter(Boolean)
      : productImages;

  /* ---------------- PRICE ---------------- */
  const price = activeVariant ? activeVariant.price : product.price;

  /* ---------------- STOCK ---------------- */
  const totalStock = variants.length
    ? variants.reduce((s: number, v: any) => s + v.stock, 0)
    : product.stock ?? 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[1000px] max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Product Preview</h2>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {mode === "PRODUCT" ? "Main Product" : "Variant View"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10 overflow-y-auto">

          {/* LEFT — IMAGES */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square border rounded-xl bg-gray-50 overflow-hidden">
              {images.length ? (
                <img
                  src={`${apiUrl}/uploads/products/${images[activeImgIdx]}`}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIdx(i)}
                  className={`border-2 rounded-md overflow-hidden ${
                    i === activeImgIdx ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={`${apiUrl}/uploads/products/${img}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — DETAILS */}
          <div className="md:col-span-7 space-y-6">

            {/* TITLE */}
            <div>
              <h3 className="text-2xl font-bold">{product.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl font-light">₹{price}</span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    totalStock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {totalStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-gray-50 border rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase text-gray-500 flex gap-1 items-center mb-2">
                <Tag size={14} /> Description
              </h4>
              <p className="text-sm">
                {product.description || "No description provided"}
              </p>
            </div>

            {/* VARIANTS */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
                  <Palette size={14} /> Variants
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {variants.map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMode("VARIANT");
                        setActiveVariantIdx(i);
                        setActiveImgIdx(0);
                      }}
                      className={`border rounded-lg p-3 text-left ${
                        activeVariantIdx === i && mode === "VARIANT"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="font-bold text-sm">
                        {v.color} {v.size && `• ${v.size}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{v.price} · {v.stock} units
                      </p>
                      {v.sku && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          SKU: {v.sku}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {/* BACK TO PRODUCT */}
                {mode === "VARIANT" && (
                  <button
                    onClick={() => {
                      setMode("PRODUCT");
                      setActiveVariantIdx(null);
                      setActiveImgIdx(0);
                    }}
                    className="text-xs text-orange-600 font-bold underline"
                  >
                    ← Back to main product
                  </button>
                )}
              </div>
            )}

            {/* META */}
            <div className="pt-6 border-t grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">
                  Category
                </p>
                <p className="text-sm">
                  {product.category?.name} / {product.producttype?.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">
                  Created
                </p>
                <p className="text-sm flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(product.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 font-bold border rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
