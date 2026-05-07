import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

type DashboardData = {
  profits: { total: number; pending: number; available: number };
  orders: Array<{
    id: string;
    productName: string;
    customerName: string;
    customerPhone: string;
    profit: number;
    sellPrice: number;
    supplierPrice: number;
    status: string;
    date: string;
  }>;
};

function getStatusClasses(status: string) {
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  if (status === "Confirmed") return "bg-sky-100 text-sky-700";
  if (status === "Packed") return "bg-violet-100 text-violet-700";
  if (status === "Shipped") return "bg-indigo-100 text-indigo-700";
  if (status === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (status === "Returned") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;

    const deliveredOrders = data.orders.filter((order) => order.status === "Delivered");
    const returnedOrders = data.orders.filter((order) => order.status === "Returned");
    const pendingOrders = data.orders.filter((order) =>
      ["Pending", "Confirmed", "Packed", "Shipped"].includes(order.status),
    );
    const confirmedOrders = data.orders.filter((order) => order.status === "Confirmed");
    const totalRevenue = data.orders.reduce((sum, order) => sum + order.sellPrice, 0);
    const totalCost = data.orders.reduce((sum, order) => sum + order.supplierPrice, 0);
    const averageOrderValue = data.orders.length > 0 ? Math.round(totalRevenue / data.orders.length) : 0;
    const fulfillmentRate =
      data.orders.length > 0 ? Math.round((deliveredOrders.length / data.orders.length) * 100) : 0;
    const returnRate = data.orders.length > 0 ? Math.round((returnedOrders.length / data.orders.length) * 100) : 0;

    return {
      deliveredOrders,
      returnedOrders,
      pendingOrders,
      confirmedOrders,
      totalRevenue,
      totalCost,
      averageOrderValue,
      fulfillmentRate,
      returnRate,
    };
  }, [data]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const recentOrders = data.orders.slice(0, 5);
  const topProfitableOrders = [...data.orders].sort((a, b) => b.profit - a.profit).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[#d7e3db] bg-[linear-gradient(135deg,_#f6faf7_0%,_#edf7f0_48%,_#ffffff_100%)] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.3fr)_340px] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Command Center
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Store performance at a glance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Monitor profits, fulfillment health, and recent order movement from a central dashboard designed with a clean Shopify-style operations rhythm.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Net Profit</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {data.profits.total}</p>
                <p className="mt-1 text-xs text-emerald-700">Delivered orders converted into profit</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Available Balance</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {data.profits.available}</p>
                <p className="mt-1 text-xs text-slate-500">Ready for settlement and payout</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pending Profit</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {data.profits.pending}</p>
                <p className="mt-1 text-xs text-slate-500">Currently tied to in-flight fulfillment</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">AOV</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {metrics.averageOrderValue}</p>
                <p className="mt-1 text-xs text-slate-500">Average order selling value</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Executive Snapshot</p>
                <h2 className="mt-2 text-xl font-bold">Operations Health</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <ChartNoAxesCombined className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Total Orders</span>
                  <span className="font-bold text-white">{data.orders.length}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Fulfillment Rate</span>
                  <span className="font-bold text-emerald-300">{metrics.fulfillmentRate}%</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Return Rate</span>
                  <span className="font-bold text-rose-300">{metrics.returnRate}%</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Awaiting Supplier Action</span>
                  <span className="font-bold text-amber-300">{metrics.pendingOrders.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Revenue vs Cost</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-300">Revenue</p>
                  <p className="mt-1 text-xl font-bold">৳ {metrics.totalRevenue}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-300" />
                <div className="text-right">
                  <p className="text-sm text-slate-300">Cost</p>
                  <p className="mt-1 text-xl font-bold">৳ {metrics.totalCost}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Delivered Orders</span>
                <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
                  <PackageCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.deliveredOrders.length}</p>
              <p className="mt-1 text-xs text-slate-500">Completed and settled successfully</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Confirmed Orders</span>
                <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">
                  <Boxes className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.confirmedOrders.length}</p>
              <p className="mt-1 text-xs text-slate-500">Approved and queued for fulfillment</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Returns</span>
                <div className="rounded-2xl bg-rose-50 p-2 text-rose-700">
                  <RotateCcw className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.returnedOrders.length}</p>
              <p className="mt-1 text-xs text-slate-500">Orders reversed after delivery flow</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Gross Margin Pool</span>
                <div className="rounded-2xl bg-amber-50 p-2 text-amber-700">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">৳ {data.profits.total + data.profits.pending}</p>
              <p className="mt-1 text-xs text-slate-500">Delivered plus in-transit profit</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Order Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest orders and their current fulfillment stage.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {recentOrders.length} most recent
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No orders yet. Activity will appear here once sales begin.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="p-4 font-medium">Order</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Revenue</th>
                      <th className="p-4 font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{order.productName}</div>
                          <div className="mt-1 font-mono text-xs text-slate-400">{order.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-900">{order.customerName}</div>
                          <div className="mt-1 text-xs text-slate-500">{order.customerPhone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClasses(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-900">৳ {order.sellPrice}</td>
                        <td className="p-4 font-bold text-teal-700">৳ {order.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Top Profit Orders</h2>
                <p className="mt-1 text-sm text-slate-500">Highest contribution orders in the current dataset.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {topProfitableOrders.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No order profit data yet.</div>
              ) : (
                topProfitableOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{order.productName}</p>
                        <p className="mt-1 text-xs text-slate-500">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Profit</p>
                        <p className="mt-1 font-bold text-emerald-700">৳ {order.profit}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Status Breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Track where orders are currently sitting in the fulfillment pipeline.</p>

            <div className="mt-5 space-y-4">
              {["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned"].map((status) => {
                const count = data.orders.filter((order) => order.status === status).length;
                const width = data.orders.length > 0 ? (count / data.orders.length) * 100 : 0;

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{status}</span>
                      <span className="text-slate-500">{count} orders</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${status === "Pending" ? "bg-amber-400" : ""}${status === "Confirmed" ? "bg-sky-400" : ""}${status === "Packed" ? "bg-violet-400" : ""}${status === "Shipped" ? "bg-indigo-400" : ""}${status === "Delivered" ? "bg-emerald-400" : ""}${status === "Returned" ? "bg-rose-400" : ""}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
