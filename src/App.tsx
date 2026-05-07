/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Package, LayoutDashboard, Store, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import ShopProduct from "./pages/ShopProduct";

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/", name: "POS", icon: Store },
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">BongoDrop</h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
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
        <div className="bg-teal-50 p-4 rounded-xl">
          <p className="text-xs text-teal-600 font-semibold uppercase mb-1">Profit Balance</p>
          <p className="text-xl font-bold text-slate-900">COD Settlement</p>
          <button className="mt-3 w-full bg-teal-600 hover:bg-teal-700 transition-colors text-white text-sm py-2 rounded-lg font-medium">View Wallet</button>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuItems = [
    { path: "/", name: "POS", icon: Store },
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="md:hidden bg-white border-b border-slate-200 relative shrink-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">BongoDrop</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 z-50">
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
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
        <h2 className="text-lg font-bold text-slate-900">Welcome to BongoDrop!</h2>
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

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#F8FAFC] font-sans text-slate-800 h-screen w-screen overflow-hidden">
      <Sidebar />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/product/:productId" element={<ShopProduct />} />
        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/checkout/:productId" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

