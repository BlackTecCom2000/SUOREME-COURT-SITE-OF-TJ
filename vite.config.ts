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
    // The dev server must not watch build output or runtime data. Running
    // `build:client` while the dev server is up used to crash it with
    // `EBUSY: watch dist/client/.../scales.glb` (a locked .glb during write)
    // and triggered a spurious "page reload dist/client/index.html".
    // Glob strings did not match absolute Windows paths, so this is a
    // predicate on the path separator-agnostic directory name.
    watch: {
      ignored: (path: string) =>
        /(^|[\\/])(dist|data|backups|node_modules|\.git)([\\/]|$)/.test(path),
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
