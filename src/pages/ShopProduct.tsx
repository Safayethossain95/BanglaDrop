import { type FormEvent, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Truck, Package, ShieldCheck } from "lucide-react";
import logoImage from "../assets/images/logo.png";
import { useProductsStore } from "../store/productsStore";

export default function ShopProduct() {
  const { productId } = useParams();
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const product = useProductsStore((state) => (productId ? state.getProductById(productId) : undefined));
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
          sellPrice: product.suggestedRetailPrice,
          ...form
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to place order.");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen bg-slate-50 text-red-500 font-medium p-8 text-center">Product not found.</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-500 mb-8">Thank you for your purchase. We will deliver it via Cash on Delivery soon.</p>
          <Link to="/" className="block w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Store
            </Link>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <img src={logoImage} alt="BanglaDrop logo" className="w-6 h-6 rounded object-cover" />
              BanglaDrop
            </div>
            {/* Empty div for flex balance */}
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-[4/5] object-cover object-center group shadow-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Fast Delivery</p>
                  <p className="text-xs text-slate-500 mt-0.5">Dispatched within 24h</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">COD Allowed</p>
                  <p className="text-xs text-slate-500 mt-0.5">Pay safely on arrival</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info & Form */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h3 className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">
                {product.category}
              </h3>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-slate-900 mb-6">৳ {product.suggestedRetailPrice}</p>
              
              <div className="prose prose-slate max-w-none text-slate-600 pb-8 border-b border-slate-200">
                <p>{product.description}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0"></div>
              
              <div className="relative z-10 space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Express Checkout</h2>
                <p className="text-sm text-slate-500">No payment needed now. Pay entirely with Cash on Delivery.</p>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.customerName}
                    onChange={e => setForm({...form, customerName: e.target.value})}
                    className="w-full border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 font-bold sm:text-sm shadow-sm">
                      +880
                    </span>
                    <input 
                      type="tel" 
                      required
                      value={form.customerPhone}
                      onChange={e => setForm({...form, customerPhone: e.target.value})}
                      className="flex-1 w-full border-slate-200 rounded-r-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                      placeholder="1XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Detailed Delivery Address</label>
                  <textarea 
                    required
                    rows={3}
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    className="w-full border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all resize-none placeholder:text-slate-400 bg-slate-50/50"
                    placeholder="Building, Street, Area, City"
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100 relative z-10">{error}</div>}

              <button 
                type="submit" 
                disabled={submitting}
                className="relative z-10 w-full bg-slate-900 hover:bg-black text-white px-4 py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-6 shadow-xl shadow-slate-900/10"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Confirm Order — Cash on Delivery"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
