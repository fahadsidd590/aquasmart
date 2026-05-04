import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// `.env.development` lives next to this file (works even if `npm run dev` is started
// from another working directory). Restart dev after env changes.
// `VITE_API_PROXY_TARGET` is also exposed to the client as `import.meta.env.VITE_API_PROXY_TARGET`
// so `src/api.js` can call that host directly (full URL in Network tab).
export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, __dirname, '');
  const raw = env.VITE_API_PROXY_TARGET?.trim();
  const apiTarget = raw || 'http://localhost:5119';

  console.log(`[admin-web] dev proxy /api -> ${apiTarget}`);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
