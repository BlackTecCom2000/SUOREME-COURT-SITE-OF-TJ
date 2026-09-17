# Supreme Court of the Republic of Tajikistan - Digital Platform

This is the official digital judicial platform for the Supreme Court of the Republic of Tajikistan, replacing the previous legacy website with a modern, cinematic, and data-driven portal.

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, React Three Fiber (3D Elements)
- **Backend**: Express (Node.js), Better-SQLite3, JWT Authentication
- **CMS**: Custom built integrated Admin Dashboard

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
CMS_PORT=8787
CMS_ORIGIN=http://localhost:5173
CMS_JWT_SECRET=your_secure_secret_here
CMS_SEED_ADMIN_EMAIL=admin@sud.tj
CMS_SEED_ADMIN_PASSWORD=admin123
```

### 3. Start Development Servers
This runs both the Vite frontend and Express backend concurrently:
```bash
npm run dev:full
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

### 4. Admin Access
Navigate to `/admin` to access the CMS.
- Email: `admin@sud.tj`
- Password: `admin123`

## Production Build

To build the frontend for production:
```bash
npm run build
```
The output will be in the `/dist` folder.

## Deployment Architecture
This is a full-stack application. It cannot be hosted solely on a static host like GitHub Pages because it relies on a Node.js backend and SQLite database.
- **Frontend**: Can be served via Nginx, Vercel, or statically.
- **Backend**: Requires a Node.js environment (e.g., VPS, Docker, PM2) and persistent storage for the `data/` directory (SQLite and uploaded media).
