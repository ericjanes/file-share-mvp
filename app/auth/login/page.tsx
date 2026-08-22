import Link from "next/link";

export default async function LoginPage({
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
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage your files and earnings</p>
        </div>

        <form action="/api/auth/login" method="POST" className="space-y-5">
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
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
              Remember me
            </label>
            <Link href="/auth/forgot-password" className="text-slate-700 hover:text-slate-900">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700">
            Sign in
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/auth/register" className="font-medium text-slate-900">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
