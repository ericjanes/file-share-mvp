import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatBytes } from "@/lib/utils";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.status !== "READY") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Download</p>
          <h1 className="mt-2 text-3xl font-semibold">{file.originalName}</h1>
          <p className="mt-4 text-slate-600">{formatBytes(file.fileSizeBytes)}</p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Preview</p>
            <div className="mt-4 flex h-52 items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
              File preview not available for this format
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Advertisement</p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-600">
              Ad slot reserved for compliant network
            </div>
          </div>

          <Link
            href={`/api/files/${file.id}/download`}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700"
          >
            Download file
          </Link>
        </aside>
      </div>
    </main>
  );
}
