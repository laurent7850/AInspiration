import { describe, expect, it } from 'vitest';
import { buildRobotsTxt } from '../../scripts/vite-plugin-seo-routes';
import routes from '../config/routes';
import { isNoindexRoute, noindexRoutes, seoPages } from '../config/seoConfig';

/**
 * The private pages were listed three times until 2026-10-07 — robots.txt, the
 * server, a noindex prop on each page — and robots.txt covered only the French
 * paths. The `noindex` flag in seoConfig is now the only list; these tests pin
 * what it must cover without writing the list a fourth time.
 */
const SAMPLE_ID = '0e3a4b1c-2d5f-4a6b-8c7d-9e0f1a2b3c4d';

describe('pages privées', () => {
  it('toute route protégée par connexion est marquée noindex', () => {
    const protectedPaths = routes.filter((r) => r.private).map((r) => r.path.replace('/:id', `/${SAMPLE_ID}`));
    expect(protectedPaths.length).toBeGreaterThan(10);
    expect(protectedPaths.filter((p) => !isNoindexRoute(p))).toEqual([]);
  });

  it('aucune page publique voisine n’est marquée par erreur', () => {
    for (const path of ['/', '/contact', '/produits', '/solutions', '/blog', '/realisations/audityo']) {
      expect(isNoindexRoute(path)).toBe(false);
    }
  });

  it('robots.txt exclut chaque page marquée, dans les trois langues, et rien d’autre', () => {
    const robots = buildRobotsTxt(noindexRoutes(), 'https://ainspiration.eu');
    const disallowed = robots.split('\n').filter((l) => l.startsWith('Disallow: ')).map((l) => l.slice(10));

    for (const route of noindexRoutes()) {
      for (const prefix of ['', '/en', '/nl']) expect(disallowed).toContain(`${prefix}${route}`);
    }
    const publicRoutes = Object.keys(seoPages).filter((r) => !seoPages[r].noindex);
    for (const prefix of ['', '/en', '/nl']) {
      for (const route of publicRoutes) expect(disallowed).not.toContain(`${prefix}${route}`.replace(/\/$/, '') || '/');
    }
  });

  it('robots.txt n’a qu’un groupe, qui garde /api/ et le sitemap', () => {
    const robots = buildRobotsTxt(noindexRoutes(), 'https://ainspiration.eu');
    expect(robots.match(/^User-agent:/gm)).toHaveLength(1);
    expect(robots).toMatch(/^Disallow: \/api\/$/m);
    expect(robots).toMatch(/^Sitemap: https:\/\/ainspiration\.eu\/sitemap\.xml$/m);
  });
});
