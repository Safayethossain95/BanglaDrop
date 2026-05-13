import { useEffect, useMemo, useState } from "react";
import { PackageCheck, Printer, Truck, X } from "lucide-react";
import { apiFetch } from "../lib/api";

const supplierStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned", "Paid"] as const;

type SupplierOrder = {
  id: string;
  orderCode?: string;
  productName: string;
  productImage?: string | null;
  category?: string | null;
  description?: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  supplierPrice: number;
  sellPrice: number;
  profit: number;
  status: string;
  date?: string;
  orderSourceSite?: string | null;
  orderSourcePath?: string | null;
  placedBy?: {
    name: string;
    email: string;
  } | null;
  assignedSupplier?: {
    name: string;
    email: string;
  } | null;
};

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

function formatCurrency(value: number) {
  return `BDT ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

function InvoiceModal({
  order,
  onClose,
}: {
  order: SupplierOrder;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_40px_120px_-48px_rgba(15,23,42,0.55)] print:max-h-none print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 print:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Supplier Invoice</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Compact Packing Copy</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-65px)] overflow-y-auto p-4 print:max-h-none print:overflow-visible print:p-0">
          <div className="border border-slate-300 bg-white text-slate-900 print:border-slate-400">
            <div className="grid gap-3 border-b border-slate-300 px-4 py-3 print:gap-2 print:px-3 print:py-2 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">BanglaDrop Fulfillment</p>
                <h3 className="mt-1 text-lg font-bold">Packing Invoice</h3>
                <p className="mt-1 text-xs text-slate-600 print:hidden">Low-space supplier copy for dispatch and handoff.</p>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs print:gap-x-2 print:gap-y-0.5">
                <span className="font-semibold text-slate-500">Invoice</span>
                <span className="text-right font-mono">{order.orderCode || order.id}</span>
                <span className="font-semibold text-slate-500">Date</span>
                <span className="text-right">{formatDate(order.date)}</span>
                <span className="font-semibold text-slate-500">Status</span>
                <span className="text-right font-semibold">{order.status}</span>
                <span className="font-semibold text-slate-500">Site</span>
                <span className="truncate text-right">{order.orderSourceSite || "BanglaDrop"}</span>
              </div>
            </div>

            <div className="grid print:grid-cols-[1.35fr_0.65fr] md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-300 md:border-b-0 md:border-r">
                <div className="grid text-xs print:grid-cols-[1.2fr_0.8fr] md:grid-cols-2">
                  <div className="border-b border-slate-200 p-3 print:border-b-0 print:p-2 md:border-b-0 md:border-r">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Customer</p>
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="mt-0.5">{order.customerPhone}</p>
                    <p className="mt-2 leading-5 text-slate-700 print:mt-1 print:leading-4">{order.address}</p>
                  </div>
                  <div className="p-3 print:p-2">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">People</p>
                    <p className="font-semibold">{order.placedBy?.name || "BanglaDrop Team"}</p>
                    <p className="mt-0.5 text-slate-600">{order.placedBy?.email || "Not available"}</p>
                    <p className="mt-2 font-semibold">{order.assignedSupplier?.name || "Current supplier"}</p>
                    <p className="mt-0.5 text-slate-600">{order.assignedSupplier?.email || "Not available"}</p>
                  </div>
                </div>

                <div className="border-t border-slate-300">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_54px_110px_110px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 print:px-2 print:py-1.5">
                    <span>Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Cost</span>
                    <span className="text-right">Sale</span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1.6fr)_54px_110px_110px] gap-2 px-3 py-3 text-xs print:px-2 print:py-2">
                    <div className="flex gap-3">
                      {order.productImage ? (
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="h-14 w-14 shrink-0 rounded-md border border-slate-200 object-cover print:hidden"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-semibold leading-5">{order.productName}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{order.category || "General"}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-600 print:hidden">{order.description || "No description available."}</p>
                        <p className="mt-1 break-all text-[10px] text-slate-500 print:hidden">{order.orderSourcePath || "Source path not recorded"}</p>
                      </div>
                    </div>
                    <div className="text-center font-semibold">1</div>
                    <div className="text-right font-semibold">{formatCurrency(order.supplierPrice)}</div>
                    <div className="text-right font-semibold">{formatCurrency(order.sellPrice)}</div>
                  </div>
                </div>

                <div className="border-t border-slate-300 px-3 py-2 text-[11px] leading-5 text-slate-600 print:px-2 print:py-1.5 print:text-[10px] print:leading-4">
                  <span className="font-bold uppercase tracking-[0.16em] text-slate-500">Note:</span>{" "}
                  Verify customer details before dispatch. Keep this copy with the parcel.
                </div>
              </div>

              <div className="bg-slate-50">
                <div className="border-b border-slate-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 print:px-2 print:py-1.5">
                  Payment Summary
                </div>
                <div className="space-y-2 px-3 py-3 text-xs print:space-y-1.5 print:px-2 print:py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Retail price</span>
                    <span className="font-semibold">{formatCurrency(order.sellPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Supplier cost</span>
                    <span className="font-semibold">{formatCurrency(order.supplierPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Profit</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(order.profit)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-[0.16em] text-slate-700">COD Collect</span>
                      <span className="text-base font-bold">{formatCurrency(order.sellPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-300 px-3 py-3 text-xs print:hidden">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Quick Facts</p>
                  <div className="mt-2 space-y-1.5 text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span>Phone</span>
                      <span className="font-medium text-slate-900">{order.customerPhone}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Site</span>
                      <span className="font-medium text-slate-900">{order.orderSourceSite || "BanglaDrop"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Category</span>
                      <span className="font-medium text-slate-900">{order.category || "General"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Supplier() {
  const [data, setData] = useState<{ orders: SupplierOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);

  const fetchOrders = () => {
    apiFetch<{ orders: SupplierOrder[] }>("/api/dashboard").then((json) => {
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
    }).then(() => {
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
              Click an order row to open its invoice, review source details, and print it for delivery.
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
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.productName}</div>
                      <div className="mt-1 text-xs text-slate-500">Retail price BDT {order.sellPrice}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{order.orderCode || order.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="max-w-[240px] px-5 py-4 text-slate-500">{order.address}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">BDT {order.supplierPrice}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">BDT {order.profit}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => updateStatus(order.id, event.target.value)}
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

      {selectedOrder ? <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} /> : null}
    </div>
  );
}
