import { del, getDownloadUrl, put, type PutBlobResult } from "@vercel/blob";

export type StorageUploadInput = {
  key: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
};

export interface StorageProvider {
  upload(data: StorageUploadInput): Promise<PutBlobResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, ttlSeconds?: number): Promise<string>;
  getPublicUrl?(key: string): string;
}

export class VercelBlobStorage implements StorageProvider {
  private resolveKey(key: string) {
    return key.replace(/^\/+/, "");
  }

  async upload({ key, buffer, contentType }: StorageUploadInput) {
    const resolvedKey = this.resolveKey(key);

    return put(resolvedKey, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
  }

  async delete(key: string) {
    const resolvedKey = this.resolveKey(key);
    await del(resolvedKey);
  }

  async getSignedUrl(key: string, ttlSeconds = Number(process.env.DOWNLOAD_SIGNED_URL_TTL_SECONDS ?? 300)) {
    const publicUrl = this.getPublicUrl(key);
    void ttlSeconds;
    return getDownloadUrl(publicUrl);
  }

  getPublicUrl(key: string) {
    const resolvedKey = this.resolveKey(key);
    return `https://blob.vercel-storage.com/${encodeURIComponent(resolvedKey)}`;
  }
}

export const storageProvider = new VercelBlobStorage();
