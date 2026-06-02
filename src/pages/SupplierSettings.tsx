import { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, LoaderCircle, Save, Settings2, ShieldCheck, Wallet } from "lucide-react";
import { apiFetch } from "../lib/api";

type GatewayProvider = "bkash" | "uddoktapay" | "nagad" | "sslcommerz";

type GatewayConfig = {
  provider: GatewayProvider;
  label: string;
  isConfigured: boolean;
  isEnabled: boolean;
  isDefault: boolean;
  environment: "sandbox" | "production";
  merchantName: string;
  lastTestedAt: string | null;
  lastTestResult: Record<string, unknown>;
  credentials: {
    username: string;
    password: string;
    appKey: string;
    appSecret: string;
    accountNumber?: string;
    accountType?: string;
    instructions?: string;
  };
};

type GatewayResponse = {
  defaultProvider: GatewayProvider | null;
  gateways: GatewayConfig[];
};

type BkashTestResult = {
  ok: boolean;
  provider: string;
  environment: string;
  expiresAt: string | null;
};

const emptyBkashForm = {
  merchantName: "",
  username: "",
  password: "",
  appKey: "",
  appSecret: "",
  environment: "sandbox" as const,
  isEnabled: true,
  isDefault: true,
};

const emptyUddoktaPayForm = {
  merchantName: "",
  accountNumber: "",
  accountType: "send_money",
  instructions: "",
  isEnabled: false,
  isDefault: false,
};

const BKASH_SANDBOX_GATEWAY_URL = "https://merchantdemo.sandbox.bka.sh/checkout/version/v1.2.0-beta";

