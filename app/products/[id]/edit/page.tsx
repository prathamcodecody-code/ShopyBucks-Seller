"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Upload, X, Globe, Package, Trash2, Plus, Layers,
  IndianRupee, Save, Scale, Info, TrendingDown, ImageIcon,
} from "lucide-react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SEASONS      = ["Summer", "Winter", "Spring", "Autumn", "All Season"];
const OCCASIONS    = ["Casual", "Formal", "Party", "Festive", "Wedding", "Sports"];
const COLORS       = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Pink", "Purple", "Brown", "Grey", "Beige"];

const IMG_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products`
  : "http://localhost:3030/uploads/products";

// ─────────────────────────────────────────────
// TYPES — matching updated service shape
// ─────────────────────────────────────────────

/**
 * A row from productsize[] returned by findOne.
 * This is the ONLY SKU table. No variants table used.
 */
type Sku = {
  id?: number;          // present for existing SKUs loaded from DB
  color: string;        // required
  size: string;         // "" = no size / free size
  stock: number;
  price: string;        // string for input binding, serialised as number
  // existing server filenames (strings) OR new File objects
  img1: File | string | null;
  img2: File | string | null;
  img3: File | string | null;
};

// ─────────────────────────────────────────────
// HELPER — resolve image preview src
// ─────────────────────────────────────────────
function imgSrc(img: File | string | null): string | null {
  if (!img) return null;
  if (img instanceof File) return URL.createObjectURL(img);
  return `${IMG_BASE}/${img}`;
}

// ─────────────────────────────────────────────
// SUB-COMPONENT — single image slot
// ─────────────────────────────────────────────
function ImageSlot({
  value,
  onChange,
  onRemove,
  label,
}: {
  value: File | string | null;
  onChange: (f: File) => void;
  onRemove: () => void;
  label?: string;
}) {
  const src = imgSrc(value);
  return (
    <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
      {src ? (
        <>
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-md hover:bg-red-50 transition-colors"
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <label className="cursor-pointer flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ImageIcon size={20} />
          {label && <span className="text-[10px]">{label}</span>}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange(f);
            }}
          />
        </label>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function SellerEditProductPage() {
  const router    = useRouter();
  const { id }    = useParams();
  const productId = Number(id);

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Basic ──────────────────────────────────
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [weight,      setWeight]      = useState("");
  const [baseColor,   setBaseColor]   = useState("");
  const [season,      setSeason]      = useState("");
  const [occasion,    setOccasion]    = useState("");

  // ── Pricing ────────────────────────────────
  const [price,         setPrice]         = useState("");
  const [discountType,  setDiscountType]  = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");

  // ── Product-level images (img1–img4) ───────
  // null  = no image / removed
  // string = existing server filename
  // File  = new upload
  const [images, setImages] = useState<(File | string | null)[]>([null, null, null, null]);
  // track which slots were explicitly removed (to send remove_image_N: "true")
  const [removedImages, setRemovedImages] = useState<boolean[]>([false, false, false, false]);

  // ── SKUs ────────────────────────────────────
  // These are the productsize rows. Both create and update use this table.
  // The field name sent to the server is "sizes".
  const [skus, setSkus] = useState<Sku[]>([]);

  // ── SEO ────────────────────────────────────
  const [metaTitle, setMetaTitle] = useState("");
  const [slug,      setSlug]      = useState("");

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────
  useEffect(() => {
    api
      .get(`/seller/products/${productId}`)
      .then((res) => {
        const p = res.data;

        setTitle(p.title || "");
        setDescription(p.description || "");
        setWeight(String(p.weight || ""));
        setBaseColor(p.baseColor || "");
        setSeason(p.seasonTags?.[0] || "");
        setOccasion(p.occasionTags?.[0] || "");
        setPrice(String(p.price || ""));
        setDiscountType(p.discountType || "");
        setDiscountValue(String(p.discountValue || ""));
        setMetaTitle(p.metaTitle || "");
        setSlug(p.slug || "");

        // Product-level images (existing server filenames)
        setImages([p.img1 ?? null, p.img2 ?? null, p.img3 ?? null, p.img4 ?? null]);

        // SKUs from productsize[] — the only SKU table
        if (Array.isArray(p.productsize)) {
          setSkus(
            p.productsize.map((s: any) => ({
              id:    s.id,
              color: s.color  || "",
              size:  s.size   || "",
              stock: s.stock  ?? 0,
              price: String(s.price || p.price || ""),
              img1:  s.img1   ?? null,
              img2:  s.img2   ?? null,
              img3:  s.img3   ?? null,
            })),
          );
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  // ─────────────────────────────────────────────
  // SKU HELPERS
  // ─────────────────────────────────────────────
  const addSku = () =>
    setSkus((prev) => [
      ...prev,
      { color: "", size: "", stock: 0, price: price, img1: null, img2: null, img3: null },
    ]);

  const removeSku = (i: number) =>
    setSkus((prev) => prev.filter((_, idx) => idx !== i));

  const updateSku = (i: number, field: keyof Sku, value: any) =>
    setSkus((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });

  // ─────────────────────────────────────────────
  // IMAGE HELPERS
  // ─────────────────────────────────────────────
  const setProductImage = (idx: number, file: File) => {
    const next = [...images];
    next[idx] = file;
    setImages(next);
    const r = [...removedImages];
    r[idx] = false;
    setRemovedImages(r);
  };

  const removeProductImage = (idx: number) => {
    const next = [...images];
    next[idx] = null;
    setImages(next);
    const r = [...removedImages];
    r[idx] = true;   // will send remove_image_N: "true"
    setRemovedImages(r);
  };

  // ─────────────────────────────────────────────
  // PROFIT PREVIEW (client-side estimate)
  // ─────────────────────────────────────────────
  const sPrice   = Number(price) || 0;
  const dValue   = Number(discountValue) || 0;
  const itemWt   = Number(weight) || 0;
  const discountedPrice =
    discountType === "PERCENT" && dValue > 0
      ? Math.round(sPrice * (1 - dValue / 100))
      : discountType === "FLAT" && dValue > 0
      ? sPrice - dValue
      : sPrice;
  const estimatedShipping = itemWt > 0 ? Math.ceil(itemWt / 500) * 65 : 0;
  const commission = sPrice * 0.1;
  const netProfit  = discountedPrice - commission - estimatedShipping;

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────
  const handleUpdate = async () => {
    setError(null);
    setSaving(true);

    try {
      const fd = new FormData();

      // ── Basic fields ─────────────────────────
      fd.append("title", title);
      fd.append("description", description);
      fd.append("weight", weight);
      if (baseColor) fd.append("baseColor", baseColor);
      if (season)    fd.append("seasonTags",   JSON.stringify([season]));
      if (occasion)  fd.append("occasionTags", JSON.stringify([occasion]));

      // ── Pricing ──────────────────────────────
      // Only send price at the product level when there are no SKUs
      // (for multi-SKU products the service derives price from the SKU array)
      if (skus.length === 0 && price) fd.append("price", price);
      if (discountType)  fd.append("discountType",  discountType);
      if (discountValue) fd.append("discountValue", discountValue);

      // ── Product images ────────────────────────
      images.forEach((img, i) => {
        const n = i + 1; // 1-based
        if (img instanceof File) {
          // new upload
          fd.append(`image${n}`, img);
        } else if (img === null && removedImages[i]) {
          // explicitly removed — tell the server to null the field
          fd.append(`remove_image_${n}`, "true");
        }
        // if img is a string (unchanged existing filename), send nothing — server keeps it
      });

      // ── SKUs (field name must be "sizes") ────
      // CRITICAL FIX: Only send sizes if we actually have SKUs
      // Otherwise the backend will fail with "At least one variant required"
      if (skus.length > 0) {
        // Validate SKUs before sending
        const invalidSkuIndex = skus.findIndex(s => !s.color?.trim());
        if (invalidSkuIndex !== -1) {
          setError(`SKU #${invalidSkuIndex + 1} must have a color`);
          setSaving(false);
          return;
        }

        const invalidStockIndex = skus.findIndex(s => s.stock < 0);
        if (invalidStockIndex !== -1) {
          setError(`SKU #${invalidStockIndex + 1} has invalid stock`);
          setSaving(false);
          return;
        }

        fd.append(
          "sizes",
          JSON.stringify(
            skus.map((s) => ({
              color: s.color.trim(),
              size:  s.size?.trim() || null,
              stock: Number(s.stock),
              price: s.price ? Number(s.price) : undefined,
            })),
          ),
        );

        // Per-SKU image files (new uploads only)
        skus.forEach((s, i) => {
          if (s.img1 instanceof File) fd.append(`sku_${i}_img1`, s.img1);
          if (s.img2 instanceof File) fd.append(`sku_${i}_img2`, s.img2);
          if (s.img3 instanceof File) fd.append(`sku_${i}_img3`, s.img3);
        });
      } else {
        // NO SKUs - must provide price at product level
        if (!price || Number(price) <= 0) {
          setError("Price is required when there are no SKUs");
          setSaving(false);
          return;
        }
        // Price already appended above when skus.length === 0
        // Optionally set stock to 0 or some default
        fd.append("stock", "0");
      }

      await api.patch(`/seller/products/${productId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/products");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message.join(", ")
          : null) ||
        "Failed to update product";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full" />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-[1400px] mx-auto pb-24 px-4">

        {/* ── HEADER ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amazon-mutedText hover:text-amazon-text font-bold text-sm"
          >
            <ArrowLeft size={16} /> Back to Inventory
          </button>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {error && (
              <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex-1">
                {error}
              </p>
            )}
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 md:flex-none px-10 py-2.5 font-black bg-amazon-orange hover:bg-amazon-orangeHover disabled:opacity-60 text-amazon-darkBlue rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? "Saving…" : "Update Listing"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══════════════════════════════════════
              LEFT COLUMN
          ══════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── BASIC INFO ─────────────────────── */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20} /></div>
                <h2 className="text-xl font-black">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                    Product Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-amazon-orange transition-colors"
                    placeholder="Product Title"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-medium outline-none focus:border-amazon-orange transition-colors resize-none"
                    placeholder="Describe the product…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                      Base Colour
                    </label>
                    <select
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-amazon-orange transition-colors"
                    >
                      <option value="">Select…</option>
                      {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                      Weight (grams)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 p-3 pr-10 rounded-xl font-bold outline-none focus:border-amazon-orange transition-colors"
                        placeholder="e.g. 300"
                      />
                      <Scale className="absolute right-3 top-3.5 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PRICING ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6">
              <div className="flex items-center gap-3 pb-4 border-b mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={20} /></div>
                <h2 className="text-xl font-black">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                      Base Price (₹)
                      {skus.length > 0 && (
                        <span className="ml-2 text-amber-500 normal-case font-normal">
                          — overridden by SKU prices
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-black text-lg outline-none focus:border-amazon-orange transition-colors"
                      placeholder="e.g. 999"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                        Discount Type
                      </label>
                      <select
                        value={discountType}
                        onChange={(e) => { setDiscountType(e.target.value as any); setDiscountValue(""); }}
                        className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-amazon-orange transition-colors"
                      >
                        <option value="">No Discount</option>
                        <option value="PERCENT">Percent (%)</option>
                        <option value="FLAT">Flat (₹)</option>
                      </select>
                    </div>
                    {discountType && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1.5 block">
                          {discountType === "PERCENT" ? "%" : "₹"} Off
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-amazon-orange transition-colors"
                          placeholder="e.g. 10"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* profit card */}
                <div className="bg-amazon-darkBlue rounded-2xl p-6 text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-black uppercase text-amazon-orange">Est. Net Earnings</span>
                    <span className={`text-2xl font-black ${netProfit < 0 ? "text-red-400" : "text-green-400"}`}>
                      ₹{netProfit.toFixed(0)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm opacity-80">
                    <div className="flex justify-between">
                      <span>Selling price</span>
                      <span>₹{discountedPrice}</span>
                    </div>
                    {discountType && dValue > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span className="flex items-center gap-1"><TrendingDown size={12} /> Discount</span>
                        <span>-₹{sPrice - discountedPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Platform fee (~10%)</span>
                      <span>-₹{commission.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. shipping</span>
                      <span>-₹{estimatedShipping}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SKUs ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6">
              <div className="flex items-center justify-between pb-4 border-b mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Layers size={20} /></div>
                  <div>
                    <h2 className="text-xl font-black">SKUs</h2>
                    <p className="text-xs text-amazon-mutedText">
                      Colour + size combinations. Each SKU can have its own price and images.
                    </p>
                  </div>
                </div>
                <button
                  onClick={addSku}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amazon-darkBlue text-white text-xs font-black rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} /> Add SKU
                </button>
              </div>

              {/* warning — SKU update is a full replacement */}
              {skus.length > 0 && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                  ⚠️ Saving replaces <strong>all</strong> SKUs. Re-upload any SKU images you want to keep —
                  existing SKU images are not preserved automatically.
                </div>
              )}

              {skus.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Layers size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-sm">No SKUs yet</p>
                  <p className="text-xs mt-1">Click "Add SKU" to add colour / size variants.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {skus.map((s, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 relative"
                    >
                      {/* remove button */}
                      <button
                        onClick={() => removeSku(i)}
                        className="absolute -top-2.5 -right-2.5 bg-white border border-gray-200 p-1.5 rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>

                      <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-3">
                        SKU #{i + 1}
                      </p>

                      {/* fields */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {/* colour */}
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                            Colour *
                          </label>
                          <input
                            value={s.color}
                            onChange={(e) => updateSku(i, "color", e.target.value)}
                            list={`colors-${i}`}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-200 font-bold text-sm bg-white outline-none focus:border-amazon-orange transition-colors"
                            placeholder="e.g. Red"
                          />
                          <datalist id={`colors-${i}`}>
                            {COLORS.map((c) => <option key={c} value={c} />)}
                          </datalist>
                        </div>

                        {/* size */}
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                            Size
                          </label>
                          <select
                            value={s.size}
                            onChange={(e) => updateSku(i, "size", e.target.value)}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-200 font-bold text-sm bg-white outline-none focus:border-amazon-orange transition-colors"
                          >
                            <option value="">No size</option>
                            {SIZE_OPTIONS.map((sz) => <option key={sz} value={sz}>{sz}</option>)}
                          </select>
                        </div>

                        {/* stock */}
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                            Stock *
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={s.stock}
                            onChange={(e) => updateSku(i, "stock", Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-200 font-bold text-sm bg-white outline-none focus:border-amazon-orange transition-colors"
                            placeholder="0"
                          />
                        </div>

                        {/* price */}
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={s.price}
                            onChange={(e) => updateSku(i, "price", e.target.value)}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-200 font-bold text-sm bg-white outline-none focus:border-amazon-orange transition-colors"
                            placeholder={price || "same as base"}
                          />
                        </div>
                      </div>

                      {/* SKU images */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                          SKU Images
                          <span className="ml-1 font-normal text-amber-600">
                            (re-upload to keep — not preserved on save)
                          </span>
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["img1", "img2", "img3"] as const).map((key, imgIdx) => (
                            <ImageSlot
                              key={key}
                              value={s[key]}
                              label={`${imgIdx + 1}`}
                              onChange={(f) => updateSku(i, key, f)}
                              onRemove={() => updateSku(i, key, null)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════
              SIDEBAR
          ══════════════════════════════════════ */}
          <div className="space-y-6">

            {/* ── STYLE TAGS ─────────────────────── */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6 space-y-4">
              <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest">
                <Layers size={16} className="text-amazon-orange" /> Style Tags
              </h3>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1 block">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-gray-50 outline-none focus:border-amazon-orange transition-colors"
                >
                  <option value="">Select Season</option>
                  {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1 block">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-gray-50 outline-none focus:border-amazon-orange transition-colors"
                >
                  <option value="">Select Occasion</option>
                  {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* ── PRODUCT GALLERY ─────────────────── */}
            <div className="bg-white rounded-2xl border border-amazon-borderGray p-6">
              <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest mb-4">
                <Upload size={16} className="text-amazon-orange" /> Product Gallery
              </h3>
              <p className="text-xs text-amazon-mutedText mb-3">
                Upload a new file to replace, or click × to remove.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <ImageSlot
                    key={idx}
                    value={img}
                    label={`Photo ${idx + 1}`}
                    onChange={(f) => setProductImage(idx, f)}
                    onRemove={() => removeProductImage(idx)}
                  />
                ))}
              </div>
            </div>

            {/* ── SEO ────────────────────────────── */}
            <div className="bg-[#f0f9ff] rounded-2xl p-6 space-y-4 border border-blue-100">
              <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest text-blue-600">
                <Globe size={16} /> SEO Settings
              </h3>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">
                  Meta Title
                </label>
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-white border border-blue-200 p-2.5 rounded-lg text-sm font-bold outline-none focus:border-blue-400 transition-colors"
                  placeholder="Meta Title"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">
                  URL Slug
                </label>
                <input
                  value={slug}
                  readOnly
                  className="w-full bg-white border border-blue-100 p-2.5 rounded-lg text-sm text-gray-400 font-mono outline-none cursor-not-allowed"
                  placeholder="Auto-generated from title"
                />
                <p className="text-[10px] text-blue-400 mt-1">
                  Slug is auto-generated when you update the title.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
