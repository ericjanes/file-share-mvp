import { getCurrentUser, getUserBalanceSummary, getUserWithdrawals } from "@/app/actions/withdrawals";
import { requestWithdrawal } from "@/app/actions/withdrawals";

export default async function WithdrawalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const user = await getCurrentUser();
  const balance = await getUserBalanceSummary();
  const withdrawals = await getUserWithdrawals();
  const error = (await searchParams)?.error ?? "";
  const success = (await searchParams)?.success ?? "";

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-3 text-slate-600">Log in to view your withdrawal requests and balance.</p>
        </div>
      </main>
    );
  }

  const formatMoney = (value: number) => `$${value.toFixed(2)}`;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Wallet</p>
              <h1 className="mt-2 text-3xl font-semibold">Withdrawal center</h1>
            </div>
            <a
              href="/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to dashboard
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available balance</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(balance?.availableBalance ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending balance</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(balance?.pendingBalance ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Lifetime earnings</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(balance?.lifetimeEarnings ?? 0)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Request a withdrawal</h2>
            <form action={requestWithdrawal} className="mt-5 space-y-4">
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-700">
                  Amount (USD)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  max={balance?.availableBalance ?? 0}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="method" className="mb-2 block text-sm font-medium text-slate-700">
                  Withdrawal method
                </label>
                <select
                  id="method"
                  name="method"
                  required
                  defaultValue="BANK_TRANSFER"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-500 focus:bg-white"
                >
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CRYPTO">Crypto</option>
                </select>
              </div>

              <div>
                <label htmlFor="accountInfo" className="mb-2 block text-sm font-medium text-slate-700">
                  Account details
                </label>
                <textarea
                  id="accountInfo"
                  name="accountInfo"
                  rows={4}
                  required
                  placeholder="Bank account, PayPal email, or wallet address"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700"
              >
                Submit withdrawal request
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Recent requests</h2>
            <div className="mt-5 space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-sm text-slate-500">No withdrawal requests yet.</p>
              ) : (
                withdrawals.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{formatMoney(Number(item.amount))}</p>
                        <p className="text-xs text-slate-500">{item.method}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : item.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Requested {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
