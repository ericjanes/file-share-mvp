import Link from "next/link";

const stats = [
  { label: "Files shared", value: "12.4K" },
  { label: "Downloads", value: "98K" },
  { label: "Monthly revenue", value: "$24.8K" },
  { label: "Active referrers", value: "1.8K" },
];

const faqs = [
  {
    question: "How does revenue work?",
    answer:
      "Creators earn from valid downloads and referral commissions. Revenue is tracked in a ledger so balances are auditable and transparent.",
  },
  {
    question: "How are files secured?",
    answer:
      "Files are stored in object storage and served via signed URLs instead of exposing direct public links.",
  },
  {
    question: "Can I refer friends?",
    answer:
      "Yes. Shared referral codes and links allow you to earn a configured commission from eligible referral activity.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              SV
            </div>
            <div>
              <p className="text-lg font-semibold">ShareVault</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#stats">Stats</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
              Login
            </Link>
            <Link href="/auth/register" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
            Secure sharing & revenue
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900">
            Share files. Track downloads. Grow revenue.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            A secure file-sharing platform built for creators, referrers, and admins. Upload files,
            distribute links, and monetize valid downloads with transparent payout tracking.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/register" className="rounded-full bg-slate-900 px-6 py-3 text-center font-medium text-white hover:bg-slate-700">
              Start sharing
            </Link>
            <Link href="/dashboard" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-medium text-slate-700 hover:bg-slate-100">
              Go to dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">File</p>
                <p className="font-medium">product-launch-deck.pdf</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Ready
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Downloads</p>
                <p className="mt-3 text-3xl font-semibold">8,420</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">$1,260</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Referral payout</span>
                <span className="font-medium text-slate-900">12.5%</span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[72%] rounded-full bg-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold">Built for trust, safety, and clarity.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["1", "Upload securely", "Files are validated, encrypted in storage workflows, and never exposed directly."],
            ["2", "Share a link", "Generate a private or public file link and track real download events."],
            ["3", "Earn and withdraw", "Revenue is recorded in a transparent ledger, with referral and creator payouts tracked."],
          ].map(([step, title, description]) => (
            <div key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {step}
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stats" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-center">
              <div className="text-3xl font-semibold">{stat.value}</div>
              <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold">Questions people ask</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-2 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
