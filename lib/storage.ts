import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StorageUploadInput = {
  key: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
};

export interface StorageProvider {
  upload(data: StorageUploadInput): Promise<void>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, ttlSeconds?: number): Promise<string>;
  getPublicUrl?(key: string): string;
}

export class S3CompatibleStorage implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "file-share-mvp";
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
      forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "false") === "true",
    });
  }

  async upload({ key, buffer, contentType, metadata }: StorageUploadInput) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      }),
    );
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, ttlSeconds = Number(process.env.DOWNLOAD_SIGNED_URL_TTL_SECONDS ?? 300)) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
  }

  getPublicUrl(key: string) {
    return `${process.env.S3_PUBLIC_BASE_URL ?? ""}/${encodeURIComponent(key)}`.replace(/\/$/, "");
  }
}

export const storageProvider = new S3CompatibleStorage();
