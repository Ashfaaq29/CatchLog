# CatchLog — ANGLER_OS

> **Tactical fishing trip & catch management platform.** Production-ready, AWS-deployable, full-stack TypeScript.

CatchLog ("ANGLER_OS") is a startup-grade web application for logging fishing trips, recording catches with photos, and broadcasting them to a public sonar feed. The UI implements the **Tactical Field Kit** design system (ultra-modern tactical / glassmorphism / Montserrat + JetBrains Mono).

---

## Stack

| Layer        | Tech                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| Frontend     | React 18, Vite 5, TypeScript, TailwindCSS 3, React Router 6, Axios, Zustand, react-hook-form + zod, react-hot-toast, Material Symbols Outlined |
| Backend      | Node 20, Express 4, TypeScript, Mongoose 8, jsonwebtoken, bcryptjs, multer, zod, helmet, morgan, cors |
| Database     | MongoDB 7                                                                                 |
| Object store | AWS S3 (`@aws-sdk/client-s3`)                                                             |
| Infra        | Docker (multi-stage), docker-compose, nginx (frontend prod)                               |

---

## Repository layout

```
CatchLog/
├── backend/                  # Express + TS API
│   ├── src/
│   │   ├── config/           # env, db, s3
│   │   ├── controllers/      # thin HTTP layer
│   │   ├── services/         # business logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── middlewares/      # auth, validate, error, upload, logger
│   │   ├── utils/            # AppError, asyncHandler, jwt, validators
│   │   ├── types/            # ambient TS types
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 # Vite + React + TS
│   ├── src/
│   │   ├── components/{ui,layout,dashboard,trips,catches,gallery}
│   │   ├── pages/            # Login, Register, Dashboard, Trips, TripDetails, Gallery, Profile, Weather, NotFound
│   │   ├── services/         # axios instance + per-resource API
│   │   ├── hooks/            # useHydrateAuth
│   │   ├── context/          # Zustand authStore
│   │   ├── utils/            # formatters
│   │   ├── styles/index.css  # Tailwind + glass-panel/emissive utilities
│   │   ├── assets/stitch/    # design references (parity QA)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.ts    # Tactical Field Kit tokens
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Architecture

```
Browser (React SPA, Vite)
   │  Bearer JWT in Authorization header
   ▼
Express API (Node 20 + TS)  ──►  MongoDB (Mongoose)
       │
       └─►  AWS S3 (PutObject for images, public-read URL persisted on Catch)
```

- Auth: `POST /auth/register|login` issues a JWT (HS256, 7-day default). The SPA stores it in `localStorage` via Zustand-persist. Every request injects `Authorization: Bearer ${token}`. 401 responses hard-redirect to `/login`.
- Uploads: frontend posts `multipart/form-data` to backend; backend uses multer memory storage + zod validation, then `PutObjectCommand` to S3, persisting `imageUrl` + `imageKey` on the `Catch` document.
- Cascade deletes: deleting a trip purges all child catches and their S3 objects.
- Centralized error middleware turns `AppError`, Zod, Mongoose validation/cast errors into a uniform `{ error: { message, code, details? } }` JSON shape.

---

## Quickstart

### Prerequisites

- Node.js **20+** and npm
- Docker + Docker Compose (for the one-command stack)
- A running MongoDB (or use the docker-compose Mongo)
- An AWS S3 bucket + IAM access keys (optional locally — uploads will return 503 until configured)

### 1) Local dev (no Docker)

```bash
# 1. Backend
cd backend
cp .env.example .env             # then edit JWT_SECRET, MONGO_URI, AWS_*
npm install
npm run dev                       # http://localhost:5000

# 2. Frontend (in another shell)
cd frontend
cp .env.example .env              # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                       # http://localhost:3000
```

### 2) One-command stack with Docker Compose

```bash
# Set required env (or export them); JWT_SECRET is mandatory in production
export JWT_SECRET="$(openssl rand -hex 32)"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="eu-west-1"
export AWS_S3_BUCKET_NAME="catchlog-images-prod"
export VITE_API_URL="http://localhost:5000/api"

