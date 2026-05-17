import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const createTripSchema = z
  .object({
    location: z.string().trim().min(1).max(120),
    date: z.coerce.date(),
    notes: z.string().trim().max(2000).optional().default(''),
    placeId: objectIdSchema.optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((d) => (d.latitude === undefined) === (d.longitude === undefined), {
    message: 'latitude and longitude must be provided together',
    path: ['latitude'],
  });

export const updateTripSchema = z
  .object({
    location: z.string().trim().min(1).max(120).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional(),
    placeId: z
      .union([objectIdSchema, z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine(
    (d) =>
      d.latitude === undefined ||
      d.longitude === undefined ||
      (d.latitude !== undefined && d.longitude !== undefined),
    { message: 'latitude and longitude must be provided together', path: ['latitude'] },
  );

export const updateTripCoordsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const createPlaceSchema = z.object({
  name: z.string().trim().min(1).max(120),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  geocodeLabel: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const updatePlaceSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  geocodeLabel: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateCatchSchema = z.object({
  fishType: z.string().trim().min(1).max(80).optional(),
  weight: z.coerce.number().min(0).max(5000).optional().nullable(),
  length: z.coerce.number().min(0).max(1000).optional().nullable(),
  notes: z.string().trim().max(2000).optional(),
  removeImage: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === true || v === 'true'),
});

export const createCatchSchema = z.object({
  fishType: z.string().trim().min(1).max(80),
  weight: z.coerce.number().min(0).max(5000).optional(),
  length: z.coerce.number().min(0).max(1000).optional(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const weatherQuerySchema = z
  .object({
    location: z.string().trim().min(1).max(120).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional(),
    tripId: objectIdSchema.optional(),
  })
  .refine(
    (q) => (q.lat === undefined) === (q.lon === undefined),
    { message: 'lat and lon must be provided together', path: ['lat'] },
  );

export type WeatherQueryInput = z.infer<typeof weatherQuerySchema>;

export const tripIdParamSchema = z.object({ id: objectIdSchema });
export const tripIdRouteSchema = z.object({ tripId: objectIdSchema });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type UpdateTripCoordsInput = z.infer<typeof updateTripCoordsSchema>;
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
export type CreateCatchInput = z.infer<typeof createCatchSchema>;
export type UpdateCatchInput = z.infer<typeof updateCatchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
