import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('records.db');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function startServer() {
  const app = express();
  // Set limit for Base64 (resumes/photos)
  app.use(express.json({ limit: '50mb' }));

  // --- API Proxy ---
  // Proxy all /api requests to the standalone Express/MongoDB backend on port 5000
  app.all('/api*', (req, res) => {
    const target = 'http://localhost:5000';
    const url = target + req.originalUrl;

    // Simple fetch-based proxy
    const headers = { ...req.headers } as any;
    delete headers['content-length'];
    headers.host = 'localhost:5000';

    fetch(url, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? JSON.stringify(req.body) : undefined
    })
      .then(async (response) => {
        const text = await response.text();
        res.status(response.status).send(text);
      })
      .catch((err) => {
        res.status(502).json({ error: 'Backend server not reachable on port 5000', details: err.message });
      });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Frontend server running on http://localhost:3000');
  });
}

startServer();
