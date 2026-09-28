import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const DATASETS = ['contents', 'characters', 'events', 'trailers', 'merchandise'];

// Vite keys its module graph by forward-slash paths, so a raw Windows path (C:\...) never matches.
const datasetFile = (dataset) =>
  normalizePath(path.resolve(process.cwd(), 'src', 'data', `${dataset}.json`));
const DATASET_FILES = new Set(DATASETS.map(datasetFile));

function dataPersistencePlugin() {
  return {
    name: 'data-persistence',
    // Open tabs get data changes live via the 'fandomverse:data-updated' event, so skip Vite's
    // default full-page reload. Vite has already dropped its cached copy of the module by now,
    // so the next page load (F5) reads the file fresh from disk.
    handleHotUpdate({ file }) {
      if (DATASET_FILES.has(file)) return [];
    },
    configureServer(server) {
      // 1. Read dataset directly from disk
      server.middlewares.use('/api/data', async (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const url = new URL(req.url, 'http://localhost');
            const dataset = url.searchParams.get('dataset');
            if (DATASETS.includes(dataset)) {
              const fileContent = await fs.promises.readFile(datasetFile(dataset), 'utf-8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(fileContent);
              return;
            }
          } catch (err) {
            console.error('[Vite Data Plugin] Read error:', err);
          }
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Dataset not found' }));
          return;
        }
        next();
      });

      // 2. Write dataset to disk and broadcast update to all open tabs in real-time
      server.middlewares.use('/api/sync-data', (req, res) => {
        if (req.method === 'POST') {
          const chunks = [];
          req.on('data', (chunk) => {
            chunks.push(chunk);
          });
          req.on('end', async () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8');
              const { dataset, data } = JSON.parse(body);
              if (DATASETS.includes(dataset) && Array.isArray(data)) {
                const filePath = datasetFile(dataset);
                await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

                // Drop the cached module right away instead of waiting for the file watcher,
                // so an F5 immediately after saving can't be served the old data.
                for (const mod of server.moduleGraph.getModulesByFile(filePath) ?? []) {
                  server.moduleGraph.invalidateModule(mod);
                }

                // Broadcast in real-time to ALL open browser tabs (User, Admin, Incognito, Normal)
                server.ws.send({
                  type: 'custom',
                  event: 'fandomverse:data-updated',
                  data: { dataset, data },
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                return;
              }
            } catch (err) {
              console.error('[Vite Data Plugin] Error writing data:', err);
            }
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false }));
          });
          return;
        }
        res.writeHead(405);
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), dataPersistencePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  base: './', // Ensures relative assets work on GitHub Pages and static preview
  server: {
    port: 5173,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('bootstrap')) {
              return 'vendor-bootstrap';
            }
          }
          if (id.includes('/src/data/') || id.includes('\\src\\data\\')) {
            return 'app-data';
          }
        },
      },
    },
  },
});

