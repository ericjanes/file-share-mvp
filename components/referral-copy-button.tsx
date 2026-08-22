"use client";

import { useState } from "react";

export function ReferralCopyButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={copyLink}
      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
