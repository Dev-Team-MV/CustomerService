# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Lakewood Oaks** — a property management system for residential lot sales. Admins manage properties, lots, models, payments, and residents. Users track their owned properties, payments, and family groups.

## Commands

### Development (from root)
```bash
npm run install:all      # Install all dependencies (root + frontend + backend)
npm run dev              # Run both frontend and backend concurrently
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:backend      # Backend only (port 5001)
```

### Frontend (from `frontend/`)
```bash
npm run dev              # Vite dev server
npm run build            # Production build to /dist
npm run preview          # Preview production build
```

### Backend (from `backend/`)
```bash
npm run dev              # nodemon with auto-reload
npm run start            # Production mode
```

No test or lint scripts are configured.

## Architecture

### Monorepo Structure
```
CustomerService/
├── frontend/     # React + Vite SPA
├── backend/      # Node.js + Express REST API
├── vercel.json   # Deploys frontend/dist, rewrites all routes to index.html
└── package.json  # Root orchestration via concurrently
```

### Frontend (`frontend/src/`)

- **`App.jsx`** — root routing. Public routes (login, explore, news) vs protected routes (dashboard, admin pages). Uses `<ProtectedRoute>` and `<AdminRoute>` wrappers.
- **`context/`** — `AuthContext` (user session, JWT in localStorage) and `PropertyContext` (shared property state).
- **`services/`** — all API calls live here (`authService`, `propertyService`, `uploadService`, etc.). `api.js` is the Axios instance with a JWT request interceptor.
- **`components/`** — feature-grouped reusable components (property, FamilyGroup, masterPlan, LayoutComponents).
- **`pages/`** — one folder per route.
- **`i18n/`** — i18next configuration for multi-language support.

The dev proxy in `vite.config.js` forwards `/api/*` to `http://localhost:5001`, so frontend code calls `/api/...` without a full URL.

### Backend (`backend/`)

- **`server.js`** — entry point, registers all routes, connects to MongoDB, mounts Swagger at `/api-docs`.
- **`models/`** — Mongoose schemas. Key models: `User`, `Project`, `Lot`, `Model`, `Facade`, `Property`, `Payload`, `Contract`, `FamilyGroup`, `News`, `Phase`.
- **`routes/`** — one file per resource, wires HTTP verbs to controllers.
- **`controllers/`** — business logic, all async with try/catch.
- **`middleware/`** — `auth.js` verifies JWT and attaches `req.user`; role checks (admin, superadmin) done inline.
- **`services/`** — Twilio SMS, Google Cloud Storage, image processing via Sharp.
- Uses ES modules (`"type": "module"` in package.json) — use `import`/`export`, not `require`.

### Data Model Relationships

```
Project → Lots (many)
Project → Models (many)
Model   → Facades (many)
Lot + Model + Facade → Property (one-to-one-to-one)
Property → Payloads (many payments)
Property → Phases (construction progress)
Property → Users (multiple owners via FamilyGroup)
Users    → FamilyGroup (admin or member role)
```

`Property` is the central entity linking a physical lot with its model, facade, owners, payments, and contracts.

### Auth Flow

1. Login → JWT (30-day expiry) stored in `localStorage`.
2. Axios interceptor injects `Authorization: Bearer <token>` on every request.
3. Backend `auth` middleware decodes and attaches `req.user`.
4. New admin-created users receive a setup token via SMS (Twilio) to set their password at `/setup-password/:token`.

### Roles
- `superadmin` — full access
- `admin` — property/resident management
- `user` — own properties, payments, family groups

### Environment Variables

**Backend** (`backend/.env`):
```
MONGODB_URI=
JWT_SECRET=
PORT=5001
FRONTEND_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GOOGLE_CLOUD_BUCKET=
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5001
```

### Deployment

Vercel hosts the frontend. `vercel.json` runs `cd frontend && npm install && npm run build` and outputs `frontend/dist`. All paths rewrite to `index.html` for React Router SPA support. The backend is deployed separately.
