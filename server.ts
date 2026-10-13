import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleGetCatalogue,
  handleGetIndices,
  handleGetFx,
  handleGetHealth
} from './src/server/apiHandlers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Routes matching Vercel serverless shape
  app.get('/api/catalogue', async (req, res) => {
    const result = await handleGetCatalogue({
      query: req.query as any,
      headers: req.headers as any
    });
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.status(result.statusCode).json(result.body);
  });

  app.get('/api/indices', async (req, res) => {
    const result = await handleGetIndices({
      query: req.query as any,
      headers: req.headers as any
    });
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.status(result.statusCode).json(result.body);
  });

  app.get('/api/fx', async (req, res) => {
    const result = await handleGetFx({
      query: req.query as any,
      headers: req.headers as any
    });
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.status(result.statusCode).json(result.body);
  });

  app.get('/api/health', async (_req, res) => {
    const result = await handleGetHealth();
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.status(result.statusCode).json(result.body);
  });

  // Attach Vite middlewares in development or static assets in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Tender Benchmark server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
