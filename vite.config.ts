import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// A simple Vite plugin to natively execute Vercel Serverless Functions during local development
function vercelServerlessDevPlugin() {
  return {
    name: 'vercel-serverless-dev',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) return next();

        try {
          const basePath = req.url.split('?')[0];
          let apiFile = path.resolve('.' + basePath + '.js');
          
          // Handle dynamic routes like /api/hackathons/[id].js
          if (!fs.existsSync(apiFile)) {
            const dir = path.dirname(path.resolve('.' + basePath));
            if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir);
              const dynamicFile = files.find(f => f.startsWith('[') && f.endsWith('].js'));
              if (dynamicFile) {
                apiFile = path.join(dir, dynamicFile);
                req.query = { ...req.query, id: path.basename(basePath) };
              }
            }
          }

          if (fs.existsSync(apiFile)) {
            // Parse query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            req.query = { ...req.query, ...Object.fromEntries(url.searchParams) };
            
            // For POST requests, parse JSON body
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              req.body = await new Promise((resolve) => {
                let body = '';
                req.on('data', (chunk: any) => body += chunk.toString());
                req.on('end', () => {
                  try { resolve(body ? JSON.parse(body) : {}); } 
                  catch (e) { resolve({}); }
                });
              });
            }
            
            // Import and run the serverless handler
            const module = await import(pathToFileURL(apiFile).href + '?t=' + Date.now());
            const handler = module.default;
            
            // Mock Vercel res helpers
            res.status = (statusCode: any) => {
              res.statusCode = statusCode;
              return res;
            };
            res.json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            if (typeof res.flush !== 'function') {
              res.flush = () => {};
            }
            if (typeof res.flushHeaders !== 'function') {
              res.flushHeaders = () => {};
            }
            
            await handler(req, res);
            return;
          }
        } catch (e) {
          console.error('❌ Local Serverless Error:', e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
        
        next();
      });
    }
  }
}

// https://vite.dev/config/
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), vercelServerlessDevPlugin()],
    server: {
      host: true, // Listen on all local IPs
    }
  };
});
