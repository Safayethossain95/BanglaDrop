import { useEffect, useMemo, useState } from "react";
import { PackageCheck, Truck } from "lucide-react";
import { apiFetch } from "../lib/api";

const supplierStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned", "Paid"] as const;

function getStatusClasses(status: string) {
  if (status === "Pending") return "bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-400";
  if (status === "Confirmed") return "bg-sky-50 border-sky-200 text-sky-700 focus:border-sky-400";
  if (status === "Packed") return "bg-violet-50 border-violet-200 text-violet-700 focus:border-violet-400";
  if (status === "Shipped") return "bg-indigo-50 border-indigo-200 text-indigo-700 focus:border-indigo-400";
  if (status === "Delivered") return "bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-400";
  if (status === "Returned") return "bg-rose-50 border-rose-200 text-rose-700 focus:border-rose-400";
  if (status === "Paid") return "bg-lime-50 border-lime-200 text-lime-700 focus:border-lime-400";
  return "bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-400";
}

export default function Supplier() {
  const [data, setData] = useState<{ orders: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    apiFetch<{ orders: any[] }>("/api/dashboard")
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    apiFetch(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    })
      .then(() => {
        fetchOrders();
      });
  };

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      open: data.orders.filter((order) =>
        ["Pending", "Confirmed", "Packed", "Shipped"].includes(order.status),
      ).length,
      delivered: data.orders.filter((order) => order.status === "Delivered").length,
      paid: data.orders.filter((order) => order.status === "Paid").length,
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
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Open Queue</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.open}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Delivered</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.delivered}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Paid</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.paid}</p>
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
              <Truck className="h-3.5 w-3.5" />
              Fulfillment queue
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Supplier order pipeline</h1>
            <p className="mt-2 text-sm text-slate-500">
              Update order progress inside a cleaner table built for fast warehouse and delivery operations.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#fcfcfb] px-4 py-3 text-sm text-slate-500">
            <PackageCheck className="h-4 w-4" />
            Status updates enabled
          </div>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No orders are waiting in the supplier queue yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1140px] text-left">
              <thead className="bg-[#fcfcfb] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Supplier Cost</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.productName}</div>
                      <div className="mt-1 text-xs text-slate-500">Retail price ৳ {order.sellPrice}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{order.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-4 max-w-[240px] text-slate-500">{order.address}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">৳ {order.supplierPrice}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">৳ {order.profit}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] outline-none transition-all ${getStatusClasses(order.status)}`}
                      >
                        {supplierStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
