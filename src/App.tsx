/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  ReceiptText,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Store,
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
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminProductForm from "./pages/AdminProductForm";
import AdminProducts from "./pages/AdminProducts";
import Supplier from "./pages/Supplier";
import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierSettings from "./pages/SupplierSettings";
import SupplierTransactions from "./pages/SupplierTransactions";
import Shop from "./pages/Shop";
import ShopProduct from "./pages/ShopProduct";
import { apiFetch } from "./lib/api";
import { clearStoredAuth, getDefaultRouteForRole, getStoredUser, type UserRole } from "./lib/auth";

type WalletSummary = {
  available: number;
  pending: number;
  total: number;
};

type WalletModalProps = {
  activeGateway: {
    label: string;
    provider: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  walletSummary: WalletSummary;
};

type PaymentGatewaySummary = {
  provider: string;
  label: string;
  isEnabled: boolean;
  isDefault: boolean;
  isConfigured: boolean;
  environment?: "sandbox" | "production";
  merchantName?: string;
  credentials?: {
    accountNumber?: string;
    accountType?: string;
    instructions?: string;
  };
};

type NavigationItem = {
  path: string;
  name: string;
  icon: typeof LayoutDashboard;
};

const adminMenu: NavigationItem[] = [
  { path: "/admin/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/admin", name: "Orders", icon: ShieldAlert },
  { path: "/admin/transactions", name: "Transactions", icon: ReceiptText },
  { path: "/admin/products", name: "Products", icon: Package },
  { path: "/admin/pos", name: "POS", icon: Store },
];

const supplierMenu: NavigationItem[] = [
  { path: "/supplier/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/supplier", name: "Orders", icon: PackageCheck },
  { path: "/supplier/transactions", name: "Transactions", icon: ReceiptText },
  { path: "/supplier/settings", name: "Settings", icon: Settings },
];

const sellerMenu: NavigationItem[] = [
  { path: "/dashboard", name: "Dashboard", icon: Home },
  { path: "/transactions", name: "Transactions", icon: ReceiptText },
  { path: "/admin/pos", name: "POS", icon: ShoppingBag },
];

function getMenuItems(pathname: string) {
  if (pathname.startsWith("/admin")) return adminMenu;
  if (pathname.startsWith("/supplier")) return supplierMenu;
  return sellerMenu;
}

function getShellMeta(pathname: string) {
  if (pathname.startsWith("/admin/dashboard")) {
    return { title: "Admin dashboard", subtitle: "Monitor orders, profit, and platform health." };
  }
  if (pathname.startsWith("/admin/transactions")) {
    return { title: "Admin transactions", subtitle: "Review payout records and submitted transaction IDs." };
  }
  if (pathname.startsWith("/admin/products")) {
    return { title: "Product catalog", subtitle: "Manage pricing, listings, and sell-ready inventory." };
  }
  if (pathname.startsWith("/admin/pos")) {
    return { title: "POS workspace", subtitle: "Search products fast and move directly into checkout." };
  }
  if (pathname === "/admin") {
    return { title: "Order operations", subtitle: "Track every order from intake to delivery outcome." };
  }
  if (pathname.startsWith("/supplier/dashboard")) {
    return { title: "Supplier dashboard", subtitle: "Keep fulfillment moving and watch payout readiness." };
  }
  if (pathname.startsWith("/transactions")) {
    return { title: "Transactions", subtitle: "Review payout records and submitted transaction IDs." };
  }
  if (pathname.startsWith("/supplier/settings")) {
    return { title: "Supplier settings", subtitle: "Configure payment gateways and supplier-side checkout controls." };
  }
  if (pathname.startsWith("/supplier/transactions")) {
    return { title: "Supplier transactions", subtitle: "Review payout records and submitted transaction IDs." };
  }
  if (pathname.startsWith("/supplier")) {
    return { title: "Supplier orders", subtitle: "Update order status and clear the processing queue." };
  }
  if (pathname.startsWith("/dashboard")) {
    return { title: "Seller dashboard", subtitle: "Follow COD orders and the profit you have unlocked." };
  }
  if (pathname.startsWith("/checkout")) {
    return { title: "Checkout", subtitle: "Capture customer details and confirm the order." };
  }
  return { title: "BanglaDrop", subtitle: "Professional operations for cash-on-delivery commerce." };
}

function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        clearStoredAuth();
        window.location.href = "/login";
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <LogOut className="h-4 w-4" />
      </span>
      <span>Log Out</span>
    </button>
  );
}

