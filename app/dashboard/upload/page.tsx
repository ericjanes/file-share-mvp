import { UploadForm } from "./upload-form";

export default async function UploadPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const error = (await searchParams)?.error ?? "";

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Upload</p>
          <h1 className="mt-2 text-3xl font-semibold">Share a new file</h1>
        </div>

        <UploadForm error={error} />
      </div>
    </main>
  );
}
