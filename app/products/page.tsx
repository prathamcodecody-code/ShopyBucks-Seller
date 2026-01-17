"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ProductPreviewModal from "@/components/ProductPreviewModal";
import { Plus, Search, Edit3, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function SellerProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<any>(null);

  const fetchProducts = async () => {
    const res = await api.get("/seller/products", {
      params: { page, limit },
    });
    setProducts(res.data.products || []);
    setPages(res.data.pages || 1);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/seller/products/${deleteId}`);
    setDeleteOpen(false);
    fetchProducts();
  };

  return (
    <>
      <SellerLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-amazon-borderGray shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-amazon-text">Inventory Management</h1>
              <p className="text-sm text-amazon-mutedText">Manage your listings, stock levels, and pricing.</p>
            </div>

            <button
              onClick={() => router.push("/products/create")}
              className="flex items-center justify-center gap-2 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm border border-orange-500"
            >
              <Plus size={18} />
              Add New Product
            </button>
          </div>

          {/* --- FILTERS & SEARCH --- */}
          <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-amazon-borderGray shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                placeholder="Search by product name..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-amazon-borderGray rounded-lg focus:ring-1 focus:ring-amazon-orange outline-none"
              />
            </div>
          </div>

          {/* --- PRODUCTS TABLE --- */}
          <div className="bg-white rounded-xl border border-amazon-borderGray shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-amazon-borderGray">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amazon-borderGray">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/uploads/products/${p.img1}`}
                          className="w-14 h-14 object-cover rounded-lg border border-amazon-borderGray shadow-sm"
                        />
                        <div className="max-w-[200px] lg:max-w-md">
                          <p className="font-bold text-amazon-text truncate">{p.title}</p>
                          <p className="text-xs text-amazon-mutedText">ID: #PROD-{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amazon-text">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-bold ${
                          p.stock === 0 ? "text-amazon-danger" : p.stock < 5 ? "text-amazon-orange" : "text-amazon-success"
                        }`}>
                          {p.stock === 0 ? "Out of Stock" : p.stock < 5 ? "Low Stock" : "In Stock"}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.stock === 0 ? "bg-red-500" : p.stock < 5 ? "bg-orange-400" : "bg-green-500"}`}
                            style={{ width: `${Math.min(p.stock * 10, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500">{p.stock} units left</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setPreviewProduct(p); setPreviewOpen(true); }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/products/${p.id}/edit`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}
                          className="p-2 text-amazon-danger hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-amazon-borderGray shadow-sm">
            <p className="text-sm text-amazon-mutedText">
              Showing page <span className="font-bold text-amazon-text">{page}</span> of <span className="font-bold text-amazon-text">{pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-amazon-borderGray rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-amazon-borderGray rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
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