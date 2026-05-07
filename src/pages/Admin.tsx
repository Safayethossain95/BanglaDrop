import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function Admin() {
  const [data, setData] = useState<{
    orders: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    fetch("/api/dashboard") // Using the same endpoint since it returns orders
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchDashboard();
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
          <ShieldAlert className="w-8 h-8 text-teal-600" />
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">Manage orders across the platform and update their status.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">All Orders Operations</h2>
        </div>
        
        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No orders have been placed on the platform yet.
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
                  <th className="p-4 font-medium">Status Control</th>
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
                    <td className="p-4 text-slate-600 align-top max-w-[200px] truncate">
                      {order.address}
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-slate-500 text-xs">Sell: ৳ {order.sellPrice}</div>
                      <div className="text-slate-500 text-xs">Cost: ৳ {order.supplierPrice}</div>
                      <div className="font-bold text-teal-700 mt-1">Profit: ৳ {order.profit}</div>
                    </td>
                    <td className="p-4 align-top">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wide border rounded-md px-3 py-2 outline-none transition-colors 
                          ${order.status === 'Placed' ? 'bg-orange-50 border-orange-200 text-orange-700 focus:border-orange-500' : ''}
                          ${order.status === 'Delivered' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-500' : ''}
                          ${order.status === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500' : ''}
                        `}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Paid">Paid</option>
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
