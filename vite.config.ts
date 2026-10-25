import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    open: '/homework-seven.html',
  },
  build: {
    rollupOptions: {
      input: 'homework-seven.html',
    },
  },
});
