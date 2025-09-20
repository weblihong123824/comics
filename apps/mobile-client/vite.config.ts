import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Comic Reader Mobile',
        short_name: 'Comic',
        description: '漫画阅读移动端',
        theme_color: '#2563eb',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    host: true // 允许外部访问
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@comic/ui-components': path.resolve(__dirname, '../../packages/ui-components/src'),
      '@comic/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@comic/shared-types': path.resolve(__dirname, '../../packages/shared-types/src')
    }
  }
});
