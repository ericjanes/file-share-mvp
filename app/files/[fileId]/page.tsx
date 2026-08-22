import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatBytes } from "@/lib/utils";

export default async function FileDetailPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">File detail</p>
            <h1 className="mt-2 text-3xl font-semibold">{file.originalName}</h1>
          </div>

          <Link
            href={`/download/${file.id}`}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Open share link
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold">File information</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Filename</dt>
                <dd className="font-medium text-slate-900">{file.originalName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Size</dt>
                <dd className="font-medium text-slate-900">{formatBytes(file.fileSizeBytes)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Type</dt>
                <dd className="font-medium text-slate-900">{file.mimeType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Downloads</dt>
                <dd className="font-medium text-slate-900">{file.downloadCount}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold">Share link</h2>
            <p className="mt-4 text-sm text-slate-600">Use this link to allow others to download the file securely.</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
              {`${baseUrl}/download/${file.id}`}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
