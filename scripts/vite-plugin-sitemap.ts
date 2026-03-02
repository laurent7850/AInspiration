/**
 * Vite plugin: generate sitemap.xml at build time.
 *
 * - Emits all public (non-private) static routes with hreflang alternates.
 * - Fetches published blog posts from Express API and adds them dynamically.
 * - Writes dist/sitemap.xml (overwrites the static fallback from public/).
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

interface SitemapRoute {
  path: string;
  changefreq: string;
  priority: number;
}

// All public static routes with their SEO metadata
const staticRoutes: SitemapRoute[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/pourquoi-ia', changefreq: 'monthly', priority: 0.9 },
  { path: '/pour-qui-ia', changefreq: 'monthly', priority: 0.8 },
  { path: '/solutions', changefreq: 'weekly', priority: 0.9 },
  { path: '/analyse-ia', changefreq: 'monthly', priority: 0.8 },
  { path: '/transformation', changefreq: 'monthly', priority: 0.8 },
  { path: '/creation-visuelle', changefreq: 'monthly', priority: 0.8 },
  { path: '/automatisation', changefreq: 'monthly', priority: 0.8 },
  { path: '/assistants', changefreq: 'monthly', priority: 0.8 },
  { path: '/prompts', changefreq: 'weekly', priority: 0.8 },
  { path: '/creativite', changefreq: 'monthly', priority: 0.7 },
  { path: '/crm', changefreq: 'monthly', priority: 0.8 },
  { path: '/produits', changefreq: 'weekly', priority: 0.8 },
  { path: '/etudes-de-cas', changefreq: 'weekly', priority: 0.8 },
  { path: '/conseil', changefreq: 'monthly', priority: 0.7 },
  { path: '/formation', changefreq: 'monthly', priority: 0.7 },
  { path: '/accompagnement', changefreq: 'monthly', priority: 0.7 },
  { path: '/recommandations', changefreq: 'monthly', priority: 0.7 },
  { path: '/a-propos', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.9 },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/mentions-legales', changefreq: 'yearly', priority: 0.3 },
  { path: '/cgv', changefreq: 'yearly', priority: 0.3 },
  { path: '/cgu', changefreq: 'yearly', priority: 0.3 },
  { path: '/unsubscribe', changefreq: 'yearly', priority: 0.2 },
];

/** Build a single <url> entry with hreflang alternates for fr/en/nl. */
function buildUrlEntry(
  siteUrl: string,
  path: string,
  opts: { changefreq: string; priority: number; lastmod: string }
): string {
  const frUrl = `${siteUrl}${path}`;
  const suffix = path === '/' ? '' : path;
  const enUrl = `${siteUrl}/en${suffix}`;
  const nlUrl = `${siteUrl}/nl${suffix}`;

  return `  <url>
    <loc>${frUrl}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="nl" href="${nlUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>
    <lastmod>${opts.lastmod}</lastmod>
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
  </url>`;
}

/** Fetch published blog post slugs from Express API. */
async function fetchBlogSlugs(
  siteUrl: string
): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const url = `${siteUrl}/api/blog-posts?status=published`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `  ⚠️  Sitemap: could not fetch blog posts (${response.status} ${response.statusText})`
      );
      return [];
    }
    const posts = await response.json();
    return posts.map((p: any) => ({ slug: p.slug, updated_at: p.updated_at }));
  } catch (err) {
    console.warn('  ⚠️  Sitemap: could not fetch blog posts:', err);
    return [];
  }
}

/**
 * Vite plugin that generates dist/sitemap.xml after the build finishes.
 * Pass the site URL to fetch blog posts from the Express API.
 */
export function sitemapPlugin(siteUrl: string): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',

    async closeBundle() {
      const today = new Date().toISOString().split('T')[0];

      // 1. Static routes
      const entries = staticRoutes.map((route) =>
        buildUrlEntry(siteUrl, route.path, {
          changefreq: route.changefreq,
          priority: route.priority,
          lastmod: today,
        })
      );

      // 2. Dynamic blog posts from Express API
      let blogCount = 0;
      if (siteUrl) {
        const posts = await fetchBlogSlugs(siteUrl);
        blogCount = posts.length;
        for (const post of posts) {
          const lastmod = post.updated_at
            ? new Date(post.updated_at).toISOString().split('T')[0]
            : today;
          entries.push(
            buildUrlEntry(siteUrl, `/blog/${post.slug}`, {
              changefreq: 'monthly',
              priority: 0.7,
              lastmod,
            })
          );
        }
      }

      // 3. Write sitemap.xml
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

      writeFileSync(resolve('dist', 'sitemap.xml'), xml, 'utf-8');

      if (blogCount > 0) {
        console.log(
          `  ✅ sitemap.xml: ${staticRoutes.length} static + ${blogCount} blog posts`
        );
      } else {
        console.log(
          `  ✅ sitemap.xml: ${staticRoutes.length} static routes (no blog posts fetched)`
        );
      }
    },
  };
}
