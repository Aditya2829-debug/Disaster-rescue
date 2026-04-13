# DisasterAid 🆘

An **offline-first disaster rescue coordination system** built with the MERN stack + React PWA.

Works fully offline. Syncs automatically when connectivity is restored.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| PWA | vite-plugin-pwa + Workbox (Service Worker) |
| Offline Storage | Dexie.js (IndexedDB) |
| Maps | Leaflet.js + OpenStreetMap (free, no API key) |
| State | Zustand |
| Backend | Node.js + Express.js (Modular Monolith) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt + RBAC |

---

## User Roles

| Role | Access |
|------|--------|
| `civilian` | SOS form only (no login required) |
| `field_worker` | Log victims + Dashboard + Map |
| `command` | Dashboard + Map + Update statuses |
| `admin` | All of the above + Register users |

---

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGO_URI and JWT_SECRET
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Admin | Create user with role |
| POST | `/api/auth/login` | None | Login → JWT |
| GET | `/api/victims` | Field+ | List victim reports |
| POST | `/api/victims` | Field | Create victim report |
| PATCH | `/api/victims/:id` | Field+ | Update status |
| POST | `/api/sos` | Optional | Submit SOS (anonymous ok) |
| GET | `/api/sos` | Command+ | List SOS signals |
| PATCH | `/api/sos/:id/status` | Command+ | Update SOS status |
| POST | `/api/sync` | Any auth | Batch sync offline queue |
| GET | `/api/health` | None | Health check |

---

## Offline Flow

```
Device offline → User submits SOS/report
                       ↓
              Saved to IndexedDB (Dexie.js)
                       ↓
              Added to sync_queue table
                       ↓
         Connection restored (navigator.onLine event)
                       ↓
              POST /api/sync (batch)
                       ↓
         Server upserts by localId (idempotent)
                       ↓
              sync_queue items marked synced=1
```

---

## Project Structure

```
disaster-rescue/
├── server/
│   ├── index.js
│   ├── config/db.js
│   ├── middleware/        auth.js | rbac.js | errorHandler.js
│   ├── models/            User.js | Victim.js | SosSignal.js
│   └── modules/
│       ├── auth/          routes | controller | service
│       ├── victims/       routes | controller | service
│       ├── sos/           routes | controller | service
│       └── sync/          routes | controller | service
└── client/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── db/db.js           Dexie schema
        ├── store/authStore.js Zustand auth
        ├── sync/syncManager.js
        ├── hooks/             useOnlineStatus | useGeolocation | useSync
        ├── components/        OfflineBanner | BottomNav | SOSButton | StatusBadge | RequestCard
        └── pages/             Login | Home | SOSForm | VictimLog | Dashboard | MapView
```

---

## Create Your First Admin

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@rescue.com","password":"secret","role":"admin"}'
```

---

## Design Decisions

- **Last-Write-Wins** conflict resolution via `updatedAt` timestamp (MVP)
- **Anonymous SOS** — civilians submit without logging in
- **Idempotent sync** — `localId` (UUID) prevents duplicate records on re-sync
- **OpenStreetMap** — zero API cost, works with tile caching in Service Worker
