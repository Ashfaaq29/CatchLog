import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { s3Configured } from '../config/env';
import { S3_BUCKET, s3Client, s3PublicUrl } from '../config/s3';
import { AppError } from '../utils/AppError';

export interface UploadedObject {
  url: string;
  key: string;
}

/** Legacy disk keys from before S3-only pipeline — never touch local filesystem. */
const LEGACY_LOCAL_PREFIX = 'local:';

function buildKey(folder: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const id = uuid();
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '');
  return `${safeFolder}/${id}${ext || '.jpg'}`;
}

function assertS3Configured(): void {
  if (!s3Configured || !S3_BUCKET) {
    throw new AppError('Image storage (S3) is not configured', 503, 'STORAGE_UNAVAILABLE');
  }
}

export async function uploadToS3(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder?: string;
}): Promise<UploadedObject> {
  assertS3Configured();

  const folder = params.folder ?? 'catchlog';
  const key = buildKey(folder, params.originalName);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return { url: s3PublicUrl(key), key };
}

export async function deleteFromS3(key: string): Promise<void> {
  if (key.startsWith(LEGACY_LOCAL_PREFIX)) {
    return;
  }

  if (!s3Configured || !S3_BUCKET) return;

  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[s3] delete failed for key', key, err);
  }
}
