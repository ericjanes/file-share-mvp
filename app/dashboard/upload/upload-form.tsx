"use client";

import { useState } from "react";

import { uploadFile } from "@/app/actions/files";

export function UploadForm({ error }: { error?: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const fileSizeMb = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : "0.00";

  return (
    <form
      action={uploadFile}
      className="space-y-6"
      encType="multipart/form-data"
      onSubmit={() => {
        setIsSubmitting(true);
      }}
    >
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Choose file</span>
          <span>PDF, ZIP, images, audio, video, text files allowed</span>
          <input
            type="file"
            name="file"
            required
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-900">Tên file</span>
              <span className="truncate max-w-[220px]">{selectedFile.name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-medium text-slate-900">Dung lượng</span>
              <span>{fileSizeMb} MB</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-500">Chưa có file nào được chọn.</div>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{decodeURIComponent(error)}</p> : null}

      <button
        type="submit"
        disabled={!selectedFile || isSubmitting}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition ${
          selectedFile && !isSubmitting ? "bg-slate-900 hover:bg-slate-700" : "cursor-not-allowed bg-slate-300"
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Uploading...
          </>
        ) : (
          "Upload file"
        )}
      </button>
    </form>
  );
}
