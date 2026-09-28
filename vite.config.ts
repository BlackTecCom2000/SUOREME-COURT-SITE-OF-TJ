import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    // The dev server must not watch build output or runtime data: running
    // `build:client` while the dev server is up used to kill it with
    // EBUSY on the locked .glb assets in dist/client.
    watch: {
      ignored: ['**/dist/**', '**/data/**', '**/backups/**', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: process.env.npm_lifecycle_event === 'build:server' ? undefined : {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          editor: ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
    },
  },
});
