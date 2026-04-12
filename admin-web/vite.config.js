import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Copy `.env.development.example` → `.env.development` and set VITE_API_PROXY_TARGET
// to the same base URL you use for Swagger (e.g. http://192.168.100.49:5119).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5119';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
