import { type FormEvent, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Truck, Package, ShieldCheck } from "lucide-react";
import logoImage from "../assets/images/logo.png";
import { useProductsStore } from "../store/productsStore";

export default function ShopProduct() {
  const { productId } = useParams();
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const product = useProductsStore((state) => (productId ? state.getProductById(productId) : undefined));
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
  });
const [deliveryLocation, setDeliveryLocation] = useState('inside'); // 'inside' or 'outside'

// Calculate delivery fee
const getDeliveryFee = () => {
  return deliveryLocation === 'inside' ? 60 : 120;
};

// Calculate total
const totalPrice = product.suggestedRetailPrice + getDeliveryFee();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      loadProducts().catch(() => undefined);
    }
  }, [hasHydrated, loadProducts]);

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
          sellPrice: totalPrice,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
  {/* Header */}
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/70">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Store</span>
        </Link>

        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="logo"
            className="w-9 h-9 rounded-xl object-cover shadow"
          />
          <span className="font-bold text-lg tracking-tight">
            BanglaDrop
          </span>
        </div>

        <div />
      </div>
    </div>
  </header>

  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
    <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">

      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* Product Image */}
        <div className="group relative overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">

          <div className="absolute top-5 left-5 z-20">
            <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Best Seller
            </span>
          </div>

          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-[4/5] object-cover transition duration-700 group-hover:scale-105"
          />
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <p className="font-bold">Fast Delivery</p>
                <p className="text-sm text-slate-500">
                  Delivered in 24-48 hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>

              <div>
                <p className="font-bold">Cash On Delivery</p>
                <p className="text-sm text-slate-500">
                  Pay after receiving
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Reviews */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500 text-lg">★★★★★</span>
            <span className="font-semibold">4.9/5</span>
          </div>

          <p className="text-slate-600">
            Trusted by over 1,200+ customers across Bangladesh.
          </p>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="lg:sticky lg:top-24 self-start">

        <div className="space-y-8">

          {/* Product Details */}
          <div>

            <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
              {product.category}
            </div>

            <h1 className="text-4xl lg:text-3xl font-black tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-5">
              <span className="text-4xl font-black">
                ৳ {product.suggestedRetailPrice}
              </span>

              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                Free Delivery
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">

              <div className="px-4 py-2 rounded-full bg-slate-100 text-sm">
                ⭐ 4.9 Rating
              </div>

              <div className="px-4 py-2 rounded-full bg-slate-100 text-sm">
                🔥 1200+ Orders
              </div>

              <div className="px-4 py-2 rounded-full bg-slate-100 text-sm">
                🚚 24h Dispatch
              </div>

            </div>

            <p className="mt-6 text-slate-600 leading-relaxed text-lg">
              {product.description}
            </p>

          </div>

          {/* Checkout Card */}
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/90 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
          >

            <div className="absolute top-0 right-0 w-56 h-56 bg-blue-50 rounded-full blur-3xl opacity-70" />

            <div className="relative z-10">

              <div className="mb-8">
                <h2 className="text-3xl font-bold">
                  Express Checkout
                </h2>

                <p className="text-slate-500 mt-2">
                  No advance payment required.
                </p>
              </div>

              <div className="space-y-5">

                <div>
                  <label className="block mb-2 font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:border-blue-500 outline-none"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Phone Number
                  </label>

                  <div className="flex">
                    <div className="h-14 px-5 flex items-center rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 font-semibold">
                      +88
                    </div>

                    <input
                      type="tel"
                      required
                      value={form.customerPhone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customerPhone: e.target.value,
                        })
                      }
                      className="flex-1 h-14 px-5 rounded-r-2xl border border-slate-200 bg-slate-50 focus:border-blue-500 outline-none"
                      placeholder="1XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Delivery Address
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 resize-none focus:border-blue-500 outline-none"
                    placeholder="House, Road, Area, District"
                  />
                </div>

              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
                  {error}
                </div>
              )}

              <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-200">

                <div className="flex justify-between">
                  <span>Product Price</span>
                  <span>৳ {product.suggestedRetailPrice}</span>
                </div>

                 <div className="flex justify-between items-center mt-3">
      <span>Delivery</span>
      <div className="flex gap-2">
        <button
        type="button"
          onClick={() => setDeliveryLocation('inside')}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
            deliveryLocation === 'inside'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Inside Dhaka (60)
        </button>
        <button
        type="button"
          onClick={() => setDeliveryLocation('outside')}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
            deliveryLocation === 'outside'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Outside Dhaka (120)
        </button>
      </div>
    </div>

    {/* Optional: Show delivery fee separately */}
    <div className="flex justify-between mt-2 text-sm text-gray-600">
      <span>Delivery Fee</span>
      <span>৳ {getDeliveryFee()}</span>
    </div>

    {/* Total with delivery included */}
    <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
      <span>Total</span>
      <span>৳ {totalPrice}</span>
    </div>
    <button
  type="submit"
  className="w-full mt-6 h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
>
  Confirm Order
</button>
  </div> 


  
  </div>

          

              

              <p className="text-center text-sm text-slate-500 mt-4">
                ✓ Cash On Delivery Available
                <br />
                ✓ No Advance Payment Required
              </p>

          </form>

        </div>
      </div>
    </div>
  </main>
</div>
  );
}
