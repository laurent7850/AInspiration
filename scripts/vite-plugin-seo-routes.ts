/**
 * Vite plugin: export the per-route, per-language SEO config to dist/seo-routes.json.
 *
 * Why: docker/backend/server.js injects <title>, <meta description> and the H1
 * into the raw HTML for crawlers. Until 2026-09-05 it only knew the French
 * strings (its own `routeSEO` map), so /en/... and /nl/... were served with
 * French metadata and <html lang="fr">. src/config/seoConfig.ts already holds
 * fr/en/nl for every route; this plugin ships that single source of truth to
 * the server, the same way the locale JSON files are shipped.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { seoPages } from '../src/config/seoConfig';

export interface SeoRouteEntry {
  title: string;
  description: string;
}
export type SeoRoutesFile = Record<string, Record<'fr' | 'en' | 'nl', SeoRouteEntry>>;

export function seoRoutesPlugin(): Plugin {
  return {
    name: 'vite-plugin-seo-routes',
    apply: 'build',
    closeBundle() {
      const out: SeoRoutesFile = {};
      for (const [route, langs] of Object.entries(seoPages)) {
        out[route] = {
          fr: { title: langs.fr.title, description: langs.fr.description },
          en: { title: langs.en.title, description: langs.en.description },
          nl: { title: langs.nl.title, description: langs.nl.description },
        };
      }
      const distDir = resolve(process.cwd(), 'dist');
      mkdirSync(distDir, { recursive: true });
      const file = resolve(distDir, 'seo-routes.json');
      writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');
      console.log(`[seo-routes] Wrote ${Object.keys(out).length} routes to dist/seo-routes.json`);
    },
  };
}
