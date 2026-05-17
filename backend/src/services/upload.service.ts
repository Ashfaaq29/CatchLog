import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { publicBaseUrl, s3Configured } from '../config/env';
import { S3_BUCKET, s3Client, s3PublicUrl } from '../config/s3';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const LOCAL_KEY_PREFIX = 'local:';

export interface UploadedObject {
  url: string;
  key: string;
}

function buildKey(folder: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const id = uuid();
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '');
  return `${safeFolder}/${id}${ext || '.jpg'}`;
}

function localPublicUrl(relativeKey: string): string {
  const normalized = relativeKey.replace(/\\/g, '/');
  return `${publicBaseUrl.replace(/\/$/, '')}/uploads/${normalized}`;
}

async function uploadBufferLocal(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder?: string;
}): Promise<UploadedObject> {
  const folder = params.folder ?? 'catchlog';
  const key = buildKey(folder, params.originalName);
  const fullPath = path.join(UPLOAD_ROOT, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, params.buffer);
  return {
    url: localPublicUrl(key),
    key: `${LOCAL_KEY_PREFIX}${key}`,
  };
}

async function uploadBufferS3(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder?: string;
}): Promise<UploadedObject> {
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

export async function uploadBuffer(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder?: string;
}): Promise<UploadedObject> {
  if (s3Configured) {
    return uploadBufferS3(params);
  }
  return uploadBufferLocal(params);
}

export async function deleteObject(key: string): Promise<void> {
  if (key.startsWith(LOCAL_KEY_PREFIX)) {
    const rel = key.slice(LOCAL_KEY_PREFIX.length);
    try {
      await fs.unlink(path.join(UPLOAD_ROOT, rel));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[uploads] delete failed for key', key, err);
    }
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
