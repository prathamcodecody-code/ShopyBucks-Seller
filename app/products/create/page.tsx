"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  DollarSign,
  TrendingDown,
  Package,
  Truck,
  Calculator,
  CheckCircle,
  AlertCircle,
  Ruler,
} from "lucide-react";

/* -------------------------------- TYPES -------------------------------- */

type SizeRow = {
  size: string;
  enabled: boolean;
  stock: number;
  price: string;
};

type ColorVariant = {
  color: string;
  images: (File | null)[];
  sizes: SizeRow[];
};

type Attribute = {
  id: number;
  slug: string;
  name: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN";
  isFilterable: boolean;
};

type SizeMode = "NONE" | "CLOTHING" | "SHOES" | "NUMERIC";

/* ------------------------------- CONSTANTS ------------------------------ */

const COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow",
  "Pink", "Purple", "Orange", "Brown", "Gray", "Navy",
  "Beige", "Maroon", "Teal", "Lime", "Coral", "Mint",
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL"];

const SHOE_SIZES = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

/* 
  Size Mode Detection — keyword based on category / type / subtype names
  We match against lowercased name strings. 
  Priority: SHOES > CLOTHING > NONE
*/

const SHOE_KEYWORDS = [
  "shoe", "shoes", "sneaker", "sneakers", "boot", "boots",
  "sandal", "sandals", "slipper", "slippers", "footwear",
  "loafer", "loafers", "heel", "heels", "moccasin", "moccasins",
  "flip flop", "flipflop", "clog", "clogs", "oxford",
];

const CLOTHING_KEYWORDS = [
  "shirt", "t-shirt", "tshirt", "top", "tops", "blouse", "kurti", "kurta",
  "dress", "dresses", "jeans", "pant", "pants", "trouser", "trousers",
  "skirt", "skirts", "legging", "leggings", "jacket", "jackets", "coat",
  "coats", "hoodie", "hoodies", "sweater", "sweaters", "sweatshirt",
  "pullover", "suit", "suits", "blazer", "blazers", "saree", "sari",
  "salwar", "lehenga", "shorts", "dungaree", "jumpsuit", "romper",
  "clothing", "clothes", "apparel", "garment", "wear", "outfit",
  "ethnic", "western", "formal", "casual", "sportswear", "activewear",
  "innerwear", "underwear", "lingerie", "nightwear", "sleepwear",
];

const NO_SIZE_KEYWORDS = [
  "beauty", "skincare", "makeup", "cosmetic", "cosmetics", "lipstick",
  "lipgloss", "foundation", "mascara", "eyeshadow", "blush", "concealer",
  "serum", "moisturizer", "moisturiser", "toner", "sunscreen", "spf",
  "face wash", "facewash", "cleanser", "scrub", "mask", "perfume",
  "fragrance", "deodorant", "cologne", "body lotion", "body wash",
  "shampoo", "conditioner", "hair oil", "hair color", "hair colour",
  "nail", "nails", "nail polish", "nail art", "jewellery", "jewelry",
  "necklace", "bracelet", "ring", "earring", "earrings", "pendant",
  "watch", "watches", "bag", "bags", "handbag", "purse", "wallet",
  "clutch", "backpack", "luggage", "suitcase", "sunglasses", "glasses",
  "cap", "hat", "scarf", "stole", "dupatta", "belt", "belts",
  "supplement", "vitamin", "protein", "nutrition", "health",
  "electronics", "phone", "mobile", "gadget", "appliance",
  "book", "books", "stationery", "toy", "toys",
];

function detectSizeMode(names: string[]): SizeMode {
  const combined = names.join(" ").toLowerCase();

  // Check no-size first (most specific win)
  for (const kw of NO_SIZE_KEYWORDS) {
    if (combined.includes(kw)) return "NONE";
  }
  // Then shoes
  for (const kw of SHOE_KEYWORDS) {
    if (combined.includes(kw)) return "SHOES";
  }
  // Then clothing
  for (const kw of CLOTHING_KEYWORDS) {
    if (combined.includes(kw)) return "CLOTHING";
  }

  // Default: show clothing sizes as a safe fallback for unknown categories
  return "CLOTHING";
}

