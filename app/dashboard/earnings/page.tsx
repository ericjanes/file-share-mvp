import { getUserEarningsSummary, getUserRevenueEvents } from "@/app/actions/earnings";

export default async function EarningsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const summary = await getUserEarningsSummary();
  const events = await getUserRevenueEvents();
  const error = (await searchParams)?.error ?? "";
  const success = (await searchParams)?.success ?? "";

  if (!summary) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-3 text-slate-600">Log in to view your earnings and revenue details.</p>
        </div>
      </main>
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Revenue</p>
              <h1 className="mt-2 text-3xl font-semibold">Earnings overview</h1>
            </div>
            <a
              href="/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to dashboard
            </a>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Gross revenue</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.grossRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Uploader share</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.uploaderShare)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Referral share</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.referralShare)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available balance</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.availableBalance)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Revenue events</h2>
            <div className="mt-5 space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">No approved revenue has been recorded yet.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{event.source.replace("_", " ")}</p>
                        <p className="text-xs text-slate-500">
                          {event.file?.originalName ?? "Unlinked file"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(Number(event.uploaderShare))}</p>
                        <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Wallet summary</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Approved revenue</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.grossRevenue)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Pending balance</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.pendingBalance)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total events</p>
                <p className="mt-2 text-2xl font-semibold">{summary.totalEvents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
