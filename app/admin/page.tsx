import { getAdminOverviewStats, getViolationReports, handleViolationAction } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/rbac";
import { EmptyState } from "@/components/empty-state";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdminSession();
  const stats = await getAdminOverviewStats();
  const reports = await getViolationReports();
  const error = (await searchParams)?.error ?? "";
  const success = (await searchParams)?.success ?? "";

  const formatMoney = (value: number) => `$${value.toFixed(2)}`;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Platform overview</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin/withdrawals"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Withdrawals
              </a>
              <a
                href="/admin/users"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Users
              </a>
              <a
                href="/admin/audit-logs"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Audit logs
              </a>
              <a
                href="/dashboard"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Gross platform revenue</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(stats.grossRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Platform share</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(stats.platformShare)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending withdrawals</p>
            <p className="mt-3 text-3xl font-semibold">{formatMoney(stats.pendingWithdrawalAmount)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Open reports</p>
            <p className="mt-3 text-3xl font-semibold">{stats.openReports}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Users</p>
            <p className="mt-3 text-2xl font-semibold">{stats.totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Files</p>
            <p className="mt-3 text-2xl font-semibold">{stats.totalFiles}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Downloads</p>
            <p className="mt-3 text-2xl font-semibold">{stats.totalDownloads}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Violations</p>
            <p className="mt-3 text-2xl font-semibold">{stats.suspendedUsers + stats.hiddenFiles}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Violation reports</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
              {reports.length} items
            </span>
          </div>

          <div className="space-y-4">
            {reports.length === 0 ? (
              <EmptyState
                title="No violation reports"
                description="There are no active or reviewed reports at the moment. New reports will appear here for moderation."
              />
            ) : (
              reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">Reporter:</span> {report.reporter.name ?? report.reporter.email}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Creator:</span> {report.creator?.name ?? report.creator?.email ?? "System"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">File:</span> {report.file?.originalName ?? "No file attached"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Reason:</span> {report.reason}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Status:</span> {report.status}
                      </p>
                    </div>

                    <form action={handleViolationAction} className="w-full max-w-md space-y-3">
                      <input type="hidden" name="reportId" value={report.id} />
                      <textarea
                        name="notes"
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-500" 
                        placeholder="Admin notes"
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          name="action"
                          value="RESOLVED"
                          className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-500"
                        >
                          Resolve
                        </button>
                        <button
                          type="submit"
                          name="action"
                          value="REJECTED"
                          className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