function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}

function SidebarContent({
  pathname,
  onNavigate,
  onOpenWallet,
}: {
  pathname: string;
  onNavigate?: () => void;
  onOpenWallet: () => void;
}) {
  const isSupplierRoute = pathname.startsWith("/supplier");
  const menuItems = getMenuItems(pathname);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl ">
            <img src={logoImage} alt="BanglaDrop logo" className="h-7 w-7 rounded-lg object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">BanglaDrop</h1>
            <p className="text-xs text-slate-500">Commerce Console</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Workspace</p>
        <nav className="mt-3 space-y-1.5">
          {menuItems.map((item) => {
            const active =
              pathname === item.path ||
              (!["/admin", "/supplier"].includes(item.path) && pathname.startsWith(`${item.path}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  active
                    ? "bg-white font-semibold text-slate-900 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        {isSupplierRoute ? (
          <button
            type="button"
            onClick={onOpenWallet}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Settlement</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Pay the dropshipper</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Wallet className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Open the payout flow from the supplier workspace.</p>
          </button>
        ) : null}

        <div onClick={onNavigate}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

function Sidebar({ onOpenWallet }: { onOpenWallet: () => void }) {
  const location = useLocation();

  return (
    <aside className="hidden h-full w-[272px] shrink-0 border-r border-slate-200 bg-[#f7f7f5] md:block">
      <SidebarContent pathname={location.pathname} onOpenWallet={onOpenWallet} />
    </aside>
  );
}

function MobileHeader({ onOpenWallet }: { onOpenWallet: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const meta = getShellMeta(location.pathname);

  return (
    <div className="border-b border-slate-200 bg-[#fcfcfb] md:hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">BanglaDrop</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{meta.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-[#f7f7f5]">
          <div className="h-[calc(100vh-97px)] overflow-y-auto">
            <SidebarContent
              pathname={location.pathname}
              onNavigate={() => setIsOpen(false)}
              onOpenWallet={() => {
                setIsOpen(false);
                onOpenWallet();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DesktopHeader() {
  const location = useLocation();
  const meta = getShellMeta(location.pathname);

  return (
    <header className="hidden border-b border-slate-200 bg-[#fcfcfb] px-8 py-5 md:block">
      <div className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Operations</p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">{meta.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, products, customers"
              className="w-80 rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
            />
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,_#111827_0%,_#4338ca_100%)] text-sm font-semibold text-white">
              BD
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-sm font-semibold text-slate-900">BanglaDrop Team</p>
              <p className="text-xs text-slate-500">Store operations</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function WalletModal({ activeGateway, isOpen, onClose, walletSummary }: WalletModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    amount: "",
    note: "",
    transactionId: "",
    senderNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isManualUddoktaPay = activeGateway?.provider === "uddoktapay";

  useEffect(() => {
    if (!isOpen) {
      setForm({
        fullName: "",
        email: "",
        amount: "",
        note: "",
        transactionId: "",
        senderNumber: "",
      });
      setSubmitting(false);
      setError("");
      setSuccess("");
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
    setSuccess("");

    const paymentWindow = isManualUddoktaPay ? null : window.open("", "_blank", "noopener,noreferrer");

    try {
      const data = await apiFetch<{ paymentUrl?: string; message?: string }>("/api/wallet/payout-checkout", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          amount: amountNumber,
          note: form.note,
          transactionId: form.transactionId,
          senderNumber: form.senderNumber,
          currentPath: window.location.pathname,
          provider: activeGateway?.provider,
        })
      });

      if (data.paymentUrl && paymentWindow) {
        paymentWindow.location.href = data.paymentUrl;
        onClose();
        return;
      }

      if (data.paymentUrl) {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
        onClose();
        return;
      }

      setSuccess(data.message || "Payout details recorded successfully.");
      setSubmitting(false);
    } catch (err) {
      if (paymentWindow) {
        paymentWindow.close();
      }
      setError(err instanceof Error ? err.message : "Failed to create payout checkout.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_42px_120px_-52px_rgba(15,23,42,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_340px]">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  <Wallet className="h-3.5 w-3.5" />
                  Supplier Settlement
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Pay the dropshipper</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {isManualUddoktaPay
                    ? "Enter the payout details, send the money manually, then save the transaction ID here."
                    : "Confirm the payout details below and we will launch the configured payment gateway in a new tab."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Dropshipper Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                    placeholder="Rahim Enterprise"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Dropshipper Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount to Pay</label>
                <input
                  type="number"
                  min="1"
                  max={walletSummary.available}
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Payout Note</label>
                <textarea
                  rows={4}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                  placeholder="Optional note for this settlement"
                />
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Active gateway:</span>{" "}
                {activeGateway ? `${activeGateway.label} (${activeGateway.provider})` : "Not configured yet"}
              </div>

              {isManualUddoktaPay ? (
                <>
                  <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    <p className="font-semibold text-slate-900">Send Money details</p>
                    <p className="mt-1">Receiver: {activeGateway?.merchantName || "Not set"}</p>
                    <p className="mt-1">Number: {activeGateway?.credentials?.accountNumber || "Not set"}</p>
                    <p className="mt-1">
                      Instructions: {activeGateway?.credentials?.instructions || "Send money manually, then save the transaction ID below."}
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Transaction ID</label>
                      <input
                        type="text"
                        required={isManualUddoktaPay}
                        value={form.transactionId}
                        onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                        placeholder="Enter transaction ID"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Sender Number</label>
                      <input
                        type="text"
                        value={form.senderNumber}
                        onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                        placeholder="Optional sender mobile number"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {!activeGateway ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Configure and enable a supplier payment gateway in `Settings` before starting this payout.
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
                  disabled={submitting || exceedsBalance || amountNumber <= 0 || !activeGateway || (isManualUddoktaPay && !form.transactionId.trim())}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {isManualUddoktaPay ? "Save Transaction ID" : "Pay To Dropshipper"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-slate-200 bg-[#f7f7f5] p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live Summary</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Available Balance</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">৳ {walletSummary.available}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Payout Amount</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">৳ {amountNumber}</p>
              </div>
              <div className={`rounded-xl border p-4 ${exceedsBalance ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
                <p className={`text-xs uppercase tracking-[0.22em] ${exceedsBalance ? "text-red-500" : "text-emerald-600"}`}>
                  Remaining Balance
                </p>
                <p className={`mt-2 text-3xl font-semibold ${exceedsBalance ? "text-red-700" : "text-slate-950"}`}>
                  ৳ {remainingBalance}
                </p>
                <p className={`mt-2 text-xs ${exceedsBalance ? "text-red-600" : "text-slate-500"}`}>
                  {exceedsBalance
                    ? `This payout exceeds the available balance by ৳ ${amountNumber - walletSummary.available}.`
                    : "The balance preview updates instantly as you edit the amount."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending Profit</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">৳ {walletSummary.pending}</p>
              </div>
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
  const [activeGateway, setActiveGateway] = useState<PaymentGatewaySummary | null>(null);

  useEffect(() => {
    apiFetch<{ profits?: WalletSummary }>("/api/dashboard")
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

    apiFetch<{ gateways: PaymentGatewaySummary[] }>("/api/payment-gateways")
      .then((json) => {
        const selected = json.gateways.find((gateway) => gateway.isEnabled && gateway.isDefault && gateway.isConfigured)
          || json.gateways.find((gateway) => gateway.isEnabled && gateway.isConfigured)
          || null;
        setActiveGateway(selected);
      })
      .catch(() => {
        setActiveGateway(null);
      });
  }, [isWalletOpen]);

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-[#f7f7f5] text-slate-800">
        <Sidebar onOpenWallet={() => setIsWalletOpen(true)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileHeader onOpenWallet={() => setIsWalletOpen(true)} />
          <DesktopHeader />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-8 md:py-6">{children}</div>
          </main>
        </div>
      </div>
      <WalletModal
        activeGateway={activeGateway}
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
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/shop/product/:productId" element={<ShopProduct />} />
        <Route
          path="*"
          element={
            <ProtectedRoute allowedRoles={["admin", "supplier", "super_admin"]}>
              <MainLayout>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/checkout/:productId"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <SupplierTransactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pos"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/transactions"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <SupplierTransactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products/new"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <AdminProductForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products/:productId/edit"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <AdminProductForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/supplier"
                    element={
                      <ProtectedRoute allowedRoles={["supplier", "super_admin"]}>
                        <Supplier />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/supplier/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["supplier", "super_admin"]}>
                        <SupplierDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/supplier/transactions"
                    element={
                      <ProtectedRoute allowedRoles={["supplier", "super_admin"]}>
                        <SupplierTransactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/supplier/settings"
                    element={
                      <ProtectedRoute allowedRoles={["supplier", "super_admin"]}>
                        <SupplierSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
