import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const error = (await searchParams)?.error ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
            SV
          </div>
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Join and start sharing files securely</p>
        </div>

        <form action="/api/auth/register" method="POST" className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="referralCode" className="mb-2 block text-sm font-medium text-slate-700">
              Referral code (optional)
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              placeholder="ABC123"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700">
            Create account
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-slate-900">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
