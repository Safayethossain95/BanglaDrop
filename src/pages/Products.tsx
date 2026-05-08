import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  CreditCard,
  Receipt,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useProductsStore } from "../store/productsStore";

export default function Products() {
  const location = useLocation();
  const products = useProductsStore((state) => state.products);
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!hasHydrated) {
      loadProducts().catch(() => undefined);
    }
  }, [hasHydrated, loadProducts]);

  if (!hasHydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  const totalRetailValue = filteredProducts.reduce((sum, product) => sum + product.suggestedRetailPrice, 0);
  const averageMargin =
    filteredProducts.length > 0
      ? Math.round(
          filteredProducts.reduce(
            (sum, product) => sum + (product.suggestedRetailPrice - product.supplierPrice),
            0,
          ) / filteredProducts.length,
        )
      : 0;

  const isAdminPos = location.pathname.startsWith("/admin/pos");
  const checkoutState = isAdminPos ? { returnTo: "/admin" } : undefined;

  const bestMarginProduct = useMemo(() => {
    if (filteredProducts.length === 0) return null;

    return [...filteredProducts].sort(
      (a, b) =>
        b.suggestedRetailPrice - b.supplierPrice - (a.suggestedRetailPrice - a.supplierPrice),
    )[0];
  }, [filteredProducts]);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.10),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f4_100%)]">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_60px_-24px_rgba(15,23,42,0.22)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#134e4a_52%,_#ecfeff_180%)] px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  SuperShop POS
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Front Counter Sales Workspace
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                  Browse the live catalog in a high-density register view, compare margin instantly, and move straight into customer checkout from a supershop-ready sales desk.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">Catalog SKUs</p>
                  <p className="mt-2 text-2xl font-bold">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">Visible Items</p>
                  <p className="mt-2 text-2xl font-bold">{filteredProducts.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">Avg. Margin</p>
                  <p className="mt-2 text-2xl font-bold">৳ {averageMargin}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-teal-100">Catalog Value</p>
                  <p className="mt-2 text-2xl font-bold">৳ {totalRetailValue}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-4 md:p-6 xl:grid-cols-1">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by product, category, or keyword"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const active = category === activeCategory;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-slate-900 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_-28px_rgba(15,23,42,0.2)]">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Product Register</p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Counter Catalog Table</h2>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {filteredProducts.length} active items
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Boxes className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-900">No products matched this view</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try a different search keyword or switch to another category to continue selling.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] table-fixed text-left">
                      <thead className="bg-white text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <tr>
                          <th className="px-5 py-4">Product</th>
                          <th className="px-5 py-4">Category</th>
                          <th className="px-5 py-4">Wholesale</th>
                          <th className="px-5 py-4">Retail</th>
                          <th className="px-5 py-4">Margin</th>
                          <th className="px-5 py-4">Sell State</th>
                          <th className="px-5 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredProducts.map((product) => {
                          const margin = product.suggestedRetailPrice - product.supplierPrice;

                          return (
                            <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                              <td className="w-[38%] px-5 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                      {product.description}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="w-[12%] px-5 py-4">
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                  {product.category}
                                </span>
                              </td>
                              <td className="w-[10%] px-5 py-4 font-semibold text-slate-700">৳ {product.supplierPrice}</td>
                              <td className="w-[10%] px-5 py-4 font-semibold text-slate-900">৳ {product.suggestedRetailPrice}</td>
                              <td className="w-[10%] px-5 py-4">
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  ৳ {margin}
                                </span>
                              </td>
                              <td className="w-[10%] px-5 py-4">
                                <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                  Ready to Sell
                                </span>
                              </td>
                              <td className="w-[10%] px-5 py-4 text-right">
                                <Link
                                  to={`/checkout/${product.id}`}
                                  state={checkoutState}
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                                  id={`sell-btn-${product.id}`}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Buy
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="grid grid-cols-2 gap-4 px-4">

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.24)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Counter Overview</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Today's Sales Desk</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Receipt className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 text-teal-700 shadow-sm">
                        <Boxes className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Catalog Ready</p>
                        <p className="text-xs text-slate-500">{products.length} SKUs synced to the POS workspace.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm">
                        <BadgeDollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Margin Snapshot</p>
                        <p className="text-xs text-slate-500">Average expected profit is ৳ {averageMargin} per visible order.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 text-sky-700 shadow-sm">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">COD Fulfillment</p>
                        <p className="text-xs text-slate-500">Each sale opens straight into delivery-ready customer checkout.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            <aside className="space-y-4">

              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-900 text-white shadow-[0_16px_45px_-28px_rgba(15,23,42,0.4)]">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Best Opportunity</p>
                  <h3 className="mt-2 text-lg font-bold">Top Margin Product</h3>
                </div>

                {bestMarginProduct ? (
                  <div className="space-y-4 p-5">
                    <div className="overflow-hidden rounded-2xl bg-white/5">
                      <img
                        src={bestMarginProduct.image}
                        alt={bestMarginProduct.name}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">
                        {bestMarginProduct.category}
                      </p>
                      <h4 className="mt-2 text-xl font-bold">{bestMarginProduct.name}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{bestMarginProduct.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Retail</p>
                        <p className="mt-1 text-lg font-bold">৳ {bestMarginProduct.suggestedRetailPrice}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/15 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300">Profit</p>
                        <p className="mt-1 text-lg font-bold text-emerald-300">
                          ৳ {bestMarginProduct.suggestedRetailPrice - bestMarginProduct.supplierPrice}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/checkout/${bestMarginProduct.id}`}
                      state={checkoutState}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                    >
                      Sell This Product
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-5 text-sm text-slate-300">Choose a category with products to view the current best margin item.</div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
