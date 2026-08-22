import { redirect } from "next/navigation";

import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBytes } from "@/lib/utils";

async function getDashboardData() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        balance: true,
      },
    });

    if (!user) {
      return null;
    }

    const [recentFiles, totalFiles, totalDownloads, revenueSummary, referralRevenueSummary] = await Promise.all([
      prisma.file.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.file.count({
        where: { ownerId: user.id },
      }),
      prisma.download.count({
        where: {
          file: {
            ownerId: user.id,
          },
        },
      }),
      prisma.revenueEvent.aggregate({
        _sum: {
          uploaderShare: true,
          referralShare: true,
          grossRevenue: true,
        },
        where: {
          userId: user.id,
          status: "APPROVED",
        },
      }),
      prisma.revenueEvent.aggregate({
        _sum: {
          referralShare: true,
        },
        where: {
          userId: user.id,
          source: "REFERRAL_COMMISSION",
          status: "APPROVED",
        },
      }),
    ]);

    const estimatedRevenue = Number(revenueSummary._sum.uploaderShare ?? 0) + Number(revenueSummary._sum.referralShare ?? 0);
    const referralRevenue = Number(referralRevenueSummary._sum.referralShare ?? 0);
    const availableBalance = Number(user.balance?.availableBalance ?? 0);
    const pendingBalance = Number(user.balance?.pendingBalance ?? 0);

    return {
      userName: user.name ?? "Creator",
      stats: [
        { label: "Total files", value: totalFiles.toLocaleString() },
        { label: "Total downloads", value: totalDownloads.toLocaleString() },
        { label: "Estimated revenue", value: `$${estimatedRevenue.toFixed(2)}` },
        { label: "Referral revenue", value: `$${referralRevenue.toFixed(2)}` },
        { label: "Available balance", value: `$${availableBalance.toFixed(2)}` },
        { label: "Pending balance", value: `$${pendingBalance.toFixed(2)}` },
      ],
      recentFiles: recentFiles.map((file) => ({
        name: file.originalName,
        size: formatBytes(file.fileSizeBytes),
        downloads: file.downloadCount,
        status: file.status === "READY" ? "Ready" : file.status === "PENDING" ? "Processing" : "Review",
      })),
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  if (!dashboard) {
    redirect("/auth/login?error=Please log in to access your dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              SV
            </div>
            <div>
              <p className="text-lg font-semibold">ShareVault</p>
              <p className="text-xs text-slate-500">Creator dashboard</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium text-slate-600">
            {[
              { label: "Overview", href: "/dashboard" },
              { label: "My Files", href: "/dashboard" },
              { label: "Upload", href: "/dashboard/upload" },
              { label: "Downloads", href: "/dashboard" },
              { label: "Earnings", href: "/dashboard/earnings" },
              { label: "Referral", href: "/dashboard/referral" },
              { label: "Withdrawal", href: "/dashboard/withdrawals" },
              { label: "Profile", href: "/dashboard" },
              { label: "Settings", href: "/dashboard" },
            ].map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`block rounded-xl px-3 py-2 ${index === 0 ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="flex-1 space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Overview</p>
                <h1 className="mt-2 text-3xl font-semibold">Welcome back, {dashboard.userName}</h1>
              </div>
              <a
                href="/dashboard/upload"
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Upload file
              </a>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent files</h2>
              <a href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                View all
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Downloads</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {dashboard.recentFiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No files uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    dashboard.recentFiles.map((file) => (
                      <tr key={file.name}>
                        <td className="px-4 py-3 font-medium text-slate-900">{file.name}</td>
                        <td className="px-4 py-3 text-slate-600">{file.size}</td>
                        <td className="px-4 py-3 text-slate-600">{file.downloads}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              file.status === "Ready"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {file.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