docker compose up --build
```

This brings up:

| Service    | URL                              |
| ---------- | -------------------------------- |
| Frontend   | http://localhost:3000            |
| Backend    | http://localhost:5000/api        |
| Healthz    | http://localhost:5000/healthz    |
| Mongo      | mongodb://localhost:27017/catchlog |

---

## Environment reference

### `backend/.env`

| Var                    | Required | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| `PORT`                 | no (5000) | HTTP port                                               |
| `MONGO_URI`            | yes      | Mongo connection string                                  |
| `JWT_SECRET`           | yes      | Long random string (`openssl rand -hex 32`)              |
| `JWT_EXPIRES_IN`       | no (7d)  | jsonwebtoken duration                                    |
| `AWS_ACCESS_KEY_ID`    | for S3   | IAM access key                                           |
| `AWS_SECRET_ACCESS_KEY`| for S3   | IAM secret                                               |
| `AWS_REGION`           | no (eu-west-1) | S3 region                                          |
| `AWS_S3_BUCKET_NAME`   | for S3   | Target bucket                                            |
| `CORS_ORIGIN`          | no       | Comma-separated allowed origins (default `http://localhost:3000`) |
| `NODE_ENV`             | no       | `development` / `production`                             |
| `DEFAULT_WEATHER_*`    | no       | Legacy fallbacks (unused when device location is required) |
| `WEATHER_TIMEZONE`     | no       | Optional; API uses `timezone=auto` from coordinates        |
| `WEATHER_CACHE_TTL_MS` | no (1800000)  | In-memory cache TTL for weather responses (30 min)        |

### `frontend/.env`

| Var             | Description                              |
| --------------- | ---------------------------------------- |
| `VITE_API_URL`  | Backend `/api` base URL (e.g. `http://localhost:5000/api`) |

---

## API reference (REST, JSON)

All endpoints are prefixed with `/api`. Auth-protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path                | Auth | Body                                    | Response                  |
| ------ | ------------------- | ---- | --------------------------------------- | ------------------------- |
| POST   | `/auth/register`    | —    | `{ email, password (≥8), name }`        | `201 { token, user }`     |
| POST   | `/auth/login`       | —    | `{ email, password }`                   | `200 { token, user }`     |
| GET    | `/auth/me`          | yes  | —                                       | `200 { user }`            |

### Trips

| Method | Path                | Auth | Body / Query                      | Response                            |
| ------ | ------------------- | ---- | --------------------------------- | ----------------------------------- |
| GET    | `/trips`            | yes  | —                                 | `200 { items: Trip[] }` (incl. `catchCount`) |
| POST   | `/trips`            | yes  | `{ location, date, notes?, placeId?, latitude?, longitude? }` | `201 Trip`                          |
| GET    | `/trips/stats`      | yes  | —                                 | `200 { totalTrips, totalCatches, heaviestCatch, topLocation, recentCatches }` |
| GET    | `/trips/:id`        | yes  | —                                 | `200 { trip, catches }` (ownership-guarded) |
| PATCH  | `/trips/:id`        | yes  | `{ location?, date?, notes?, placeId?, latitude?, longitude? }` | `200 Trip` |
| PATCH  | `/trips/:id/coords` | yes  | `{ latitude, longitude }`         | `200 Trip` |
| DELETE | `/trips/:id`        | yes  | —                                 | `204` (cascades catches + S3)       |

### Places (saved fishing sectors)

| Method | Path           | Auth | Body / Query | Response |
| ------ | -------------- | ---- | ------------ | -------- |
| GET    | `/places`      | yes  | —            | `200 { items: Place[] }` (incl. `tripCount`, `catchCount`, `lastFishedAt`) |
| POST   | `/places`      | yes  | `{ name, latitude, longitude, geocodeLabel?, notes? }` | `201 Place` |
| PATCH  | `/places/:id`  | yes  | partial fields | `200 Place` |
| DELETE | `/places/:id`  | yes  | —            | `204` (409 if missions still linked) |

Place search uses Open-Meteo geocoding (`GET /map/geocode/suggest?q=`). Pin exact spots with the draggable map in the UI.

