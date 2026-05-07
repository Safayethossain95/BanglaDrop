import { type FormEvent, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Truck, PackageCheck } from "lucide-react";
import { useProductsStore } from "../store/productsStore";

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const product = useProductsStore((state) => (productId ? state.getProductById(productId) : undefined));
  const returnTo = typeof location.state?.returnTo === "string" ? location.state.returnTo : "/dashboard";
  
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    sellPrice: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;
    setLoading(false);

    if (product) {
      setForm((current) => (
        current.sellPrice === 0
          ? { ...current, sellPrice: product.suggestedRetailPrice }
          : current
      ));
    }
  }, [hasHydrated, product]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productSnapshot: product,
          ...form
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to place order.");

      navigate(returnTo);
    } catch (err: any) {
      setError(err.message);
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

  if (!product) {
    return <div className="text-red-500 font-medium p-8 text-center">Product not found.</div>;
  }

  const profit = form.sellPrice - product.supplierPrice;

  return (
    <div className="max-w-4xl mx-auto py-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Place COD Order</h1>
          <p className="text-slate-500 mb-8">Enter your customer's details. We will deliver the product and collect the cash.</p>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-slate-400" />
                Delivery Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Full Name</label>
                <input 
                  type="text" 
                  required
                  value={form.customerName}
                  onChange={e => setForm({...form, customerName: e.target.value})}
                  className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g. Rahim Uddin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone Number</label>
                <div className="flex relative">
                  <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-sm">
                    +880
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={form.customerPhone}
                    onChange={e => setForm({...form, customerPhone: e.target.value})}
                    className="flex-1 w-full border-slate-200 rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
                    placeholder="1XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Delivery Address</label>
                <textarea 
                  required
                  rows={3}
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all resize-none placeholder:text-slate-400"
                  placeholder="House No, Road No, Area, City"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <PackageCheck className="w-5 h-5 text-slate-400" />
                Setup Your Margin
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (To be collected via COD)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-slate-500 sm:text-sm font-medium">৳</span>
                  </div>
                  <input 
                    type="number" 
                    required
                    min={product.supplierPrice}
                    value={form.sellPrice}
                    onChange={e => setForm({...form, sellPrice: Number(e.target.value)})}
                    className="w-full border-slate-200 text-lg font-bold rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all text-slate-900"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Minimum price: ৳ {product.supplierPrice}</p>
              </div>

              {error && <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  `Confirm Order (Collect ৳ ${form.sellPrice})`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="h-fit sticky top-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-slate-900">{product.name}</h3>
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Selling Price</span>
                  <span className="text-slate-900 font-medium">৳ {form.sellPrice}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <span>Supplier Cost</span>
                  <span className="text-slate-900 font-medium">- ৳ {product.supplierPrice}</span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-lg">
                  <span className="font-bold text-teal-700">Est. Profit</span>
                  <span className={`font-bold ${profit >= 0 ? 'text-teal-700' : 'text-red-500'}`}>
                    ৳ {profit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
