/**
 * Vite plugin: export the per-route, per-language SEO config to dist/seo-routes.json,
 * and generate dist/robots.txt from the same config.
 *
 * Why: docker/backend/server.js injects <title>, <meta description> and the H1
 * into the raw HTML for crawlers. Until 2026-09-05 it only knew the French
 * strings (its own `routeSEO` map), so /en/... and /nl/... were served with
 * French metadata and <html lang="fr">. src/config/seoConfig.ts already holds
 * fr/en/nl for every route; this plugin ships that single source of truth to
 * the server, the same way the locale JSON files are shipped.
 *
 * robots.txt (2026-10-07): the private pages were listed three times — in
 * public/robots.txt, in the server's own set, and as a noindex prop on each
 * page — and the lists had drifted: robots.txt covered only the French paths.
 * They now come from the `noindex` flag in seoConfig, for every language.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { seoPages, noindexRoutes } from '../src/config/seoConfig.ts';

export interface SeoRouteEntry {
  title: string;
  description: string;
}
export type SeoRoutesFile = Record<string, Record<'fr' | 'en' | 'nl', SeoRouteEntry> & { noindex?: true }>;

const LANG_PREFIXES = ['', '/en', '/nl'];

/**
 * One group for every crawler. The file used to carry separate Googlebot and
 * Bingbot groups; a crawler that finds a group of its own ignores the `*` one,
 * and those two groups had lost the /api/ and /stats.html rules.
 */
export function buildRobotsTxt(privateRoutes: string[], siteUrl: string): string {
  const disallow = LANG_PREFIXES.flatMap((prefix) => privateRoutes.map((route) => `Disallow: ${prefix}${route}`));
  return [
    '# Robots.txt for AInspiration — generated at build from src/config/seoConfig.ts',
    '# (routes flagged noindex). Do not edit dist/robots.txt by hand.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Private pages, in every language',
    ...disallow,
    '',
    '# API and system files',
    'Disallow: /api/',
    '# /locales/*.json must stay crawlable: Googlebot needs them to render the app',
    'Disallow: /stats.html',
    '',
    '# Crawl-delay for polite crawling (Google ignores it)',
    'Crawl-delay: 1',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export function seoRoutesPlugin(siteUrl = 'https://ainspiration.eu'): Plugin {
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
          ...(langs.noindex ? { noindex: true as const } : {}),
        };
      }
      const distDir = resolve(process.cwd(), 'dist');
      mkdirSync(distDir, { recursive: true });
      writeFileSync(resolve(distDir, 'seo-routes.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
      console.log(`[seo-routes] Wrote ${Object.keys(out).length} routes to dist/seo-routes.json`);

      const privateRoutes = noindexRoutes();
      writeFileSync(resolve(distDir, 'robots.txt'), buildRobotsTxt(privateRoutes, siteUrl), 'utf8');
      console.log(`[seo-routes] Wrote dist/robots.txt (${privateRoutes.length} private routes × ${LANG_PREFIXES.length} languages)`);
    },
  };
}
