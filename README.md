# inget.in

Aplikasi pencatatan cepat berbasis waktu dan kategori. Catat rencanamu dengan simpel, cepat, dan terorganisir.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth / JWT (Email + Google OAuth) |
| Deploy | Frontend → Vercel, Backend → Railway |

## Project Structure

```
inget.in/
├── frontend/     # Next.js 14 App
└── backend/      # NestJS API
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (for database + auth)

### Backend

```bash
cd backend
npm install

# Copy env and fill in values
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start dev server (port 3001)
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install

# Copy env and fill in values
cp .env.example .env.local

# Start dev server (port 3000)
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=http://localhost:3000
PORT=3001
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register with email/password |
| POST | /auth/login | Login with email/password |
| POST | /auth/google | Login/Register with Google |
| POST | /auth/refresh | Refresh access token |
| DELETE | /auth/logout | Logout |

### Notes (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notes | Get all notes (`?category=&date=&done=`) |
| POST | /notes | Create note |
| GET | /notes/:id | Get note detail |
| PUT | /notes/:id | Update note |
| DELETE | /notes/:id | Delete note |
| PATCH | /notes/:id/done | Toggle done status |

### Categories (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /categories | Get all categories |
| POST | /categories | Create category |
| PUT | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |

## Response Format

```json
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "message": "..." }
```

## Deploy

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set root directory to `backend/`
3. Set environment variables
4. Deploy

## App Flow

1. **Guest** → writes note → clicks Simpan → SaveModal appears → login/register
2. After login → note from localStorage is auto-saved to DB
3. **Logged in** → full dashboard with category filters, note cards, FAB button
