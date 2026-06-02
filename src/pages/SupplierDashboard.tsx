import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Box,
  CheckCheck,
  CircleDollarSign,
  LayoutList,
  PackageCheck,
  Truck,
} from "lucide-react";
import { BarChartCard, DonutChartCard } from "../components/dashboardCharts";
import { apiFetch } from "../lib/api";

type DashboardData = {
  orders: Array<{
    id: string;
    order_code: string;
    product_id: string;
    product_name: string;  // maps to your productName
    product_image: string;
    category: string;
    description: string;
    order_source_site: string;
    order_source_path: string;
    customer_name: string;  // maps to your customerName
    customer_phone: string; // maps to your customerPhone
    address: string;
    supplier_price: number;  // matches your supplierPrice
    sell_price: number;     // matches your sellPrice
    profit: number;         // matches your profit
    status: string;         // matches your status
    placed_by: string | null;
    placed_by_name: string | null;
    placed_by_email: string | null;
    assigned_supplier_id: string | null;
    assigned_supplier_name: string | null;
    assigned_supplier_email: string | null;
    status_updated_by: string | null;
    status_updated_at: string;
    created_at: string;
    date?: string;          // You might need to map this from created_at
  }>;
};

// If you want to keep the exact same property names as before, create a mapper:
type FormattedOrder = {
  id: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  profit: number;
  sellPrice: number;
  supplierPrice: number;
  status: string;
  date: string;
};

type FormattedDashboardData = {
  profits: { total: number; pending: number; available: number };
  orders: FormattedOrder[];
};

// Helper function to transform API response to your format
function transformDashboardData(apiResponse: { orders: any[] }): FormattedDashboardData {
  // Calculate profits from orders
  const totalProfit = apiResponse.orders.reduce((sum, order) => sum + (order.profit || 0), 0);
  const pendingProfit = apiResponse.orders
    .filter(order => order.status === 'Pending')
    .reduce((sum, order) => sum + (order.profit || 0), 0);
  const availableProfit = apiResponse.orders
    .filter(order => order.status === 'Delivered' || order.status === 'Paid')
    .reduce((sum, order) => sum + (order.profit || 0), 0);

  return {
    profits: {
      total: totalProfit,
      pending: pendingProfit,
      available: availableProfit
    },
    orders: apiResponse.orders.map(order => ({
      id: order.id,
      productName: order.product_name,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      profit: order.profit,
      sellPrice: order.sell_price,
      supplierPrice: order.supplier_price,
      status: order.status,
      date: order.created_at || order.date
    }))
  };
}




