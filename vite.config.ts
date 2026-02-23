import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'editor': ['react-quill', 'quill'],
          'vendor': ['react', 'react-dom'],
        }
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild'
  },
});
