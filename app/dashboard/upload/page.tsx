import { uploadFile } from "@/app/actions/files";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Upload</p>
          <h1 className="mt-2 text-3xl font-semibold">Share a new file</h1>
        </div>

        <form action={uploadFile} className="space-y-6" encType="multipart/form-data">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Choose file</span>
              <span>PDF, ZIP, images, audio, video, text files allowed</span>
              <input type="file" name="file" required className="hidden" />
            </label>
          </div>

          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700">
            Upload file
          </button>
        </form>
      </div>
    </main>
  );
}
