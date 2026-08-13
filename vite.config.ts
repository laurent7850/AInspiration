import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';
import { sitemapPlugin } from './scripts/vite-plugin-sitemap';

export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  console.log(`\n🔧 Building in ${mode.toUpperCase()} mode\n`);

  return {
    plugins: [
      react(),
      // Compression uniquement en production
      ...(isProd ? [
        compression({
          algorithm: 'gzip',
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 512
        }),
        compression({
          algorithm: 'brotliCompress',
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 512
        }),
      ] : []),
      // Bundle analyzer uniquement en production
      ...(isProd ? [
        visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        }),
      ] : []),
      // Sitemap dynamique (routes statiques + blog posts depuis Express API)
      ...(isProd ? [
        sitemapPlugin(env.VITE_SITE_URL || 'https://ainspiration.eu'),
      ] : []),
    ],
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isProd ? 'terser' : false,
      ...(isProd ? {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
          }
        },
      } : {}),
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
            'i18n-vendor': ['i18next', 'react-i18next', 'i18next-http-backend', 'i18next-browser-languagedetector']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      cssMinify: isProd
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      dedupe: ['react', 'react-dom']
    },
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      hmr: true,
      watch: {
        usePolling: false
      },
      // En dev, proxy les appels /api — utiliser DEV_API_TARGET pour pointer vers un backend local
      // Par défaut: production (ATTENTION: modifie les données réelles!)
      ...(isDev ? {
        proxy: {
          '/api': {
            target: process.env.DEV_API_TARGET || 'https://ainspiration.eu',
            changeOrigin: true,
            secure: true,
          }
        }
      } : {})
    },
    publicDir: 'public',
    optimizeDeps: {
      force: false,
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'i18next',
        'react-i18next',
        '@tanstack/react-query'
      ]
    },
    clearScreen: false
  };
});
