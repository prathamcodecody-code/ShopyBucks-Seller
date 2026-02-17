"use client";

import { useEffect, useState, useCallback } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ProductPreviewModal from "@/components/ProductPreviewModal";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  TrendingDown,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES  (matching updated service response)
// ─────────────────────────────────────────────
interface ProductSize {
  id: number;
  color: string;
  size: string | null;
  stock: number;
  price: number;
}

interface Pricing {
  sellingPrice: number;
  discountedPrice: number | null;
  discountLabel: string | null;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  img1: string | null;
  price: number;
  stock: number;           // product-level fallback for simple products
  hasVariants: boolean;
  status: string;
  productsize: ProductSize[];

  // computed by service
  totalStock: number;
  minSellingPrice: number;
  maxSellingPrice: number;
  pricing: Pricing;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const IMG_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products`
    : "http://localhost:3030/uploads/products";

function stockLabel(p: Product) {
  if (p.totalStock === 0) return { label: "Out of Stock", color: "text-red-500", bar: "bg-red-500" };
  if (p.totalStock < 5)  return { label: "Low Stock",    color: "text-amber-500", bar: "bg-amber-400" };
  return                        { label: "In Stock",      color: "text-green-600", bar: "bg-green-500" };
}

function priceDisplay(p: Product): string {
  if (p.hasVariants && p.minSellingPrice !== p.maxSellingPrice) {
    return `₹${p.minSellingPrice.toLocaleString()} – ₹${p.maxSellingPrice.toLocaleString()}`;
  }
  return `₹${p.minSellingPrice.toLocaleString()}`;
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function SellerProductsPage() {
  const router = useRouter();

  const [products, setProducts]     = useState<Product[]>([]);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const limit = 10;

  // filters
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | "in" | "out">("");
  const [sort, setSort]             = useState("newest");

  // modals
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // ── fetch ──────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (search)      params.search = search;
      if (stockFilter) params.stock  = stockFilter;
      if (sort && sort !== "newest") params.sort = sort;

      const res = await api.get("/seller/products", { params });
      setProducts(res.data.products || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, stockFilter, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, stockFilter, sort]);

  // ── search submit ──────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  // ── delete ─────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/seller/products/${deleteId}`);
    setDeleteOpen(false);
    fetchProducts();
  };

  // ── active filter count badge ──────────────
  const activeFilters = [search, stockFilter, sort !== "newest" ? sort : ""].filter(Boolean).length;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      <SellerLayout>
        <div className="max-w-7xl mx-auto space-y-5">

          {/* ── HEADER ─────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-amazon-borderGray shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-amazon-text">Inventory Management</h1>
              <p className="text-sm text-amazon-mutedText mt-0.5">
                {total > 0 ? `${total} listing${total !== 1 ? "s" : ""}` : "No listings yet"} ·{" "}
                Manage your stock, pricing and images.
              </p>
            </div>

            <button
              onClick={() => router.push("/products/create")}
              className="flex items-center justify-center gap-2 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm border border-orange-500 whitespace-nowrap"
            >
              <Plus size={18} />
              Add New Product
            </button>
          </div>

          {/* ── FILTERS ────────────────────────────── */}
          <div className="bg-white p-4 rounded-xl border border-amazon-borderGray shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">

              {/* search */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or colour…"
                  className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-amazon-borderGray rounded-lg focus:ring-1 focus:ring-amazon-orange outline-none text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              {/* stock filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-sm border border-amazon-borderGray rounded-lg px-3 py-2 bg-gray-50 focus:ring-1 focus:ring-amazon-orange outline-none min-w-[140px]"
              >
                <option value="">All Stock</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              {/* sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-amazon-borderGray rounded-lg px-3 py-2 bg-gray-50 focus:ring-1 focus:ring-amazon-orange outline-none min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="low_to_high">Price: Low → High</option>
                <option value="high_to_low">Price: High → Low</option>
              </select>
            </div>

            {/* active filter chips */}
            {activeFilters > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-amazon-mutedText">Active filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                    "{search}"
                    <button onClick={clearSearch}><X size={11} /></button>
                  </span>
                )}
                {stockFilter && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                    {stockFilter === "in" ? "In Stock" : "Out of Stock"}
                    <button onClick={() => setStockFilter("")}><X size={11} /></button>
                  </span>
                )}
                {sort !== "newest" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                    {sort === "oldest" ? "Oldest" : sort === "low_to_high" ? "Price ↑" : "Price ↓"}
                    <button onClick={() => setSort("newest")}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── TABLE ──────────────────────────────── */}
          <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">

            {loading ? (
              // skeleton rows
              <div className="divide-y divide-amazon-borderGray">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-amazon-mutedText">
                <p className="font-semibold text-lg">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new listing.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-amazon-borderGray">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">SKUs</th>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-amazon-mutedText uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-amazon-borderGray">
                  {products.map((p) => {
                    const stock = stockLabel(p);
                    const barWidth = Math.min(Math.round((p.totalStock / 20) * 100), 100);

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">

                        {/* ── Product ── */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.img1 ? (
                              <img
                                src={`${IMG_BASE}/${p.img1}`}
                                alt={p.title}
                                className="w-14 h-14 object-cover rounded-lg border border-amazon-borderGray shadow-sm shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg border border-amazon-borderGray bg-gray-100 flex items-center justify-center shrink-0">
                                <span className="text-xs text-gray-400">No img</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-amazon-text truncate max-w-[180px] lg:max-w-xs" title={p.title}>
                                {p.title}
                              </p>
                              <p className="text-xs text-amazon-mutedText">#PROD-{p.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* ── Price ── */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-amazon-text text-sm">{priceDisplay(p)}</p>
                          {p.pricing.discountLabel && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full mt-0.5">
                              <TrendingDown size={9} />
                              {p.pricing.discountLabel}
                            </span>
                          )}
                        </td>

                        {/* ── SKUs ── */}
                        <td className="px-6 py-4">
                          {p.hasVariants ? (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Layers size={13} />
                              <span>{p.productsize.length} SKU{p.productsize.length !== 1 ? "s" : ""}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-amazon-mutedText flex items-center gap-1">
                              <Tag size={12} />
                              Single
                            </span>
                          )}
                          {/* colour chips — up to 4 */}
                          {p.productsize.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {[...new Set(p.productsize.map((s) => s.color))].slice(0, 4).map((c) => (
                                <span
                                  key={c}
                                  className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-200"
                                >
                                  {c}
                                </span>
                              ))}
                              {new Set(p.productsize.map((s) => s.color)).size > 4 && (
                                <span className="text-[9px] text-gray-400">+{new Set(p.productsize.map((s) => s.color)).size - 4}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* ── Stock ── */}
                        <td className="px-6 py-4">
                          <p className={`text-sm font-bold ${stock.color}`}>{stock.label}</p>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${stock.bar}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{p.totalStock} unit{p.totalStock !== 1 ? "s" : ""}</p>
                        </td>

                        {/* ── Status badge ── */}
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${
                            p.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : p.status === "DRAFT"
                              ? "bg-gray-100 text-gray-500 border-gray-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            {p.status}
                          </span>
                        </td>

                        {/* ── Actions ── */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setPreviewProduct(p); setPreviewOpen(true); }}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/products/${p.id}/edit`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}
                              className="p-2 text-amazon-danger hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── PAGINATION ─────────────────────────── */}
          {pages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-amazon-borderGray shadow-sm">
              <p className="text-sm text-amazon-mutedText">
                Page <span className="font-bold text-amazon-text">{page}</span> of{" "}
                <span className="font-bold text-amazon-text">{pages}</span>
                <span className="ml-2 text-xs">({total} total)</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-amazon-borderGray rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* page number pills */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                    const p_num = Math.max(1, Math.min(page - 2, pages - 4)) + i;
                    if (p_num < 1 || p_num > pages) return null;
                    return (
                      <button
                        key={p_num}
                        onClick={() => setPage(p_num)}
                        className={`w-9 h-9 text-sm rounded-md border transition-colors ${
                          p_num === page
                            ? "bg-amazon-orange border-orange-500 text-amazon-darkBlue font-bold"
                            : "border-amazon-borderGray hover:bg-gray-50 text-amazon-text"
                        }`}
                      >
                        {p_num}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === pages || loading}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-amazon-borderGray rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </SellerLayout>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        itemName="product"
      />

      <ProductPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        product={previewProduct}
      />
    </>
  );
}
