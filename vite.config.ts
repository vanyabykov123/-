import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-apk-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const cleanUrl = req.url?.split('?')[0] || '';
            if (cleanUrl === '/super-podruga-30.apk' || cleanUrl.endsWith('.apk')) {
              const apkPath = path.resolve(__dirname, 'public/super-podruga-30.apk');
              if (fs.existsSync(apkPath)) {
                const stat = fs.statSync(apkPath);
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Disposition': 'attachment; filename="super-podruga-30.apk"',
                  'Content-Length': stat.size,
                  'Accept-Ranges': 'bytes',
                  'Cache-Control': 'public, max-age=3600',
                });
                fs.createReadStream(apkPath).pipe(res);
                return;
              }
            }
            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            const cleanUrl = req.url?.split('?')[0] || '';
            if (cleanUrl === '/super-podruga-30.apk' || cleanUrl.endsWith('.apk')) {
              const apkPath = path.resolve(__dirname, 'public/super-podruga-30.apk');
              if (fs.existsSync(apkPath)) {
                const stat = fs.statSync(apkPath);
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Disposition': 'attachment; filename="super-podruga-30.apk"',
                  'Content-Length': stat.size,
                  'Accept-Ranges': 'bytes',
                  'Cache-Control': 'public, max-age=3600',
                });
                fs.createReadStream(apkPath).pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

