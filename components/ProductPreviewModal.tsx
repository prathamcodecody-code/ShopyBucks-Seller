"use client";

import { X, Package, Tag, Palette, Calendar, Layers, TrendingDown } from "lucide-react";
import { useState } from "react";

// ─────────────────────────────────────────────
// TYPES — matches updated service response
// ─────────────────────────────────────────────
interface ProductSize {
  id: number;
  color: string;
  size: string | null;
  stock: number;
  price: number;
  img1?: string | null;
  img2?: string | null;
  img3?: string | null;
}

interface Pricing {
  sellingPrice: number;
  discountedPrice: number | null;
  discountLabel: string | null;
}

interface Product {
  id: number;
  title: string;
  description?: string;
  img1?: string | null;
  img2?: string | null;
  img3?: string | null;
  img4?: string | null;
  price: number;
  hasVariants: boolean;
  status: string;
  totalStock: number;
  minSellingPrice: number;
  maxSellingPrice: number;
  pricing: Pricing;
  productsize: ProductSize[];
  category?: { name: string };
  producttype?: { name: string };
  productsubtype?: { name: string };
  createdAt?: string;
  weight?: number;
  discountType?: string | null;
  discountValue?: number | null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const IMG_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products`
    : "http://localhost:3030/uploads/products";

function imgUrl(filename: string) {
  return `${IMG_BASE}/${filename}`;
}

function skuStockColor(stock: number) {
  if (stock === 0) return "text-red-500 bg-red-50 border-red-200";
  if (stock < 5)  return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-green-600 bg-green-50 border-green-200";
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  // which productsize row is selected (null = show product-level view)
  const [activeSku, setActiveSku] = useState<ProductSize | null>(null);
  const [activeImgIdx, setActiveImgIdx]   = useState(0);

  if (!isOpen || !product) return null;

  // ── IMAGE RESOLUTION ───────────────────────
  // If a SKU is selected AND has its own images, show those.
  // Otherwise fall back to product-level images.
  const skuImages = activeSku
    ? [activeSku.img1, activeSku.img2, activeSku.img3].filter(Boolean) as string[]
    : [];

  const productImages = [product.img1, product.img2, product.img3, product.img4]
    .filter(Boolean) as string[];

  const images = skuImages.length ? skuImages : productImages;

  // Safe image index (reset when image list changes length)
  const safeImgIdx = Math.min(activeImgIdx, Math.max(images.length - 1, 0));

  // ── PRICE DISPLAY ──────────────────────────
  // If a SKU is selected show that SKU's price.
  // Otherwise show the range (or single price) from service-computed fields.
  const displayPrice = activeSku
    ? `₹${Number(activeSku.price).toLocaleString()}`
    : product.hasVariants && product.minSellingPrice !== product.maxSellingPrice
    ? `₹${product.minSellingPrice.toLocaleString()} – ₹${product.maxSellingPrice.toLocaleString()}`
    : `₹${product.minSellingPrice.toLocaleString()}`;

  // ── UNIQUE COLOURS (for colour strip) ─────
  const uniqueColors = [...new Set(product.productsize.map((s) => s.color))];

  // ── HANDLE SKU CLICK ───────────────────────
  const selectSku = (sku: ProductSize) => {
    if (activeSku?.id === sku.id) {
      // deselect — go back to product view
      setActiveSku(null);
    } else {
      setActiveSku(sku);
    }
    setActiveImgIdx(0);
  };

  const clearSku = () => {
    setActiveSku(null);
    setActiveImgIdx(0);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[1000px] max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* ── HEADER ───────────────────────────── */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Product Preview</h2>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {activeSku
                  ? `SKU — ${activeSku.color}${activeSku.size ? ` · ${activeSku.size}` : ""}`
                  : "Main Product"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── BODY ─────────────────────────────── */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto flex-1">

          {/* ── LEFT — IMAGES ──────────────────── */}
          <div className="md:col-span-5 space-y-3">

            {/* main image */}
            <div className="aspect-square border rounded-xl bg-gray-50 overflow-hidden">
              {images.length ? (
                <img
                  src={imgUrl(images[safeImgIdx])}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No image available
                </div>
              )}
            </div>

            {/* thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImgIdx(i)}
                    className={`aspect-square border-2 rounded-lg overflow-hidden transition-colors ${
                      i === safeImgIdx
                        ? "border-orange-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={imgUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* SKU image note */}
            {activeSku && skuImages.length === 0 && (
              <p className="text-xs text-gray-400 text-center italic">
                No SKU-specific images — showing product images
              </p>
            )}
          </div>

          {/* ── RIGHT — DETAILS ────────────────── */}
          <div className="md:col-span-7 space-y-5">

            {/* title + price + stock badge */}
            <div>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 leading-snug flex-1">
                  {product.title}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border shrink-0 ${
                  product.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : product.status === "DRAFT"
                    ? "bg-gray-100 text-gray-500 border-gray-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {product.status}
                </span>
              </div>

              {/* price row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-2xl font-light text-gray-800">{displayPrice}</span>
                {/* discount badge — shown when no specific SKU is selected */}
                {!activeSku && product.pricing.discountLabel && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <TrendingDown size={11} />
                    {product.pricing.discountLabel}
                  </span>
                )}
                {/* stock badge */}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  (activeSku ? activeSku.stock : product.totalStock) === 0
                    ? "bg-red-50 text-red-600 border-red-200"
                    : (activeSku ? activeSku.stock : product.totalStock) < 5
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}>
                  {activeSku
                    ? activeSku.stock === 0
                      ? "Out of Stock"
                      : `${activeSku.stock} units`
                    : product.totalStock === 0
                    ? "Out of Stock"
                    : `${product.totalStock} units total`}
                </span>
              </div>
            </div>