function getSizesForMode(mode: SizeMode): string[] {
  if (mode === "CLOTHING") return CLOTHING_SIZES;
  if (mode === "SHOES") return SHOE_SIZES;
  return [];
}

function freshSizeRows(mode: SizeMode): SizeRow[] {
  return getSizesForMode(mode).map((size) => ({
    size,
    enabled: false,
    stock: 0,
    price: "",
  }));
}

function freshVariant(color = "", mode: SizeMode = "CLOTHING"): ColorVariant {
  return { color, images: [null, null, null], sizes: freshSizeRows(mode) };
}

const SIZE_MODE_LABELS: Record<SizeMode, string> = {
  NONE: "No sizes required",
  CLOTHING: "Clothing sizes (XS – 4XL)",
  SHOES: "Shoe sizes (4 – 13)",
  NUMERIC: "Numeric sizes",
};

const SIZE_MODE_COLORS: Record<SizeMode, string> = {
  NONE: "bg-gray-100 text-gray-600 border-gray-200",
  CLOTHING: "bg-blue-50 text-blue-700 border-blue-200",
  SHOES: "bg-amber-50 text-amber-700 border-amber-200",
  NUMERIC: "bg-purple-50 text-purple-700 border-purple-200",
};

/* ------------------------------ PAGE ------------------------------------ */

