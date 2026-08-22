import { ReferralCopyButton } from "@/components/referral-copy-button";
import { getUserReferralData } from "@/app/actions/referrals";

export default async function ReferralPage() {
  const data = await getUserReferralData();

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-3 text-slate-600">Log in to view your referral program.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Referral</p>
              <h1 className="mt-2 text-3xl font-semibold">Invite friends and earn more</h1>
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
            <p className="text-sm text-slate-500">Referral code</p>
            <p className="mt-3 text-3xl font-semibold">{data.referralCode}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total referrals</p>
            <p className="mt-3 text-3xl font-semibold">{data.totalReferrals}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available balance</p>
            <p className="mt-3 text-3xl font-semibold">${data.availableBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Your referral link</h2>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Link</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{data.referralLink}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <ReferralCopyButton link={data.referralLink} />
              <a
                href={data.referralLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Open link
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Referral stats</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active signups</p>
                <p className="mt-2 text-2xl font-semibold">{data.activeReferrals}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Commission rate</p>
                <p className="mt-2 text-2xl font-semibold">10%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Referrals</h2>
          <div className="mt-5 space-y-3">
            {data.referrals.length === 0 ? (
              <p className="text-sm text-slate-500">No referral signups yet.</p>
            ) : (
              data.referrals.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{entry.referredUser.name ?? entry.referredUser.email}</p>
                    <p className="text-xs text-slate-500">{entry.referredUser.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      entry.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {entry.status}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
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
