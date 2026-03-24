# Lunara Query Portal

Frontend: React + Vite
Backend: Node.js + Express + MySQL (localhost)

## 1. Install dependencies

Install frontend dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
npm --prefix backend install
```

## 2. Configure environment

Frontend `.env`:

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

Backend `.env` (copy from `backend/.env.example`):

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=lunara_portal

JWT_SECRET=change-this-to-a-very-strong-secret
JWT_EXPIRES_IN=8h

ADMIN_USERNAME=coordinator
ADMIN_PASSWORD=coordinator123
```

## 3. MySQL setup

Make sure MySQL is running and the configured user has database create/read/write permissions.

Option A:
- Let backend auto-create tables and seed admin user on startup.

Option B:
- Run SQL manually from `backend/sql/schema.sql`.

## 4. Run the app

Start backend:

```bash
npm --prefix backend run dev
```

Start frontend in another terminal:

```bash
npm run dev
```

## Backend endpoints

- `POST /api/auth/login`
- `GET /api/queries` (public sees resolved only, authenticated sees all)
- `POST /api/queries`
- `PUT /api/queries/:id` (auth required)
- `DELETE /api/queries/:id` (auth required)
