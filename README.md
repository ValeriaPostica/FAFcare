# FAFCare

FAFCare is a patient portal application built as a two-workspace project: a React + Vite frontend and a Node.js + Express backend.

## PostgreSQL setup

The backend now reads from PostgreSQL. Create a database, run `backend/src/config/schema.sql`, copy `backend/.env.example` to `backend/.env`, and adjust `DATABASE_URL` if needed.

From the repository root:

```powershell
cd backend
npm install
node src/config/seed.js
npm run dev
```

The seed imports the supported CSV tables in foreign-key order and hashes all imported test passwords with bcrypt. Its default password is `Password123!`; set `SEED_PASSWORD` before seeding to use another one.

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend uses `VITE_API_URL` when set, otherwise it calls `http://localhost:5000/api`.

## Repository Structure

The repository is divided into two distinct workspaces:

```
FAFcare/
├── frontend/             # Client-side application (React + Vite)
│   ├── node_modules/     # Frontend dependencies
│   ├── src/
│   │   ├── App.jsx       # Main React application component
│   │   ├── main.jsx      # React entry point (DOM mounting)
│   │   └── index.css     # Global styles & Tailwind CSS directives
│   ├── index.html        # Application HTML entry point
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.js    # Vite configuration
│
└── backend/              # Server-side API (Node.js + Express)
    ├── node_modules/     # Backend dependencies
    ├── package.json      # Backend dependencies & scripts
    └── server.js         # Express server entry point
```

## 1. Frontend Setup & Execution

### Commands Executed

```bash
# Navigate to the frontend workspace
cd D:\fafcare\FAFcare\frontend

# Install dependencies (React, Lucide Icons, Tailwind CSS, Vite)
npm install --no-audit --no-fund

# Run the development server
npm run dev
```

### Key Configuration Files

**`frontend/package.json`**

```json
{
  "name": "fafcare-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.300.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

**`frontend/vite.config.js`**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**`frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FAFCare — Patient Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Terminal Output (`npm run dev`)

```
VITE v5.x.x  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 2. Backend Setup & Execution

### Commands Executed

```bash
# Navigate to the backend workspace in a second terminal window
cd D:\fafcare\FAFcare\backend

# Initialize Node.js package
npm init -y

# Install core backend packages
npm install express cors dotenv

# Run backend server in development watch mode
npm run dev
```

### Key Configuration Files

**`backend/package.json`**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1"
  }
}
```

**`backend/server.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FAFCare server is running!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

### Terminal Output (`npm run dev`)

```
> backend@1.0.0 dev
> node --watch server.js

Backend server running on http://localhost:5000
```