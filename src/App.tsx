/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Package,
  LayoutDashboard,
  Store,
  LogOut,
  Menu,
  PackageCheck,
  ShieldAlert,
  Wallet,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import logoImage from "./assets/images/logo.png";
import Products from "./pages/Products";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminProductForm from "./pages/AdminProductForm";
import AdminProducts from "./pages/AdminProducts";
import Supplier from "./pages/Supplier";
import SupplierDashboard from "./pages/SupplierDashboard";
import Shop from "./pages/Shop";
import ShopProduct from "./pages/ShopProduct";

type WalletSummary = {
  available: number;
  pending: number;
  total: number;
};

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  walletSummary: WalletSummary;
};

function Sidebar({ onOpenWallet }: { onOpenWallet: () => void }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSupplierRoute = location.pathname.startsWith("/supplier");
  const menuItems = isAdminRoute
    ? [
        { path: "/admin/dashboard", name: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/pos", name: "POS", icon: Store },
        { path: "/admin", name: "Orders", icon: ShieldAlert },
        { path: "/admin/products", name: "Products", icon: Package },
      ]
    : isSupplierRoute
      ? [
          { path: "/supplier/dashboard", name: "Dashboard", icon: LayoutDashboard },
          { path: "/supplier", name: "Orders", icon: PackageCheck },
        ]
    : [
        { path: "/pos", name: "POS", icon: Store },
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
      ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <img src={logoImage} alt="BanglaDrop logo" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">BanglaDrop</h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (!["/admin", "/supplier"].includes(item.path) && location.pathname.startsWith(`${item.path}/`));
            const Icon = item.icon;
            return (
               <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active
                    ? "bg-slate-100 text-teal-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-slate-200">
        <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 transition-colors w-full mb-4">
          <LogOut className="w-5 h-5" />
          Log Out
        </Link>
        {isSupplierRoute ? (
          <div className="bg-teal-50 p-4 rounded-xl">
            <p className="text-xs text-teal-600 font-semibold uppercase mb-1">Profit Balance</p>
            <p className="text-xl font-bold text-slate-900">Settlement</p>
            <button
              onClick={onOpenWallet}
              className="mt-3 w-full bg-teal-600 hover:bg-teal-700 transition-colors text-white text-sm py-2 rounded-lg font-medium"
            >
              Pay to Dropshipper
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSupplierRoute = location.pathname.startsWith("/supplier");
  const menuItems = isAdminRoute
    ? [
        { path: "/admin/dashboard", name: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/pos", name: "POS", icon: Store },
        { path: "/admin", name: "Orders", icon: ShieldAlert },
        { path: "/admin/products", name: "Products", icon: Package },
      ]
    : isSupplierRoute
      ? [
          { path: "/supplier/dashboard", name: "Dashboard", icon: LayoutDashboard },
          { path: "/supplier", name: "Orders", icon: PackageCheck },
        ]
    : [
        { path: "/pos", name: "POS", icon: Store },
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
      ];

  return (
    <div className="md:hidden bg-white border-b border-slate-200 relative shrink-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="BanglaDrop logo" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">BanglaDrop</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 z-50">
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const active =
                location.pathname === item.path ||
                (!["/admin", "/supplier"].includes(item.path) && location.pathname.startsWith(`${item.path}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    active
                      ? "bg-slate-100 text-teal-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}

function DesktopHeader() {
  return (
    <header className="hidden justify-between h-20 bg-white border-b border-slate-200 md:flex items-center px-8 shrink-0">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Welcome to BanglaDrop!</h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider">Cash on Delivery (COD) Enabled Marketplace</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-500">Seller Status</p>
          <p className="text-sm font-semibold text-emerald-600">Verified Agent</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold">
          A
        </div>
      </div>
    </header>
  );
}

function StatusBar() {
  return (
    <footer className="h-10 bg-slate-900 text-[10px] text-slate-400 flex items-center justify-between px-4 md:px-8 uppercase tracking-widest shrink-0">
      <div className="flex gap-4">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Network Online</span>
      </div>
      <div className="hidden md:block">Payments processed via COD</div>
    </footer>
  );
}

function WalletModal({ isOpen, onClose, walletSummary }: WalletModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    amount: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setForm({
        fullName: "",
        email: "",
        amount: "",
        note: "",
      });
      setSubmitting(false);
      setError("");
    }
  }, [isOpen]);

  const amountNumber = Number(form.amount) || 0;
  const remainingBalance = Math.max(walletSummary.available - amountNumber, 0);
  const exceedsBalance = amountNumber > walletSummary.available;

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const paymentWindow = window.open("", "_blank", "noopener,noreferrer");

    try {
      const response = await fetch("/api/wallet/payout-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          amount: amountNumber,
          note: form.note,
          availableBalance: walletSummary.available,
          currentPath: window.location.pathname,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create payout checkout.");
      }

      if (paymentWindow) {
        paymentWindow.location.href = data.paymentUrl;
      } else {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      }

      onClose();
    } catch (err) {
      if (paymentWindow) {
        paymentWindow.close();
      }
      setError(err instanceof Error ? err.message : "Failed to create payout checkout.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_90px_-36px_rgba(15,23,42,0.5)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_#f8fffe_0%,_#e7f8f4_55%,_#ffffff_100%)] px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                <Wallet className="h-3.5 w-3.5" />
                Wallet Settlement
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Pay the dropshipper</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Enter the payout details below. The modal updates the remaining balance instantly, then opens the UddoktaPay sandbox checkout in a new tab.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dropshipper Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="e.g. Rahim Enterprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dropshipper Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="supplier@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay</label>
              <input
                type="number"
                min="1"
                max={walletSummary.available}
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payout Note</label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder="Optional note for this settlement"
              />
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || exceedsBalance || amountNumber <= 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : (
                  <>
                    Pay To Dropshipper
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live Summary</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Available Balance</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {walletSummary.available}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Payout Amount</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {amountNumber}</p>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm ${exceedsBalance ? "bg-red-50" : "bg-emerald-50"}`}>
                <p className={`text-xs uppercase tracking-[0.22em] ${exceedsBalance ? "text-red-500" : "text-emerald-600"}`}>
                  Remaining Balance
                </p>
                <p className={`mt-2 text-2xl font-bold ${exceedsBalance ? "text-red-700" : "text-slate-900"}`}>
                  ৳ {remainingBalance}
                </p>
                <p className={`mt-2 text-xs ${exceedsBalance ? "text-red-600" : "text-slate-500"}`}>
                  {exceedsBalance
                    ? `This payout exceeds the available balance by ৳ ${amountNumber - walletSummary.available}.`
                    : "The balance updates instantly as you change the payout amount."}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending Profit</p>
                <p className="mt-2 text-xl font-bold text-slate-900">৳ {walletSummary.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout({ children }: { children: ReactNode }) {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    available: 0,
    pending: 0,
    total: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setWalletSummary({
          available: json.profits?.available ?? 0,
          pending: json.profits?.pending ?? 0,
          total: json.profits?.total ?? 0,
        });
      })
      .catch(() => {
        setWalletSummary({
          available: 0,
          pending: 0,
          total: 0,
        });
      });
  }, [isWalletOpen]);

  return (
    <>
      <div className="flex bg-[#F8FAFC] font-sans text-slate-800 h-screen w-screen overflow-hidden">
        <Sidebar onOpenWallet={() => setIsWalletOpen(true)} />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <MobileHeader />
          <DesktopHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
          <StatusBar />
        </div>
      </div>
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletSummary={walletSummary}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop/product/:productId" element={<ShopProduct />} />
        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/checkout/:productId" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/pos" element={<Products />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/:productId/edit" element={<AdminProductForm />} />
                <Route path="/supplier" element={<Supplier />} />
                <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
