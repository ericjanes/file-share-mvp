import { getAuditLogs } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/rbac";
import { EmptyState } from "@/components/empty-state";

export default async function AdminAuditLogsPage() {
  await requireAdminSession();
  const logs = await getAuditLogs();

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Audit logs</h1>
            </div>
            <a
              href="/admin"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to overview
            </a>
          </div>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            title="No audit events yet"
            description="System actions will appear here as users log in, upload files, process withdrawals, or receive moderation reviews."
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-900">{log.user?.email ?? "System"}</td>
                      <td className="px-4 py-3 text-slate-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-900">{log.entityType}</td>
                      <td className="px-4 py-3 text-slate-600">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