function getStatusClasses(status: string) {
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  if (status === "Confirmed") return "bg-sky-100 text-sky-700";
  if (status === "Packed") return "bg-violet-100 text-violet-700";
  if (status === "Shipped") return "bg-indigo-100 text-indigo-700";
  if (status === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (status === "Returned") return "bg-rose-100 text-rose-700";
  if (status === "Paid") return "bg-lime-100 text-lime-700";
  return "bg-slate-100 text-slate-700";
}

const pipelineStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned", "Paid"];

export default function SupplierDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

 // Usage in your component:
useEffect(() => {
  apiFetch<{ orders: any[] }>("/api/orders")
    .then((json) => {
      const formattedData = transformDashboardData(json);
      setData(formattedData);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });
}, []);

  const metrics = useMemo(() => {
    if (!data) return null;

    const pendingOrders = data.orders.filter((order) => order.status === "Pending");
    const confirmedOrders = data.orders.filter((order) => order.status === "Confirmed");
    const packedOrders = data.orders.filter((order) => order.status === "Packed");
    const shippedOrders = data.orders.filter((order) => order.status === "Shipped");
    const deliveredOrders = data.orders.filter((order) => order.status === "Delivered");
    const returnedOrders = data.orders.filter((order) => order.status === "Returned");
    const paidOrders = data.orders.filter((order) => order.status === "Paid");
    const openOrders = data.orders.filter((order) =>
      ["Pending", "Confirmed", "Packed", "Shipped"].includes(order.status),
    );
    const totalRevenue = data.orders.reduce((sum, order) => sum + order.sellPrice, 0);
    const totalCost = data.orders.reduce((sum, order) => sum + order.supplierPrice, 0);
    const collectedValue = paidOrders.reduce((sum, order) => sum + order.sellPrice, 0);
    const returnRate = data.orders.length > 0 ? Math.round((returnedOrders.length / data.orders.length) * 100) : 0;

    const pipelineBars = [
      { label: "Pending", value: pendingOrders.length, color: "linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)" },
      { label: "Packed", value: packedOrders.length, color: "linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%)" },
      { label: "Shipped", value: shippedOrders.length, color: "linear-gradient(180deg, #6366f1 0%, #818cf8 100%)" },
      { label: "Paid", value: paidOrders.length, color: "linear-gradient(180deg, #10b981 0%, #34d399 100%)" },
    ];

    const pipelineMix = [
      { label: "Pending", value: pendingOrders.length, color: "#f59e0b" },
      { label: "Confirmed", value: confirmedOrders.length, color: "#0ea5e9" },
      { label: "Packed", value: packedOrders.length, color: "#8b5cf6" },
      { label: "Shipped", value: shippedOrders.length, color: "#6366f1" },
      { label: "Delivered", value: deliveredOrders.length, color: "#10b981" },
      { label: "Returned", value: returnedOrders.length, color: "#f43f5e" },
      { label: "Paid", value: paidOrders.length, color: "#84cc16" },
    ].filter((item) => item.value > 0);

    return {
      pendingOrders,
      confirmedOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      returnedOrders,
      paidOrders,
      openOrders,
      totalRevenue,
      totalCost,
      collectedValue,
      returnRate,
      pipelineBars,
      pipelineMix,
    };
  }, [data]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  const latestOrders = data.orders.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[20px] border border-[#d7e3db] bg-[linear-gradient(135deg,_#f6faf7_0%,_#edf7f0_48%,_#ffffff_100%)] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.3fr)_340px] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              <Truck className="h-3.5 w-3.5" />
              Supplier Operations
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Fulfillment pipeline in one view
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Track shipment progress, payment completion, and open processing load from a supplier-focused dashboard with the same polished Shopify-style rhythm as admin.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Open Queue</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.openOrders.length}</p>
                <p className="mt-1 text-xs text-slate-500">Orders waiting to move through the pipeline</p>
              </div>
              <div className="rounded-xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Paid Orders</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.paidOrders.length}</p>
                <p className="mt-1 text-xs text-slate-500">Orders fully completed and collected</p>
              </div>
              <div className="rounded-xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Collected Value</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">৳ {metrics.collectedValue}</p>
                <p className="mt-1 text-xs text-emerald-700">Cash value captured from paid orders</p>
              </div>
              <div className="rounded-xl border border-white bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Return Rate</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.returnRate}%</p>
                <p className="mt-1 text-xs text-slate-500">Share of orders marked returned</p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Supplier Snapshot</p>
                <h2 className="mt-2 text-xl font-bold">Processing Health</h2>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <LayoutList className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Pending Review</span>
                  <span className="font-bold text-amber-300">{metrics.pendingOrders.length}</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Packed Orders</span>
                  <span className="font-bold text-violet-300">{metrics.packedOrders.length}</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">In Transit</span>
                  <span className="font-bold text-indigo-300">{metrics.shippedOrders.length}</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Delivered</span>
                  <span className="font-bold text-emerald-300">{metrics.deliveredOrders.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Confirmed</span>
            <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
              <CheckCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.confirmedOrders.length}</p>
          <p className="mt-1 text-xs text-slate-500">Approved and ready for warehouse action</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Packed</span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
              <Box className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.packedOrders.length}</p>
          <p className="mt-1 text-xs text-slate-500">Prepared and staged for handoff</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Delivered</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{metrics.deliveredOrders.length}</p>
          <p className="mt-1 text-xs text-slate-500">Reached the customer doorstep</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Supplier Value</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">৳ {metrics.totalCost}</p>
          <p className="mt-1 text-xs text-slate-500">Current supplier-side goods value</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChartCard
          title="Pipeline Throughput"
          subtitle="A visual read of the queue from pending to paid."
          data={metrics.pipelineBars}
        />
        <DonutChartCard
          title="Pipeline Status Mix"
          subtitle="See how supplier workload is distributed across all order stages."
          centerLabel="Paid Orders"
          centerValue={String(metrics.paidOrders.length)}
          data={metrics.pipelineMix}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Fulfillment Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest supplier-relevant orders and where they stand.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {latestOrders.length} most recent
              </div>
            </div>

            {latestOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No supplier activity yet. Orders will appear here as they arrive.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="p-4 font-medium">Order</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Cost</th>
                      <th className="p-4 font-medium">Sale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {latestOrders.map((order) => (
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
                        <td className="p-4 font-medium text-slate-900">৳ {order.supplierPrice}</td>
                        <td className="p-4 font-medium text-emerald-700">৳ {order.sellPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pipeline Breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">See where orders are sitting in the supplier workflow.</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Truck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {pipelineStatuses.map((status) => {
                const count = data.orders.filter((order) => order.status === status).length;
                const width = data.orders.length > 0 ? (count / data.orders.length) * 100 : 0;
                const barColor =
                  status === "Pending" ? "bg-amber-400" :
                  status === "Confirmed" ? "bg-sky-400" :
                  status === "Packed" ? "bg-violet-400" :
                  status === "Shipped" ? "bg-indigo-400" :
                  status === "Delivered" ? "bg-emerald-400" :
                  status === "Returned" ? "bg-rose-400" :
                  "bg-lime-400";

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{status}</span>
                      <span className="text-slate-500">{count} orders</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${width}%` }} />
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
