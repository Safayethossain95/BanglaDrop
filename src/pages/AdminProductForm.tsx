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
  const createProduct = useProductsStore((state) => state.createProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const product = useProductsStore((state) => (productId ? state.getProductById(productId) : undefined));

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [hasHydrated, isEditing, product]);

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
        const updatedProduct = updateProduct(productId, payload);
        if (!updatedProduct) {
          throw new Error("Failed to find the product you are trying to update.");
        }
      } else {
        createProduct(payload);
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
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/admin/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isEditing
              ? "Update the catalog entry and pricing details for this product."
              : "Create a new product that will appear in the storefront and POS catalog."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all"
              placeholder="Wireless Earbuds Pro"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Price</label>
              <input
                type="number"
                min="0"
                required
                value={form.supplierPrice}
                onChange={(e) => setForm({ ...form, supplierPrice: e.target.value })}
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all"
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Suggested Retail Price</label>
              <input
                type="number"
                min="0"
                required
                value={form.suggestedRetailPrice}
                onChange={(e) => setForm({ ...form, suggestedRetailPrice: e.target.value })}
                className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all"
                placeholder="1500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all"
              placeholder="Electronics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all"
              placeholder="https://example.com/product.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all resize-none"
              placeholder="High-quality wireless earbuds with noise cancellation."
            />
          </div>

          {error ? (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Update Product
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
