import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Использование локальной папки для кэша во избежание проблем с правами в node_modules
  cacheDir: '.vite_cache',
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    // Настройка для работы внутри Docker/VM
    watch: {
      usePolling: true,
    },
    // Отключаем overlay если он мешает, но сейчас он полезен для отладки
    hmr: {
      overlay: true,
    }
  },
  resolve: {
    // Явно указываем расширения для поиска файлов
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  }
});