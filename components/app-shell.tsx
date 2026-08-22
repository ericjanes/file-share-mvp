"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const buildNavItems = (section: "dashboard" | "admin") => {
  if (section === "dashboard") {
    return [
      { label: "Overview", href: "/dashboard" },
      { label: "Upload", href: "/dashboard/upload" },
      { label: "Earnings", href: "/dashboard/earnings" },
      { label: "Referral", href: "/dashboard/referral" },
      { label: "Withdrawals", href: "/dashboard/withdrawals" },
      { label: "Files", href: "/files" },
    ];
  }

  return [
    { label: "Overview", href: "/admin" },
    { label: "Withdrawals", href: "/admin/withdrawals" },
    { label: "Users", href: "/admin/users" },
    { label: "Audit logs", href: "/admin/audit-logs" },
  ];
};

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  section,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  section: "dashboard" | "admin";
}) {
  const pathname = usePathname();
  const navItems = buildNavItems(section);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              SV
            </div>
            <div>
              <p className="text-lg font-semibold">ShareVault</p>
              <p className="text-xs text-slate-500">{section === "dashboard" ? "Creator dashboard" : "Admin console"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <nav className="space-y-2 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 transition ${
                    active ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{section}</p>
                <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
