import { useEffect, useMemo, useState } from "react";
import { ListFilter, ShieldAlert } from "lucide-react";
import { apiFetch } from "../lib/api";

function getStatusClasses(status: string) {
  if (status === "Pending") return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
  if (status === "Confirmed") return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100";
  if (status === "Packed") return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100";
  if (status === "Shipped") return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100";
  if (status === "Delivered") return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100";
  if (status === "Returned") return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100";
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
}

export default function Admin() {
  const [data, setData] = useState<{ orders: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ orders: any[] }>("/api/dashboard")
      .then((json) => {
        setData(json);
        setLoading(false);
        console.log(json)
      });
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      total: data.orders.length,
      pending: data.orders.filter((order) => order.status === "Pending").length,
      delivered: data.orders.filter((order) => order.status === "Delivered").length,
      returned: data.orders.filter((order) => order.status === "Returned").length,
    };
  }, [data]);

  if (loading || !data || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total Orders</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.total}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.pending}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Delivered</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.delivered}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Returned</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.returned}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              <ShieldAlert className="h-3.5 w-3.5" />
              Order oversight
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">All platform orders</h1>
            <p className="mt-2 text-sm text-slate-500">
              A cleaner operations table for reviewing customers, delivery status, and margin outcome.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#fcfcfb] px-4 py-3 text-sm text-slate-500">
            <ListFilter className="h-4 w-4" />
            Live feed
          </div>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No orders have been placed on the platform yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-[#fcfcfb] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product image</th>
                  <th className="px-5 py-4 v">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Sell Price</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <img className="w-10 h-full object-cover" src={order.productImage} alt={order.productName} />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 max-w-35">{order.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-4 max-w-[260px] text-slate-500">{order.address}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">৳ {order.sellPrice}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">৳ {order.profit}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