export default function SupplierSettings() {
  const [gateways, setGateways] = useState<GatewayConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<GatewayProvider>("bkash");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [form, setForm] = useState(emptyBkashForm);
  const [uddoktaPayForm, setUddoktaPayForm] = useState(emptyUddoktaPayForm);

  const loadGateways = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<GatewayResponse>("/api/payment-gateways");
      setGateways(response.gateways);

      const bkash = response.gateways.find((gateway) => gateway.provider === "bkash");
      if (bkash) {
        setForm({
          merchantName: bkash.merchantName || "",
          username: bkash.credentials.username || "",
          password: bkash.credentials.password || "",
          appKey: bkash.credentials.appKey || "",
          appSecret: bkash.credentials.appSecret || "",
          environment: bkash.environment || "sandbox",
          isEnabled: bkash.isEnabled,
          isDefault: bkash.isDefault || response.defaultProvider === "bkash",
        });
      }

      const uddoktaPay = response.gateways.find((gateway) => gateway.provider === "uddoktapay");
      if (uddoktaPay) {
        setUddoktaPayForm({
          merchantName: uddoktaPay.merchantName || "",
          accountNumber: uddoktaPay.credentials.accountNumber || "",
          accountType: uddoktaPay.credentials.accountType || "send_money",
          instructions: uddoktaPay.credentials.instructions || "",
          isEnabled: uddoktaPay.isEnabled,
          isDefault: uddoktaPay.isDefault || response.defaultProvider === "uddoktapay",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment gateway settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways().catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("gateway") && !params.has("sandboxStatus") && !params.has("sandboxTest")) return;

    params.delete("gateway");
    params.delete("sandboxTest");
    params.delete("sandboxStatus");
    params.delete("message");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    setTestMessage("");

    try {
      if (selectedProvider === "bkash") {
        await apiFetch("/api/payment-gateways/bkash/config", {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setSuccess("bKash sandbox settings saved. This gateway is now ready for payout checkout.");
      } else if (selectedProvider === "uddoktapay") {
        await apiFetch("/api/payment-gateways/uddoktapay/config", {
          method: "PUT",
          body: JSON.stringify(uddoktaPayForm),
        });
        setSuccess("Send Money settings saved. Suppliers can now save the sent amount and transaction ID.");
      }
      await loadGateways();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment gateway settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError("");
    setSuccess("");
    setTestMessage("");
    const paymentWindow = window.open("", "_blank", "noopener,noreferrer");

    try {
      const response = await apiFetch<{ message: string; result: BkashTestResult }>("/api/payment-gateways/bkash/test", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setTestMessage(
        `${response.message} Token valid until ${
          response.result.expiresAt ? new Date(response.result.expiresAt).toLocaleString() : "unknown time"
        }. Opening bKash sandbox gateway in a new tab.`
      );

      if (paymentWindow) {
        paymentWindow.location.href = BKASH_SANDBOX_GATEWAY_URL;
      } else {
        window.open(BKASH_SANDBOX_GATEWAY_URL, "_blank", "noopener,noreferrer");
      }

      await loadGateways();
    } catch (err) {
      if (paymentWindow) {
        paymentWindow.close();
      }
      setError(err instanceof Error ? err.message : "Failed to open bKash sandbox gateway.");
    } finally {
      setTesting(false);
    }
  };

  const bkashGateway = gateways.find((gateway) => gateway.provider === "bkash");
  const activeGatewayConfig = gateways.find((gateway) => gateway.provider === selectedProvider);
  const activeGatewayLabel = selectedProvider === "uddoktapay" ? "Send Money" : "bKash Sandbox";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[20px] border border-[#d9e3df] bg-[linear-gradient(135deg,_#f7fbf8_0%,_#eef8f2_46%,_#ffffff_100%)] shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              <Settings2 className="h-3.5 w-3.5" />
              Supplier Settings
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Payment gateway control room
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Connect your supplier-side payment gateway here. bKash sandbox supports gateway checkout, and Send Money supports a manual amount and transaction ID record.
            </p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.6)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Current Default</p>
            <h2 className="mt-3 text-2xl font-bold">
              {gateways.find((gateway) => gateway.isDefault)?.label || "Not configured"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Wallet payouts will use your enabled default gateway. Choose which provider your supplier team should use before launching the payout flow.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {gateways.map((gateway) => {
          const active = gateway.provider === selectedProvider;
          return (
            <div
              key={gateway.provider}
              className={`rounded-[20px] border p-5 shadow-sm ${
                active ? "border-emerald-200 bg-white" : "border-slate-200 bg-white/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{gateway.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {gateway.provider === "bkash"
                      ? "Sandbox checkout setup"
                      : gateway.provider === "uddoktapay"
                        ? "Manual payout entry"
                        : "UI placeholder for upcoming integration"}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {["bkash", "uddoktapay"].includes(gateway.provider) ? <Wallet className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Configured</span>
                  <span className={gateway.isConfigured ? "font-semibold text-emerald-700" : "font-semibold text-slate-700"}>
                    {gateway.isConfigured ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enabled</span>
                  <span className={gateway.isEnabled ? "font-semibold text-emerald-700" : "font-semibold text-slate-700"}>
                    {gateway.isEnabled ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Default</span>
                  <span className={gateway.isDefault ? "font-semibold text-emerald-700" : "font-semibold text-slate-700"}>
                    {gateway.isDefault ? "Active" : "Idle"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                {activeGatewayLabel}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Configure supplier payout gateway</h2>
              <p className="mt-2 text-sm text-slate-500">
                {selectedProvider === "bkash"
                  ? "Save your sandbox merchant app credentials here, then run a live token test before using bKash in the payout flow."
                  : "Save the receiver details here so suppliers can send money manually and save the transaction ID in the app."}
              </p>
            </div>

            {selectedProvider === "bkash" && bkashGateway?.lastTestedAt ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right text-xs text-emerald-700">
                <p className="font-semibold uppercase tracking-[0.18em]">Last Test</p>
                <p className="mt-1">{new Date(bkashGateway.lastTestedAt).toLocaleString()}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gateway</label>
              <select
                value={selectedProvider}
                onChange={(event) => {
                  setSelectedProvider(event.target.value as GatewayProvider);
                  setError("");
                  setSuccess("");
                  setTestMessage("");
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="bkash">bKash Sandbox</option>
                <option value="uddoktapay">Send Money</option>
              </select>
            </div>

            {selectedProvider === "bkash" ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Merchant Name</label>
                    <input
                      type="text"
                      value={form.merchantName}
                      onChange={(event) => setForm((current) => ({ ...current, merchantName: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="BanglaDrop Supplier Wallet"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Environment</label>
                    <select
                      value={form.environment}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          environment: event.target.value as "sandbox" | "production",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="production" disabled>
                        Production (Coming later)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="sandboxTokenizedUser..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="Merchant password"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">App Key</label>
                    <input
                      type="text"
                      value={form.appKey}
                      onChange={(event) => setForm((current) => ({ ...current, appKey: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="bKash app key"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">App Secret</label>
                    <input
                      type="password"
                      value={form.appSecret}
                      onChange={(event) => setForm((current) => ({ ...current, appSecret: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="bKash app secret"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Receiver Name</label>
                    <input
                      type="text"
                      value={uddoktaPayForm.merchantName}
                      onChange={(event) => setUddoktaPayForm((current) => ({ ...current, merchantName: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="Admin wallet account name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Receiver Number</label>
                    <input
                      type="text"
                      value={uddoktaPayForm.accountNumber}
                      onChange={(event) => setUddoktaPayForm((current) => ({ ...current, accountNumber: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Transfer Mode</label>
                    <select
                      value={uddoktaPayForm.accountType}
                      onChange={(event) => setUddoktaPayForm((current) => ({ ...current, accountType: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                    >
                      <option value="send_money">Send Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Admin Instructions</label>
                    <input
                      type="text"
                      value={uddoktaPayForm.instructions}
                      onChange={(event) => setUddoktaPayForm((current) => ({ ...current, instructions: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
                      placeholder="Send money manually, then save the transaction ID"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedProvider === "bkash" ? form.isEnabled : uddoktaPayForm.isEnabled}
                  onChange={(event) =>
                    selectedProvider === "bkash"
                      ? setForm((current) => ({ ...current, isEnabled: event.target.checked }))
                      : setUddoktaPayForm((current) => ({ ...current, isEnabled: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Enable this gateway for payouts
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedProvider === "bkash" ? form.isDefault : uddoktaPayForm.isDefault}
                  onChange={(event) =>
                    selectedProvider === "bkash"
                      ? setForm((current) => ({ ...current, isDefault: event.target.checked }))
                      : setUddoktaPayForm((current) => ({ ...current, isDefault: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Set as default supplier gateway
              </label>
            </div>

            {selectedProvider === "uddoktapay" && activeGatewayConfig?.isConfigured ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Supplier payouts with Send Money are recorded through manual entry only. The supplier enters the amount and transaction ID during payout.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            ) : null}

            {testMessage ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                {testMessage}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              {selectedProvider === "bkash" ? (
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {testing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                  Test Sandbox
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || testing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Gateway
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">What works now</p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">bKash sandbox token test</p>
                <p className="mt-1">We validate the merchant credentials by requesting a live sandbox token from the backend.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Send Money</p>
                <p className="mt-1">Suppliers can manually send money, then save the amount and transaction ID in the app.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">More gateways later</p>
                <p className="mt-1">Nagad and SSLCommerz remain staged in the same layout so we can wire them next without redesigning this screen.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
