import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useProductsStore } from "../store/productsStore";

type ProductForm = {
  name: string;
  supplierPrice: string;
  suggestedRetailPrice: string;
  image: string;
  description: string;
  category: string;
};

const emptyForm: ProductForm = {
  name: "",
  supplierPrice: "",
  suggestedRetailPrice: "",
  image: "",
  description: "",
  category: "",
};

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const createProduct = useProductsStore((state) => state.createProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const product = useProductsStore((state) => (productId ? state.getProductById(productId) : undefined));

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) {
      loadProducts().catch(() => undefined);
      return;
    }

    if (!hasHydrated) return;
    if (!isEditing) {
      setLoading(false);
      return;
    }

    if (!product) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    setForm({
      name: product.name,
      supplierPrice: String(product.supplierPrice),
      suggestedRetailPrice: String(product.suggestedRetailPrice),
      image: product.image,
      description: product.description,
      category: product.category,
    });
    setLoading(false);
  }, [hasHydrated, isEditing, loadProducts, product]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        supplierPrice: Number(form.supplierPrice),
        suggestedRetailPrice: Number(form.suggestedRetailPrice),
      };

      if (isEditing && productId) {
        const updatedProduct = await updateProduct(productId, payload);
        if (!updatedProduct) {
          throw new Error("Failed to find the product you are trying to update.");
        }
      } else {
        await createProduct(payload);
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setSubmitting(false);
    }
  };

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)] md:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Catalog editor
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {isEditing ? "Edit product" : "Add a new product"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isEditing
                ? "Refine the listing, pricing, and presentation for this item."
                : "Create a polished catalog entry that is ready for both storefront and POS."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                placeholder="Wireless Earbuds Pro"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Supplier Price</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.supplierPrice}
                  onChange={(e) => setForm({ ...form, supplierPrice: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                  placeholder="800"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Suggested Retail Price</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.suggestedRetailPrice}
                  onChange={(e) => setForm({ ...form, suggestedRetailPrice: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                  placeholder="1500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                placeholder="Electronics"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Image URL</label>
              <input
                type="url"
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                placeholder="https://example.com/product.jpg"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                placeholder="High-quality wireless earbuds with noise cancellation."
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                to="/admin/products"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Update Product
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Publishing checklist</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Clear product title</p>
                <p className="mt-1 text-sm text-slate-500">Use a specific, customer-facing name that works in both product tables and checkout.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Healthy margin</p>
                <p className="mt-1 text-sm text-slate-500">Keep enough spread between supplier and retail pricing to protect COD profit.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Good image and description</p>
                <p className="mt-1 text-sm text-slate-500">These improve trust and reduce confusion for the selling team.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
