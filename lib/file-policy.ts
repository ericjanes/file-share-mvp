export const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const MAX_UPLOAD_SIZE_BYTES = Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 100 * 1024 * 1024);

export function isAllowedMimeType(mimeType: string) {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function sanitizeStorageKey(filename: string) {
  const safe = filename
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return safe || "unnamed-file";
}