            {/* description */}
            <div className="bg-gray-50 border rounded-xl p-4">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 flex gap-1 items-center mb-2">
                <Tag size={12} /> Description
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description || "No description provided"}
              </p>
            </div>

            {/* SKUs — productsize rows */}
            {product.productsize.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                  <Layers size={12} />
                  SKUs
                  <span className="ml-1 text-gray-300">({product.productsize.length})</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.productsize.map((sku) => (
                    <button
                      key={sku.id}
                      onClick={() => selectSku(sku)}
                      className={`border rounded-xl p-3 text-left transition-all ${
                        activeSku?.id === sku.id
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {/* colour dot + label */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: sku.color.toLowerCase() === sku.color ? sku.color : "transparent" }}
                        />
                        <p className="font-bold text-sm text-gray-800 truncate">
                          {sku.color}{sku.size ? ` · ${sku.size}` : ""}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">₹{Number(sku.price).toLocaleString()}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full border inline-block ${skuStockColor(sku.stock)}`}>
                        {sku.stock === 0 ? "Out of stock" : `${sku.stock} left`}
                      </p>
                    </button>
                  ))}
                </div>

                {/* back to product view link */}
                {activeSku && (
                  <button
                    onClick={clearSku}
                    className="text-xs text-orange-600 font-bold hover:underline mt-1"
                  >
                    ← Back to main product view
                  </button>
                )}
              </div>
            )}

            {/* colour strip (quick overview) */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Colours</span>
                {uniqueColors.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* meta grid */}
            <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Category</p>
                <p className="text-gray-700">
                  {product.category?.name ?? "—"}
                  {product.producttype?.name ? ` / ${product.producttype.name}` : ""}
                  {product.productsubtype?.name ? ` / ${product.productsubtype.name}` : ""}
                </p>
              </div>

              {product.weight && (
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Weight</p>
                  <p className="text-gray-700">{product.weight} g</p>
                </div>
              )}

              {product.createdAt && (
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Created</p>
                  <p className="text-gray-700 flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {product.discountType && product.discountValue != null && (
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Discount</p>
                  <p className="text-gray-700">
                    {product.discountValue}
                    {product.discountType === "PERCENT" ? "%" : " ₹"} off
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────── */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 font-bold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
