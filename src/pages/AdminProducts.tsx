import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useProductsStore } from "../store/productsStore";

export default function AdminProducts() {
  const products = useProductsStore((state) => state.products);
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Delete this product from the catalog?");
    if (!confirmed) return;
    deleteProduct(productId);
  };

  if (!hasHydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-slate-500 mt-2">Review the catalog, adjust product records, and manage what appears in the storefront.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">All Products</h2>
          <p className="text-sm text-slate-500 mt-1">{products.length} products in the current catalog.</p>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No products found. Use the add product page to create your first catalog item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Supplier Price</th>
                  <th className="p-4 font-medium">Suggested Price</th>
                  <th className="p-4 font-medium">Margin</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="p-4 min-w-[320px]">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-slate-500 mt-1 line-clamp-2">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{product.category}</td>
                    <td className="p-4 font-medium text-slate-900">৳ {product.supplierPrice}</td>
                    <td className="p-4 font-medium text-slate-900">৳ {product.suggestedRetailPrice}</td>
                    <td className="p-4 font-bold text-teal-700">৳ {product.suggestedRetailPrice - product.supplierPrice}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
