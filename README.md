# inget.in

Aplikasi pencatatan cepat berbasis waktu dan kategori. Mendukung catatan teks,
to-do list, dan catatan keuangan dengan pengalaman mobile-first.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App | Next.js 14 App Router, React, TypeScript |
| UI | Tailwind CSS, Lordicon |
| API | Next.js Route Handlers |
| Database | PostgreSQL via Supabase |
| Database client | postgres.js |
| Auth | Automatic guest session + JWT account sync |
| Deployment | Vercel |

## Project Structure

```text
inget.in/
|-- frontend/
|   |-- app/             # Pages and API route handlers
|   |-- components/      # UI and note components
|   |-- hooks/           # Auth and notes state
|   |-- lib/             # API, database, auth, and utilities
|   `-- types/           # Shared TypeScript types
`-- README.md
```

## Local Setup

Requirements:

- Node.js 18+
- npm
- Supabase PostgreSQL database

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Configure these values in `frontend/.env.local` and Vercel:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=30d
JWT_GUEST_REFRESH_EXPIRES_IN=365d

NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are server-only values.
Never expose them through variables prefixed with `NEXT_PUBLIC_`.

## Authentication Flow

1. User opens the landing page and enters the dashboard without logging in.
2. The dashboard creates a guest user and JWT session automatically.
3. Guest notes, categories, to-do items, and finance records are stored in PostgreSQL.
4. Registering upgrades the same guest user, so its existing data keeps the same owner ID.
5. Logging in to an existing account transfers guest notes and categories to that account.
6. After login, the account can open the same notes from another device.

Guest sessions are tied to the current browser. Clearing browser storage removes the
local session reference, so account sync is recommended for cross-device access and recovery.

## API

All endpoints use the `/api` prefix.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/guest` | Create an automatic guest session |
| POST | `/api/auth/register` | Upgrade guest or create an account |
| POST | `/api/auth/login` | Login and merge current guest data |
| POST | `/api/auth/google` | Login/register with Google profile data |
| POST | `/api/auth/refresh` | Refresh access and refresh tokens |
| DELETE | `/api/auth/logout` | End the current account session |

### Notes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notes` | List notes with optional filters |
| POST | `/api/notes` | Create a note |
| GET | `/api/notes/:id` | Get note detail |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| PATCH | `/api/notes/:id/done` | Toggle note completion |

### Categories

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories` | List user categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

Responses use:

```json
{ "status": "success", "data": {} }
```

```json
{ "status": "error", "message": "..." }
```

## Verification

```bash
cd frontend
npx tsc --noEmit --incremental false
npm run build
```

## Deploy

1. Connect the repository to Vercel.
2. Set the root directory to `frontend`.
3. Configure all environment variables.
4. Deploy the production build.
