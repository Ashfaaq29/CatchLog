import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  if (mode === 'production' && !process.env.VITE_API_URL?.trim()) {
    throw new Error(
      'VITE_API_URL is required for production builds (e.g. http://51.20.7.80:5000/api). ' +
        'Set the GitHub Actions secret or frontend/.env before npm run build.',
    );
  }

  return {
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: { port: 3000, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
  },
  };
});
