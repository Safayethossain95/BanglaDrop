import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CircleDollarSign, PackageCheck, RotateCcw, Wallet } from "lucide-react";
import { BarChartCard, DonutChartCard } from "../components/dashboardCharts";
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

function getSettlementStatusClasses(status: string) {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
  if (status === "FAILED") return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
}

function getGatewayLabel(provider: string) {
  if (provider === "bkash") return "bKash";
  if (provider === "uddoktapay") return "Send Money";
  return provider;
}

type DashboardData = {
  profits: { total: number; pending: number; available: number };
  orders: Array<{
    id: string;
    productName: string;
    customerName: string;
    customerPhone: string;
    profit: number;
    status: string;
  }>;
};

type SettlementRecord = {
  id: string;
  provider: string;
  amount: number;
  status: string;
  gateway_payment_id: string | null;
  beneficiary_name: string;
  beneficiary_email: string;
  created_at: string;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardData>("/api/dashboard")
      .then((json) => {
        setData(json);
        setLoading(false);
      });

    apiFetch<{ settlements: SettlementRecord[] }>("/api/settlements")
      .then((json) => {
        setSettlements(json.settlements || []);
      })
      .catch(() => {
        setSettlements([]);
      });
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const deliveredOrders = data.orders.filter((order) => order.status === "Delivered");
    const returnedOrders = data.orders.filter((order) => order.status === "Returned");
    const activeOrders = data.orders.filter((order) =>
      ["Pending", "Confirmed", "Packed", "Shipped"].includes(order.status),
    );

    const statusMix = [
      { label: "Pending", value: data.orders.filter((order) => order.status === "Pending").length, color: "#f59e0b" },
      { label: "Confirmed", value: data.orders.filter((order) => order.status === "Confirmed").length, color: "#0ea5e9" },
      { label: "Packed", value: data.orders.filter((order) => order.status === "Packed").length, color: "#8b5cf6" },
      { label: "Shipped", value: data.orders.filter((order) => order.status === "Shipped").length, color: "#6366f1" },
      { label: "Delivered", value: deliveredOrders.length, color: "#10b981" },
      { label: "Returned", value: returnedOrders.length, color: "#f43f5e" },
    ].filter((item) => item.value > 0);

    const profitBars = [
      { label: "Available", value: data.profits.available, color: "linear-gradient(180deg, #0f172a 0%, #334155 100%)" },
      { label: "Pending", value: data.profits.pending, color: "linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)" },
      { label: "Total", value: data.profits.total, color: "linear-gradient(180deg, #10b981 0%, #34d399 100%)" },
      { label: "Active", value: activeOrders.length, color: "linear-gradient(180deg, #6366f1 0%, #818cf8 100%)" },
    ];

    return {
      deliveredOrders,
      returnedOrders,
      activeOrders,
      returnRate: data.orders.length > 0 ? Math.round((returnedOrders.length / data.orders.length) * 100) : 0,
      statusMix,
      profitBars,
    };
  }, [data]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)]">
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1.2fr)_340px] md:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Personal overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Your COD business, cleaned up</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track payout availability, recent order flow, and fulfillment movement from one professional workspace.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-[#fcfcfb] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Available Payout</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">৳ {data.profits.available}</p>
                <p className="mt-1 text-xs text-emerald-600">Ready to withdraw now</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#fcfcfb] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending Profit</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">৳ {data.profits.pending}</p>
                <p className="mt-1 text-xs text-slate-500">Waiting on delivery completion</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#fcfcfb] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total Orders</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{data.orders.length}</p>
                <p className="mt-1 text-xs text-slate-500">All customer orders in your feed</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-[#fcfcfb] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Return Rate</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.returnRate}%</p>
                <p className="mt-1 text-xs text-slate-500">Returned share of order volume</p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Snapshot</p>
                <h2 className="mt-2 text-xl font-semibold">Business health</h2>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Active Orders</span>
                  <span className="font-semibold text-white">{metrics.activeOrders.length}</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Delivered</span>
                  <span className="font-semibold text-emerald-300">{metrics.deliveredOrders.length}</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Returned</span>
                  <span className="font-semibold text-rose-300">{metrics.returnedOrders.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Profit Pool</p>
                <p className="mt-2 text-xl font-semibold">৳ {data.profits.total}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/15 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">Withdrawable</p>
                <p className="mt-2 text-xl font-semibold text-emerald-300">৳ {data.profits.available}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Available Balance</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">৳ {data.profits.available}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Delivered Orders</span>
            <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
              <PackageCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{metrics.deliveredOrders.length}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Pending Profit</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <CircleDollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">৳ {data.profits.pending}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Returns</span>
            <span className="rounded-lg bg-rose-50 p-2 text-rose-700">
              <RotateCcw className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{metrics.returnedOrders.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChartCard
          title="Profit Breakdown"
          subtitle="Compare the current payout stack against active order load."
          data={metrics.profitBars}
          valuePrefix="৳ "
        />
        <DonutChartCard
          title="Order Status Mix"
          subtitle="A quick visual read of where your orders currently sit."
          centerLabel="Total Orders"
          centerValue={String(data.orders.length)}
          data={metrics.statusMix}
        />
      </section>

      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Recent orders</h2>
            <p className="mt-1 text-sm text-slate-500">The latest orders linked to your sales activity.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {data.orders.length} total
          </div>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No orders yet. Orders will appear here as soon as sales begin.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[#fcfcfb] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-900">{order.productName}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{order.id}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">৳ {order.profit}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">Managed by supplier</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Received payouts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the recorded amount, transaction ID, and payout status submitted by the sender.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {settlements.length} records
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No payout records found for this receiver yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#fcfcfb] text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Gateway</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Receiver</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                      {new Date(settlement.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {getGatewayLabel(settlement.provider)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">BDT {settlement.amount}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{settlement.beneficiary_name}</div>
                      <div className="mt-1 text-xs text-slate-500">{settlement.beneficiary_email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {settlement.gateway_payment_id || "Not submitted"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSettlementStatusClasses(settlement.status)}`}
                      >
                        {settlement.status}
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
