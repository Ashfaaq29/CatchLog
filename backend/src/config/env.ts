import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '5000')),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/catchlog'),
  jwtSecret: required('JWT_SECRET', 'dev_only_insecure_secret_change_me'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  aws: {
    accessKeyId: optional('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: optional('AWS_SECRET_ACCESS_KEY', ''),
    region: optional('AWS_REGION', 'eu-west-1'),
    s3Bucket: optional('AWS_S3_BUCKET_NAME', ''),
  },
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:3000'),
  weather: {
    defaultLat: optionalNumber('DEFAULT_WEATHER_LAT', -20.3484),
    defaultLon: optionalNumber('DEFAULT_WEATHER_LON', 57.5522),
    defaultName: optional('DEFAULT_WEATHER_NAME', 'Mauritius'),
    cacheTtlMs: optionalNumber('WEATHER_CACHE_TTL_MS', 1_800_000),
    timezone: optional('WEATHER_TIMEZONE', 'Indian/Mauritius'),
  },
} as const;

export const isProd = env.nodeEnv === 'production';

/** Reject .env.example placeholders so local dev falls back to disk storage. */
function isRealAwsCredential(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (v.startsWith('your_')) return false;
  if (v.includes('replace_me') || v.includes('changeme')) return false;
  return true;
}

export const s3Configured =
  isRealAwsCredential(env.aws.accessKeyId) &&
  isRealAwsCredential(env.aws.secretAccessKey) &&
  isRealAwsCredential(env.aws.s3Bucket);

/** Base URL for locally stored uploads (defaults to this API origin). */
export const publicBaseUrl = optional(
  'PUBLIC_BASE_URL',
  `http://localhost:${optional('PORT', '5000')}`,
);
