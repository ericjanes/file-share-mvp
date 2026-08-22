import { reviewWithdrawal } from "@/app/actions/withdrawals";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/rbac";
import { EmptyState } from "@/components/empty-state";

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdminSession();
  const error = (await searchParams)?.error ?? "";
  const success = (await searchParams)?.success ?? "";

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Withdrawal review queue</h1>
            </div>
            <a
              href="/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </a>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <EmptyState
              title="No pending withdrawals"
              description="There are no withdrawal requests waiting for review. New requests will appear here."
            />
          ) : (
            withdrawals.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">User:</span> {item.user.name ?? item.user.email}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Email:</span> {item.user.email}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Amount:</span> ${Number(item.amount).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Method:</span> {item.method}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Account:</span> {item.accountInfo}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Requested:</span>{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <form action={reviewWithdrawal} className="w-full max-w-md space-y-3">
                    <input type="hidden" name="withdrawalId" value={item.id} />
                    <label className="block text-sm font-medium text-slate-700">
                      Admin notes
                      <textarea
                        name="notes"
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-slate-500 focus:bg-white"
                        placeholder="Optional review notes"
                      />
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        name="action"
                        value="APPROVED"
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-500"
                      >
                        Approve
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
    </main>
  );
}
