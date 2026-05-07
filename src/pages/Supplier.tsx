import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";

const supplierStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned", "Paid"] as const;

function getStatusClasses(status: string) {
  if (status === "Pending") return "bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-500";
  if (status === "Confirmed") return "bg-sky-50 border-sky-200 text-sky-700 focus:border-sky-500";
  if (status === "Packed") return "bg-violet-50 border-violet-200 text-violet-700 focus:border-violet-500";
  if (status === "Shipped") return "bg-indigo-50 border-indigo-200 text-indigo-700 focus:border-indigo-500";
  if (status === "Delivered") return "bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500";
  if (status === "Returned") return "bg-rose-50 border-rose-200 text-rose-700 focus:border-rose-500";
  if (status === "Paid") return "bg-lime-50 border-lime-200 text-lime-700 focus:border-lime-500";
  return "bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-500";
}

export default function Supplier() {
  const [data, setData] = useState<{
    orders: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchOrders();
      });
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <PackageCheck className="w-8 h-8 text-teal-600" />
          Supplier Orders
        </h1>
        <p className="text-slate-500 mt-2">Manage order fulfillment and update each shipment through the delivery pipeline.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Order Processing Queue</h2>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No orders are waiting in the supplier queue yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Product & Customer</th>
                  <th className="p-4 font-medium">Address</th>
                  <th className="p-4 font-medium">Pricing</th>
                  <th className="p-4 font-medium">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-600 align-top">{order.id}</td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900 mb-1">{order.productName}</div>
                      <div className="text-slate-700">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-4 text-slate-600 align-top max-w-[220px] truncate">{order.address}</td>
                    <td className="p-4 align-top">
                      <div className="text-slate-500 text-xs">Sell: ৳ {order.sellPrice}</div>
                      <div className="text-slate-500 text-xs">Cost: ৳ {order.supplierPrice}</div>
                      <div className="font-bold text-teal-700 mt-1">Profit: ৳ {order.profit}</div>
                    </td>
                    <td className="p-4 align-top">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wide border rounded-md px-3 py-2 outline-none transition-colors ${getStatusClasses(order.status)}`}
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
      </div>
    </div>
  );
}
