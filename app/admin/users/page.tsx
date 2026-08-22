import { getAdminUsers, toggleUserStatus } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/rbac";
import { EmptyState } from "@/components/empty-state";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdminSession();
  const users = await getAdminUsers();
  const error = (await searchParams)?.error ?? "";
  const success = (await searchParams)?.success ?? "";

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">User moderation</h1>
            </div>
            <a
              href="/admin"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to overview
            </a>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="There are no registered users yet. New signups will show up here for moderation."
            />
          ) : users.map((user) => (
            <div key={user.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Name:</span> {user.name ?? "Unnamed user"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Role:</span> {user.role}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Status:</span> {user.status}
                </p>
              </div>

              <form action={toggleUserStatus} className="flex gap-3">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  name="action"
                  value={user.status === "SUSPENDED" ? "UNBAN" : "BAN"}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white ${
                    user.status === "SUSPENDED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {user.status === "SUSPENDED" ? "Unban" : "Ban"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
