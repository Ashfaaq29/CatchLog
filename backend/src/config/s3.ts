import { S3Client } from '@aws-sdk/client-s3';
import { env, s3Configured } from './env';

export const s3Client = new S3Client({
  region: env.aws.region,
  credentials: s3Configured
    ? {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      }
    : undefined,
});

export const S3_BUCKET = env.aws.s3Bucket;

export function s3PublicUrl(key: string): string {
  return `https://${S3_BUCKET}.s3.${env.aws.region}.amazonaws.com/${key}`;
}
