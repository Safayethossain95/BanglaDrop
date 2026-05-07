import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<{
    profits: { total: number; pending: number; available: number };
    orders: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Track your cash-on-delivery orders and profit payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm mb-1">Available Payout</p>
            <p className="text-2xl font-bold text-slate-900">৳ {data.profits.available}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm mb-1">Pending Profit</p>
            <p className="text-2xl font-bold text-slate-900">৳ {data.profits.pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{data.orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
             <p className="text-slate-500 text-sm mb-1">Return Rate</p>
             <p className="text-2xl font-bold text-red-500">2.4%</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        </div>
        
        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No orders yet. Place an order from the Products Map to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Your Profit</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-600">{order.id}</td>
                    <td className="p-4 font-medium text-slate-900">{order.productName}</td>
                    <td className="p-4">
                      <div className="text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      {order.status === "Placed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide">
                          Placed
                        </span>
                      )}
                      {order.status === "Delivered" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                          Delivered
                        </span>
                      )}
                      {order.status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-teal-700">৳ {order.profit}</span>
                    </td>
                    <td className="p-4">
                       <span className="text-xs text-slate-400 italic">Managed by Admin</span>
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
