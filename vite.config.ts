import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';

export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  console.log(`\n🔧 Building in ${mode.toUpperCase()} mode\n`);

  return {
    plugins: [
      react(),
      // Compression uniquement en production
      ...(isProd ? [
        compression({
          algorithm: 'gzip',
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 1024
        }),
        compression({
          algorithm: 'brotliCompress',
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 1024
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
            'supabase-vendor': ['@supabase/supabase-js'],
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
      }
    },
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      hmr: true,
      watch: {
        usePolling: false
      },
      // En dev, proxy les appels /api vers le VPS production
      ...(isDev ? {
        proxy: {
          '/api': {
            target: 'https://ainspiration.eu',
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
        '@supabase/supabase-js',
        'i18next',
        'react-i18next'
      ]
    },
    clearScreen: false
  };
});
