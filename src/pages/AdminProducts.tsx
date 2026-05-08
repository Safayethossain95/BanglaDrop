import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useProductsStore } from "../store/productsStore";

export default function AdminProducts() {
  const products = useProductsStore((state) => state.products);
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);
  const loadProducts = useProductsStore((state) => state.loadProducts);

  useEffect(() => {
    if (!hasHydrated) {
      loadProducts().catch(() => undefined);
    }
  }, [hasHydrated, loadProducts]);

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Delete this product from the catalog?");
    if (!confirmed) return;
    await deleteProduct(productId);
  };

  if (!hasHydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Product control
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Catalog management</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review every product in a cleaner inventory table and update pricing without leaving the dashboard.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No products found. Create your first catalog item to start selling.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-auto text-left">
              <thead className="bg-[#fcfcfb] text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="w-[240px] min-w-[240px] px-3 py-3">Product</th>
                  <th className="px-3 py-3 whitespace-nowrap">Category</th>
                  <th className="px-3 py-3 whitespace-nowrap">Supplier Price</th>
                  <th className="px-3 py-3 whitespace-nowrap">Retail Price</th>
                  <th className="px-3 py-3 whitespace-nowrap">Margin</th>
                  <th className="px-3 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="align-top transition-colors hover:bg-slate-50/70">
                    <td className="w-[240px] min-w-[240px] px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-900">৳ {product.supplierPrice}</td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-900">৳ {product.suggestedRetailPrice}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        ৳ {product.suggestedRetailPrice - product.supplierPrice}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
      </section>
    </div>
  );
}
