import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getStoredUser } from "../lib/auth";
import { useLocation } from "react-router-dom";

type SettlementRecord = {
  id: string;
  provider: string;
  beneficiary_name: string;
  beneficiary_email: string;
  amount: number;
  status: string;
  gateway_payment_id: string | null;
  gateway_response: {
    receiverName?: string | null;
    receiverNumber?: string | null;
  };
  created_at: string;
};

function getStatusClasses(status: string) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "RECEIVED") return "bg-sky-100 text-sky-700";
  if (status === "NOT_RECEIVED") return "bg-rose-100 text-rose-700";
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  if (status === "FAILED") return "bg-rose-100 text-rose-700";
  if (status === "CANCELLED") return "bg-slate-200 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function getGatewayLabel(provider: string) {
  if (provider === "bkash") return "bKash";
  if (provider === "uddoktapay") return "Send Money";
  return provider;
}

export default function SupplierTransactions() {
  const [transactions, setTransactions] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const user = getStoredUser();
  const location = useLocation();
  const isAdminViewer = user?.role === "admin" || location.pathname.startsWith("/admin");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const allowComplete = user?.role === "supplier" || (user?.role === "super_admin" && !isAdminRoute);
  const pageTitle = isAdminViewer ? "Transaction log" : "Supplier transaction log";
  const emptyMessage = isAdminViewer
    ? "No transaction records found yet."
    : "No supplier transactions recorded yet.";

  const loadTransactions = () => {
    apiFetch<{ settlements: SettlementRecord[] }>("/api/settlements")
      .then((json) => {
        setTransactions(json.settlements || []);
        setUpdatingId(null);
        setLoading(false);
      })
      .catch(() => {
        setTransactions([]);
        setUpdatingId(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleStatusChange = async (settlementId: string, status: string) => {
    setUpdatingId(settlementId);

    try {
      await apiFetch(`/api/settlements/${settlementId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadTransactions();
    } catch (_error) {
      setUpdatingId(null);
      loadTransactions();
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allowed = allowComplete
      ? ["RECEIVED", "NOT_RECEIVED", "COMPLETED"]
      : ["RECEIVED", "NOT_RECEIVED"];

    return [currentStatus, ...allowed.filter((status) => status !== currentStatus)];
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[20px] border border-[#d7e3db] bg-[linear-gradient(135deg,_#f6faf7_0%,_#edf7f0_48%,_#ffffff_100%)] shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="px-6 py-7 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Transactions
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{pageTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Review recorded payout details, including the amount and submitted transaction ID.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Gateway</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Receiver</th>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="align-top">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                      {new Date(transaction.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{getGatewayLabel(transaction.provider)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">BDT {transaction.amount}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {transaction.gateway_response?.receiverName || transaction.beneficiary_name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {transaction.gateway_response?.receiverNumber || transaction.beneficiary_email}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {transaction.gateway_payment_id || "Not submitted"}
                    </td>
                    <td className="px-5 py-4">
                      {["FAILED", "CANCELLED", "COMPLETED"].includes(transaction.status) ? (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      ) : (
                        <select
                          value={transaction.status}
                          disabled={updatingId === transaction.id}
                          onChange={(event) => handleStatusChange(transaction.id, event.target.value)}
                          className={`w-20 min-w-0 rounded-lg border px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] outline-none transition-all ${getStatusClasses(transaction.status)}`}
                        >
                          {getStatusOptions(transaction.status).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