### Catches

| Method | Path                            | Auth | Body / Query                                                   | Response             |
| ------ | ------------------------------- | ---- | -------------------------------------------------------------- | -------------------- |
| GET    | `/catches`                      | —    | `?page=1&limit=12`                                             | `200 GalleryResponse` (public feed) |
| GET    | `/catches/:tripId`              | yes  | —                                                              | `200 { items: Catch[] }` |
| POST   | `/catches/:tripId`              | yes  | `multipart/form-data`: `fishType`, `weight?`, `length?`, `notes?`, `image?` | `201 Catch`          |
| PATCH  | `/catches/single/:id`           | yes  | `multipart/form-data`: `fishType?`, `weight?`, `length?`, `notes?`, `image?`, `removeImage?` | `200 Catch` |
| DELETE | `/catches/single/:id`           | yes  | —                                                              | `204`                |

### Uploads

| Method | Path        | Auth | Body                       | Response             |
| ------ | ----------- | ---- | -------------------------- | -------------------- |
| POST   | `/upload`   | yes  | `multipart/form-data: file` | `201 { url, key }`   |

### Weather (Open-Meteo proxy)

Live atmospheric and marine data via [Open-Meteo](https://open-meteo.com) (no API key). When no trip location is provided, the app uses **browser geolocation** (you will be prompted to allow location). Dashboard uses your latest trip location when available.

| Method | Path       | Auth | Query                                              | Response          |
| ------ | ---------- | ---- | -------------------------------------------------- | ----------------- |
| GET    | `/weather` | yes  | `location?`, `lat?` + `lon?`, `tripId?`           | `200 WeatherSnapshot` |

### Map (Sonar)

| Method | Path            | Auth | Query / Response |
| ------ | --------------- | ---- | ---------------- |
| GET    | `/map/sonar`    | yes  | `200` — center, deployments, my catches, public pings (with lat/lon) |
| GET    | `/map/geocode`  | yes  | `q=` place name or `lat, lon` → `{ lat, lon, label }` |
| GET    | `/map/geocode/suggest` | yes | `q=` → `{ results: [{ lat, lon, label }] }` (up to 8 suggestions) |

`WeatherSnapshot` includes:

- `current` — wind, pressure, air/water temp, swell, condition
- `forecast` — 6-hour rows with atmospherics plus optional **tide** (height + trend), **moon phase** / **lunar day**, **sunrise** / **sunset**, and **fish activity** (0–100 heuristic score + label)
- `seaTempHistory` — 7 daily mean sea-surface temperatures (°C) for the sea-temp chart
- `solunarSummary` — one-line moon/sun summary for the dashboard hero
- `clarityPct`, `sectorLabel`, optional `advisory`, `usedDeviceLocation`

Tide columns degrade gracefully (`—`) only if marine sea-level data is missing for a coordinate.

**Attribution**

- Weather, marine, and tide heights (`sea_level_height_msl`): [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) (no API key; Copernicus tide model)
- Sun/moon: [suncalc](https://github.com/mourner/suncalc) on the backend
- **Fish activity** is a server-side heuristic (solunar windows, tide, wind, pressure) — not biological survey data

See [Open-Meteo license](https://open-meteo.com/en/license) before commercial deployment.

**Sonar Map tiles:** [OpenFreeMap](https://openfreemap.org/) (dark basemap) + [OpenTopoMap](https://opentopomap.org/) (contour overlay, CC-BY-SA) + [OpenStreetMap](https://www.openstreetmap.org/copyright). Optional: `VITE_STADIA_API_KEY` for Stadia Stamen styles (not required).

### Health

| Method | Path        | Auth | Response                       |
| ------ | ----------- | ---- | ------------------------------ |
| GET    | `/healthz`  | —    | `200 { status: 'ok', ... }`    |

#### Error envelope

```json
{ "error": { "message": "Validation failed", "code": "VALIDATION_ERROR", "details": [{ "path": "email", "message": "..." }] } }
```

---

## Frontend pages

| Route          | Stitch screen                       | Notes                                                   |
| -------------- | ----------------------------------- | ------------------------------------------------------- |
| `/login`       | (auth page derived from theme)      | react-hook-form + zod, glass panel + topo bg            |
| `/register`    | (auth page derived from theme)      | callsign / email / pass / confirm                       |
| `/dashboard`   | `angler_os_dashboard`               | Sonar forecast hero, 6-hour field forecast table, 7-day sea-temp chart, field stats bento, tactical feed, FAB |
| `/trips`       | `angler_os_logbook`                 | Logbook list with filter, New Trip modal                |
| `/trips/:id`   | `catchlog_tactical_field_ops` + logbook detail | Trip header, catches grid, Log Catch modal (multipart) |
| `/gallery`     | `angler_os_sonar_map`               | Full-screen tactical map (MapLibre), HUD panels, deployment/catch markers, layer toggles |
| `/profile`     | `angler_os_gear_locker`             | Operator profile + career stats + gear locker rows + logout |
| `/weather`     | `angler_os_weather_ops`             | Live atmospheric telemetry, sea-temp chart, configurable forecast columns |

Theme is locked to `tactical_field_kit/DESIGN.md` (Material You roles + dual font + sharp 4–8px radii + glassmorphism + emissive borders).

---

## AWS deployment

### S3 bucket setup

1. Create a bucket (e.g. `catchlog-images-prod`) in your chosen region.
2. **Block all public access**: leave **off** for "Block public bucket policies" + "Block public access through ACLs" (only if you want public read URLs). Otherwise keep all public access blocked and switch to pre-signed GETs.
3. CORS (allow your frontend origin to load images directly):

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["https://your-frontend.example.com", "http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. Optional public-read bucket policy (if you want catch URLs to be hot-linkable):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": ["s3:GetObject"],
         "Resource": "arn:aws:s3:::catchlog-images-prod/*"
       }
     ]
   }
   ```

### IAM policy (minimum permissions for the backend)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::catchlog-images-prod/*"
    }
  ]
}
```

Issue programmatic access keys for the IAM user and put them in `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`. (On EC2 prefer **instance roles** and omit those env vars.)

### EC2 deploy sketch

```bash
# Amazon Linux 2023
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

git clone <your-fork>.git /opt/catchlog && cd /opt/catchlog

cat >.env <<'EOF'
JWT_SECRET=<openssl rand -hex 32>
AWS_REGION=eu-west-1
AWS_S3_BUCKET_NAME=catchlog-images-prod
CORS_ORIGIN=https://your-frontend.example.com
VITE_API_URL=https://your-api.example.com/api
EOF

# If you didn't attach an IAM role, also set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
sudo docker compose --env-file .env up -d --build
```

Open security-group ports: `80` (or `443` via ALB), `3000`, `5000` for direct testing. For production, sit nginx / ALB in front, terminate TLS, and reverse-proxy `frontend:80` and `backend:5000`.

### MongoDB options

- Local docker-compose Mongo (default).
- AWS-managed (DocumentDB) or **MongoDB Atlas** — set `MONGO_URI` to the Atlas SRV string and remove the `mongo` service from compose.

---

## Quality / scripts

### Backend

```bash
cd backend
npm run dev         # tsx watch src/server.ts
npm run typecheck   # tsc --noEmit
npm run build       # tsc → dist/
npm run start       # node dist/server.js
```

### Frontend

```bash
cd frontend
npm run dev         # vite
npm run typecheck   # tsc -b --noEmit
npm run build       # tsc -b && vite build → dist/
npm run preview     # vite preview
```

### Code quality bar

- Controllers are thin — all business logic lives in `services/`.
- Every async route handler is wrapped in `asyncHandler` to centralize rejection.
- Zero `any` in service/controller signatures.
- All inputs validated with zod (and re-coerced via `validate.middleware.ts`).
- Centralized error middleware emits a uniform JSON envelope.
- Frontend strict TypeScript (`noUnusedLocals`, `noUnusedParameters`).
- Reusable `GlassPanel` / `Button` / `Input` / `Modal` / `StatusPill` / `Icon` primitives keep pages declarative.

---

## License

This project is provided as an interview-grade reference implementation. Adapt freely.