export default function CreateProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [baseColor, setBaseColor] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [subtypes, setSubtypes] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const [discountType, setDiscountType] = useState<"" | "PERCENT" | "FLAT">("");
  const [discountValue, setDiscountValue] = useState("");

  const [seasonTags, setSeasonTags] = useState<string[]>([]);
  const [occasionTags, setOccasionTags] = useState<string[]>([]);

  const [mainImages, setMainImages] = useState<(File | null)[]>([null, null, null, null]);
  const [variants, setVariants] = useState<ColorVariant[]>([freshVariant("", "CLOTHING")]);

  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  /* ---------------------------- SIZE MODE DETECTION ---------------------------- */

  const sizeMode = useMemo<SizeMode>(() => {
    const catName = categories.find((c) => String(c.id) === categoryId)?.name || "";
    const typeName = types.find((t) => String(t.id) === typeId)?.name || "";
    const subtypeName = subtypes.find((s) => String(s.id) === subtypeId)?.name || "";

    // Only compute if we have at least a category selected
    if (!categoryId) return "CLOTHING";
    return detectSizeMode([catName, typeName, subtypeName].filter(Boolean));
  }, [categoryId, typeId, subtypeId, categories, types, subtypes]);

  // Re-build variant size rows whenever sizeMode changes
  useEffect(() => {
    setVariants((prev) =>
      prev.map((v) => ({ ...v, sizes: freshSizeRows(sizeMode) }))
    );
  }, [sizeMode]);

  /* ---------------------------- FETCH DATA ---------------------------- */

  useEffect(() => {
    api.get("/categories")
      .then((r) => setCategories(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setAttributes([]); setAttributeValues({});
      setTypes([]); setSubtypes([]);
      setTypeId(""); setSubtypeId("");
      return;
    }
    const run = async () => {
      try {
        const typesRes = await api.get(`/product-types?categoryId=${categoryId}`);
        setTypes(typesRes.data); setTypeId(""); setSubtypeId("");
      } catch (e) { console.error(e); }

      setLoadingAttributes(true);
      try {
        const attrsRes = await api.get(`/products/category-attributes?categoryId=${categoryId}`);
        setAttributes(Array.isArray(attrsRes.data) ? attrsRes.data : []);
      } catch (e) { console.error(e); setAttributes([]); }
      finally { setLoadingAttributes(false); }
      setAttributeValues({});
    };
    run();
  }, [categoryId]);

  useEffect(() => {
    if (!typeId) { setSubtypes([]); return; }
    api.get(`/product-subtypes?typeId=${typeId}`)
      .then((r) => setSubtypes(r.data))
      .catch(console.error);
  }, [typeId]);

  /* ---------------------------- HELPERS ---------------------------- */

  const preview = (f: File | null) => (f ? URL.createObjectURL(f) : null);

  const setMainImg = (i: number, f: File | null) => {
    setMainImages((prev) => { const n = [...prev]; n[i] = f; return n; });
  };

  const addVariant = () =>
    setVariants((v) => [...v, freshVariant("", sizeMode)]);

  const removeVariant = (vi: number) =>
    setVariants((v) => v.filter((_, i) => i !== vi));

  const setVariantColor = (vi: number, color: string) =>
    setVariants((v) => {
      const n = [...v]; n[vi] = { ...n[vi], color }; return n;
    });

  const setVariantImg = (vi: number, ii: number, f: File | null) =>
    setVariants((v) => {
      const n = [...v];
      const imgs = [...n[vi].images];
      imgs[ii] = f;
      n[vi] = { ...n[vi], images: imgs };
      return n;
    });

  const toggleSize = (vi: number, si: number) =>
    setVariants((v) => {
      const n = [...v];
      const sizes = [...n[vi].sizes];
      sizes[si] = { ...sizes[si], enabled: !sizes[si].enabled };
      n[vi] = { ...n[vi], sizes };
      return n;
    });

  const setSizeField = (vi: number, si: number, key: "stock" | "price", val: string) =>
    setVariants((v) => {
      const n = [...v];
      const sizes = [...n[vi].sizes];
      sizes[si] = { ...sizes[si], [key]: key === "stock" ? Number(val) : val };
      n[vi] = { ...n[vi], sizes };
      return n;
    });

  const enableAllSizes = (vi: number) =>
    setVariants((v) => {
      const n = [...v];
      n[vi] = {
        ...n[vi],
        sizes: n[vi].sizes.map((s) => ({ ...s, enabled: true, stock: s.stock || 1 })),
      };
      return n;
    });

  // For NONE mode: each variant is treated as a single SKU with stock field
  const [variantStocks, setVariantStocks] = useState<Record<number, number>>({});
  const setVariantStock = (vi: number, stock: number) =>
    setVariantStocks((s) => ({ ...s, [vi]: stock }));

  function flattenSkus() {
    const result: { color: string; size: string | null; stock: number; price?: number }[] = [];

    for (const [vi, v] of variants.entries()) {
      if (!v.color) continue;

      if (sizeMode === "NONE") {
        // No sizes — single SKU per color
        result.push({
          color: v.color,
          size: null,
          stock: variantStocks[vi] ?? 1,
          price: undefined,
        });
      } else {
        const enabledSizes = v.sizes.filter((s) => s.enabled);
        if (enabledSizes.length === 0) {
          result.push({ color: v.color, size: null, stock: 0, price: undefined });
        } else {
          for (const s of enabledSizes) {
            result.push({
              color: v.color,
              size: s.size,
              stock: s.stock,
              price: s.price ? Number(s.price) : undefined,
            });
          }
        }
      }
    }
    return result;
  }

  /* ---------------------------- PRICING CALC ---------------------------- */

  const basePrice = Number(price) || 0;
  const itemWeight = Number(weight) || 0;
  const dValue = Number(discountValue) || 0;

  let mrp = basePrice;
  if (discountType === "PERCENT" && dValue > 0) {
    mrp = Math.round(basePrice / (1 - dValue / 100));
  } else if (discountType === "FLAT" && dValue > 0) {
    mrp = basePrice + dValue;
  }

  const discountedPrice =
    discountType === "PERCENT" && dValue > 0
      ? Math.round(basePrice * (1 - dValue / 100))
      : discountType === "FLAT" && dValue > 0
      ? basePrice - dValue
      : basePrice;

  const shippingEstimate = itemWeight > 0 ? Math.ceil(itemWeight / 500) * 65 : 0;
  const platformFee = basePrice * 0.1;
  const netProfit = discountedPrice - platformFee - shippingEstimate;

  /* ---------------------------- SUBMIT ---------------------------- */

  const submit = async () => {
    if (!categoryId || !typeId || !subtypeId) {
      alert("Please select Category, Type and Subtype");
      return;
    }

    const skus = flattenSkus();
    if (!skus.length || !skus.some((s) => s.color)) {
      alert("Please add at least one color variant");
      return;
    }

    if (sizeMode !== "NONE" && skus.every((s) => !s.size && s.stock === 0)) {
      alert("Please enable at least one size with stock > 0");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("categoryId", String(Number(categoryId)));
      fd.append("typeId", String(Number(typeId)));
      fd.append("subtypeId", String(Number(subtypeId)));
      fd.append("price", String(basePrice));
      fd.append("weight", String(itemWeight));
      fd.append("baseColor", baseColor || variants[0]?.color || "");

      if (discountType && discountValue) {
        fd.append("discountType", discountType);
        fd.append("discountValue", String(dValue));
      }

      fd.append("seasonTags", JSON.stringify(seasonTags));
      fd.append("occasionTags", JSON.stringify(occasionTags));

      const attrs = Object.entries(attributeValues)
        .filter(([, v]) => v)
        .map(([slug, value]) => ({ slug, value }));
      fd.append("attributes", JSON.stringify(attrs));
      fd.append("sizes", JSON.stringify(skus));

      let skuIndex = 0;
      for (const [vi, v] of variants.entries()) {
        if (!v.color) continue;
        const count = sizeMode === "NONE" ? 1 : (v.sizes.filter((s) => s.enabled).length || 1);
        v.images.forEach((img, ii) => {
          if (img) fd.append(`sku_${skuIndex}_img${ii + 1}`, img);
        });
        skuIndex += count;
      }

      mainImages.forEach((img, i) => img && fd.append(`image${i + 1}`, img));

      await api.post("/seller/products", fd);
      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Check console for details.");
    }
  };

  const usedColors = variants.map((v) => v.color).filter(Boolean);

  /* ---------------------------- SIZE MODE BADGE ---------------------------- */

  const SizeModeBadge = () => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${SIZE_MODE_COLORS[sizeMode]}`}>
      <Ruler size={11} />
      {SIZE_MODE_LABELS[sizeMode]}
    </span>
  );

  /* ---------------------------- RENDER ---------------------------- */

  return (
    <SellerLayout>
      <div className="min-h-screen bg-amazon-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-amazon-mutedText hover:text-amazon-text font-bold text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Inventory
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-amazon-text">Create New Product</h1>
                <p className="text-amazon-mutedText mt-1">Fill in the details to add a new product to your catalog</p>
              </div>
              <button
                onClick={() => setPricingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-amazon-orange text-amazon-orange hover:bg-orange-50 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                <Calculator size={16} />
                Pricing Preview
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Info */}
              <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-amazon-borderGray mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-black text-amazon-text">Basic Information</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Product Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Men's Cotton T-Shirt"
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Description *</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product features, materials, care instructions..."
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 resize-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-amazon-text mb-2">Base Price (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-amazon-mutedText font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="999"
                          className="w-full pl-8 pr-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 transition-all font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amazon-text mb-2">Weight (grams) *</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="300"
                        className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amazon-text mb-2">Base Color</label>
                      <select
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white transition-all font-bold"
                      >
                        <option value="">Select...</option>
                        {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6">
                <h2 className="text-lg font-black text-amazon-text pb-4 border-b border-amazon-borderGray mb-6">Category & Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white transition-all font-bold"
                    >
                      <option value="">Select...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Type *</label>
                    <select
                      value={typeId}
                      onChange={(e) => setTypeId(e.target.value)}
                      disabled={!categoryId}
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-all font-bold"
                    >
                      <option value="">Select...</option>
                      {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Subtype *</label>
                    <select
                      value={subtypeId}
                      onChange={(e) => setSubtypeId(e.target.value)}
                      disabled={!typeId}
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-all font-bold"
                    >
                      <option value="">Select...</option>
                      {subtypes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Size mode indicator — shown after category is selected */}
                {categoryId && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-amazon-mutedText font-bold">Size type detected:</span>
                    <SizeModeBadge />
                  </div>
                )}
              </div>

              {/* Attributes */}
              {categoryId && (
                <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6">
                  <h2 className="text-lg font-black text-amazon-text pb-4 border-b border-amazon-borderGray mb-6">
                    Product Attributes
                    {loadingAttributes && (
                      <span className="ml-2 text-sm text-amazon-mutedText font-normal animate-pulse">Loading...</span>
                    )}
                  </h2>
                  {!loadingAttributes && attributes.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle size={32} className="mx-auto text-amazon-mutedText mb-2 opacity-50" />
                      <p className="text-sm text-amazon-mutedText">No attributes configured for this category</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attributes
                        .filter((a) => a.slug !== "color" && a.slug !== "size")
                        .map((a) => (
                          <div key={a.slug}>
                            <label className="block text-sm font-bold text-amazon-text mb-2">
                              {a.name}
                              {a.isFilterable && <span className="text-amazon-danger ml-1">*</span>}
                            </label>
                            {a.type === "BOOLEAN" ? (
                              <select
                                value={attributeValues[a.slug] || ""}
                                onChange={(e) => setAttributeValues((v) => ({ ...v, [a.slug]: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white transition-all font-bold"
                              >
                                <option value="">Select...</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <input
                                type={a.type === "NUMBER" ? "number" : "text"}
                                value={attributeValues[a.slug] || ""}
                                onChange={(e) => setAttributeValues((v) => ({ ...v, [a.slug]: e.target.value }))}
                                placeholder={`Enter ${a.name.toLowerCase()}`}
                                className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 transition-all font-bold"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Color Variants */}
              <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6">
                <div className="flex justify-between items-center pb-4 border-b border-amazon-borderGray mb-6">
                  <div>
                    <h2 className="text-lg font-black text-amazon-text">Colors & Variants</h2>
                    <p className="text-sm text-amazon-mutedText mt-0.5">
                      {sizeMode === "NONE"
                        ? "Add one card per color — no sizes needed for this category"
                        : `Add one card per color with ${sizeMode === "SHOES" ? "shoe" : "clothing"} size matrix`}
                    </p>
                  </div>
                  <button
                    onClick={addVariant}
                    className="flex items-center gap-2 px-4 py-2 bg-amazon-orange hover:bg-amazon-orangeHover text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                    Add Color
                  </button>
                </div>

                <div className="space-y-5">
                  {variants.map((v, vi) => (
                    <div
                      key={vi}
                      className="border-2 border-amazon-borderGray rounded-xl overflow-hidden hover:border-amazon-orange transition-colors"
                    >
                      {/* Variant header */}
                      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b-2 border-amazon-borderGray">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-full border-2 border-amazon-borderGray shadow-sm"
                            style={{ backgroundColor: v.color ? v.color.toLowerCase() : "#f3f4f6" }}
                          />
                          <select
                            value={v.color}
                            onChange={(e) => setVariantColor(vi, e.target.value)}
                            className="px-3 py-2 border-2 border-amazon-borderGray rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 transition-all"
                          >
                            <option value="">Select Color *</option>
                            {COLORS.map((c) => (
                              <option key={c} value={c} disabled={usedColors.includes(c) && v.color !== c}>
                                {c}{usedColors.includes(c) && v.color !== c ? " (used)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        {variants.length > 1 && (
                          <button
                            onClick={() => removeVariant(vi)}
                            className="flex items-center gap-1.5 text-amazon-danger hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="p-5 space-y-5">

                        {/* ===== SIZE SECTION — conditional ===== */}
                        {sizeMode === "NONE" ? (
                          /* No sizes — just stock quantity */
                          <div>
                            <label className="block text-sm font-black text-amazon-text mb-3">
                              Stock Quantity
                            </label>
                            <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3 border-2 border-amazon-borderGray">
                              <Package size={16} className="text-amazon-mutedText shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-amazon-mutedText mb-1 font-bold">
                                  How many units do you have in stock?
                                </p>
                                <input
                                  type="number"
                                  min={1}
                                  value={variantStocks[vi] ?? 1}
                                  onChange={(e) => setVariantStock(vi, Number(e.target.value))}
                                  className="w-full px-3 py-2 border-2 border-amazon-borderGray rounded-lg text-sm font-bold focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white"
                                  placeholder="e.g. 50"
                                />
                              </div>
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-bold whitespace-nowrap">
                                <CheckCircle size={12} />
                                No sizes needed
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Clothing or Shoes — size matrix */
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-black text-amazon-text">
                                {sizeMode === "SHOES" ? "Shoe Sizes" : "Available Sizes"}
                              </label>
                              <div className="flex items-center gap-3">
                                <SizeModeBadge />
                                <button
                                  onClick={() => enableAllSizes(vi)}
                                  className="text-xs text-amazon-orange hover:underline font-bold"
                                >
                                  Enable all
                                </button>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              {v.sizes.map((s, si) => (
                                <div
                                  key={s.size}
                                  className={`grid grid-cols-[auto_1fr_1fr_1fr] gap-3 items-center px-3 py-2.5 rounded-lg transition-all ${
                                    s.enabled
                                      ? "bg-white border-2 border-amazon-orange shadow-sm"
                                      : "bg-white border-2 border-transparent hover:border-amazon-borderGray"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={s.enabled}
                                    onChange={() => toggleSize(vi, si)}
                                    className="w-5 h-5 text-amazon-orange border-2 border-amazon-borderGray rounded focus:ring-amazon-orange cursor-pointer"
                                  />
                                  <span className={`text-sm font-black ${s.enabled ? "text-amazon-text" : "text-amazon-mutedText"}`}>
                                    {s.size}
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    disabled={!s.enabled}
                                    value={s.enabled ? s.stock : ""}
                                    onChange={(e) => setSizeField(vi, si, "stock", e.target.value)}
                                    placeholder="Stock"
                                    className={`px-3 py-2 border-2 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amazon-orange/20 ${
                                      s.enabled
                                        ? "border-amazon-borderGray bg-white focus:border-amazon-orange"
                                        : "border-transparent bg-transparent cursor-not-allowed"
                                    }`}
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    disabled={!s.enabled}
                                    value={s.enabled ? s.price : ""}
                                    onChange={(e) => setSizeField(vi, si, "price", e.target.value)}
                                    placeholder="₹ Override"
                                    className={`px-3 py-2 border-2 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amazon-orange/20 ${
                                      s.enabled
                                        ? "border-amazon-borderGray bg-white focus:border-amazon-orange"
                                        : "border-transparent bg-transparent cursor-not-allowed"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>

                            {v.sizes.some((s) => s.enabled) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {v.sizes.filter((s) => s.enabled).map((s) => (
                                  <span
                                    key={s.size}
                                    className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-amazon-orange border border-orange-200 px-3 py-1 rounded-full font-black"
                                  >
                                    <CheckCircle size={12} />
                                    {s.size} · {s.stock} pcs{s.price && ` · ₹${s.price}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Variant images */}
                        <div>
                          <label className="block text-sm font-black text-amazon-text mb-3">
                            Images for {v.color || "this color"} (Optional)
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {v.images.map((img, ii) => (
                              <label key={ii} className="block cursor-pointer group">
                                <div className="border-2 border-dashed border-amazon-borderGray rounded-xl group-hover:border-amazon-orange transition-all bg-white h-32 flex items-center justify-center relative overflow-hidden">
                                  {img ? (
                                    <>
                                      <img src={preview(img)!} alt="" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setVariantImg(vi, ii, null); }}
                                        className="absolute top-2 right-2 bg-amazon-danger text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="text-center">
                                      <Upload size={20} className="mx-auto text-amazon-mutedText mb-1" />
                                      <span className="text-xs text-amazon-mutedText font-bold">Image {ii + 1}</span>
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => setVariantImg(vi, ii, e.target.files?.[0] || null)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SKU Preview */}
                {flattenSkus().some((s) => s.color) && (
                  <div className="mt-5 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={16} className="text-blue-600" />
                      <p className="text-xs font-black text-blue-800 uppercase tracking-wide">
                        {flattenSkus().filter((s) => s.color).length} SKUs will be created
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {flattenSkus().filter((s) => s.color).map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-full font-bold"
                        >
                          {s.color}{s.size ? ` / ${s.size}` : ""} · {s.stock} pcs
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column — Sidebar */}
            <div className="space-y-6">

              {/* Main Images */}
              <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6 sticky top-6">
                <div className="flex items-center gap-3 pb-4 border-b border-amazon-borderGray mb-5">
                  <Upload size={18} className="text-amazon-orange" />
                  <h2 className="text-lg font-black text-amazon-text">Product Gallery</h2>
                </div>
                <p className="text-xs text-amazon-mutedText mb-4">Upload up to 4 images. First = main display.</p>
                <div className="grid grid-cols-2 gap-3">
                  {mainImages.map((img, i) => (
                    <label key={i} className="block cursor-pointer group">
                      <div className="border-2 border-dashed border-amazon-borderGray rounded-xl group-hover:border-amazon-orange transition-all bg-amazon-lightGray h-32 flex items-center justify-center relative overflow-hidden">
                        {img ? (
                          <>
                            <img src={preview(img)!} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setMainImg(i, null); }}
                              className="absolute top-2 right-2 bg-amazon-danger text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <Upload size={18} className="mx-auto text-amazon-mutedText mb-1" />
                            <span className="text-[10px] text-amazon-mutedText font-bold">{i === 0 ? "Main" : `#${i + 1}`}</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setMainImg(i, e.target.files?.[0] || null)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-amazon-borderGray mb-5">
                  <TrendingDown size={18} className="text-green-600" />
                  <h2 className="text-lg font-black text-amazon-text">Discount</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-amazon-text mb-2">Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 bg-white font-bold"
                    >
                      <option value="">No Discount</option>
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FLAT">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  {discountType && (
                    <div>
                      <label className="block text-sm font-bold text-amazon-text mb-2">Value</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "PERCENT" ? "0–100" : "Amount"}
                        className="w-full px-4 py-3 border-2 border-amazon-borderGray rounded-lg focus:outline-none focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={submit}
                  className="w-full px-6 py-4 bg-amazon-orange hover:bg-amazon-orangeHover text-white rounded-xl font-black text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Package size={20} />
                  Create Product
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="w-full px-6 py-3 border-2 border-amazon-borderGray bg-white hover:bg-gray-50 text-amazon-text rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Pricing Modal */}
      {pricingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-amazon-darkBlue border-b border-amazon-borderGray">
              <div className="flex items-center gap-3">
                <Calculator size={20} className="text-amazon-orange" />
                <h3 className="text-lg font-black text-white">Pricing Breakdown</h3>
              </div>
              <button
                onClick={() => setPricingModalOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amazon-borderGray">
                <span className="text-sm font-bold text-amazon-mutedText">MRP</span>
                <span className="text-xl font-black text-amazon-text">₹{mrp.toLocaleString()}</span>
              </div>

              {discountType && dValue > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-amazon-borderGray">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={14} className="text-green-600" />
                    <span className="text-sm font-bold text-green-600">After Discount</span>
                  </div>
                  <span className="text-xl font-black text-green-600">₹{discountedPrice.toLocaleString()}</span>
                </div>
              )}

              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-black uppercase tracking-wide text-amazon-mutedText mb-3">Deductions</p>
                <div className="flex justify-between text-sm">
                  <span className="text-amazon-mutedText">Platform Fee (10%)</span>
                  <span className="font-bold text-amazon-danger">-₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Truck size={12} className="text-amazon-mutedText" />
                    <span className="text-amazon-mutedText">Est. Shipping</span>
                  </div>
                  <span className="font-bold text-amazon-danger">-₹{shippingEstimate}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-amazon-borderGray">
                <span className="text-sm font-black text-amazon-text uppercase tracking-wide">Your Net Earnings</span>
                <span className={`text-2xl font-black ${netProfit < 0 ? "text-amazon-danger" : "text-amazon-success"}`}>
                  ₹{netProfit.toFixed(2)}
                </span>
              </div>

              {netProfit < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amazon-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-amazon-danger font-bold">
                    Your net profit is negative. Consider increasing the price or reducing the discount.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </SellerLayout>
  );
}
