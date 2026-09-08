/**
 * Vite plugin: generate sitemap.xml at build time.
 *
 * - Emits all public (non-private) static routes with hreflang alternates.
 * - Fetches published blog posts from Express API and adds them dynamically.
 * - Writes dist/sitemap.xml (overwrites the static fallback from public/).
 */
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

interface SitemapRoute {
  path: string;
  changefreq: string;
  priority: number;
  /**
   * Git pathspecs whose last commit date becomes <lastmod>. Page component plus
   * the locale namespaces it renders. Omitted = the build date (pages whose
   * content comes from the database, e.g. the blog index).
   */
  sources?: string[];
}

const L = (ns: string) => `public/locales/*/${ns}.json`;
const page = (name: string) => `src/pages/${name}.tsx`;
const REALISATIONS = ['src/pages/RealisationDetailPage.tsx', 'src/data/realisations.ts', L('realisations')];

// All public static routes with their SEO metadata
const staticRoutes: SitemapRoute[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0, sources: [page('HomePage'), 'src/components/Hero.tsx', 'src/components/Offers.tsx', 'src/components/RealisationsShowcase.tsx', L('common'), L('pricing'), L('features')] },
  { path: '/solutions', changefreq: 'weekly', priority: 0.9, sources: [page('SolutionsPage'), L('solutions')] },
  { path: '/analyse-ia', changefreq: 'monthly', priority: 0.8, sources: [page('AnalyseIAPage'), L('analysis')] },
  { path: '/transformation', changefreq: 'monthly', priority: 0.8, sources: [page('TransformationPage'), L('transformation')] },
  { path: '/creation-ia', changefreq: 'monthly', priority: 0.8, sources: [page('CreationIAPage'), L('content')] },
  { path: '/automatisation', changefreq: 'monthly', priority: 0.8, sources: [page('AutomationPage'), L('automation'), L('common')] },
  { path: '/assistants', changefreq: 'monthly', priority: 0.8, sources: [page('VirtualAssistantsPage'), L('common')] },
  { path: '/prompts', changefreq: 'weekly', priority: 0.8, sources: [page('PromptOptimizationPage'), L('prompts'), L('common')] },
  { path: '/audit', changefreq: 'monthly', priority: 0.9, sources: [page('AuditPage'), L('audit')] },
  { path: '/crm', changefreq: 'monthly', priority: 0.8, sources: [page('CRMSolutionPage'), L('crm')] },
  { path: '/produits', changefreq: 'weekly', priority: 0.8, sources: [page('ProductsPage'), L('common')] },
  { path: '/realisations', changefreq: 'monthly', priority: 0.9, sources: [page('RealisationsPage'), 'src/data/realisations.ts', L('realisations')] },
  { path: '/pme-hainaut-bruxelles', changefreq: 'monthly', priority: 0.8, sources: [page('LocalPage'), L('local')] },
  // Detail pages, one per réalisation with a `complet` format. Kept in sync by
  // hand: src/data/realisations.ts is a TS module and this plugin runs before
  // the bundle exists, so it cannot import it.
  { path: '/realisations/facturation-automatisee', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/reconciliation-caisse', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/factures-fournisseurs', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/chat-ia-site', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/audityo', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/labo-nostalgie', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/autoseo', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/preparation-emission', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/dreamoracle', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/artpero', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/tl-services', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/playlist-spotify', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/veille-youtube', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/realisations/paperclip', changefreq: 'yearly', priority: 0.7, sources: REALISATIONS },
  { path: '/conseil', changefreq: 'monthly', priority: 0.7, sources: [page('ConsultingPage'), L('common')] },
  { path: '/formation', changefreq: 'monthly', priority: 0.7, sources: [page('FormationPage'), L('training'), L('common')] },
  { path: '/accompagnement', changefreq: 'monthly', priority: 0.7, sources: [page('CustomSupportPage'), L('support'), L('common')] },
  { path: '/recommandations', changefreq: 'monthly', priority: 0.7, sources: [page('RecommendationsPage'), L('recommendations')] },
  { path: '/a-propos', changefreq: 'monthly', priority: 0.6, sources: [page('AboutPage'), L('about')] },
  { path: '/contact', changefreq: 'monthly', priority: 0.9, sources: [page('ContactPage'), L('forms')] },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3, sources: [page('PrivacyPolicyPage'), L('legal')] },
  { path: '/mentions-legales', changefreq: 'yearly', priority: 0.3, sources: [page('MentionsLegalesPage'), L('legal')] },
  { path: '/cgv', changefreq: 'yearly', priority: 0.3, sources: [page('CGVPage'), L('legal')] },
  { path: '/cgu', changefreq: 'yearly', priority: 0.3, sources: [page('CGUPage'), L('legal')] },
  { path: '/unsubscribe', changefreq: 'yearly', priority: 0.2, sources: [page('UnsubscribePage'), L('forms')] },
];

/**
 * Date (YYYY-MM-DD) of the last commit touching any of the pathspecs, or null
 * when git is unavailable or nothing matched. Until 2026-09-08 every static
 * page carried the build date as <lastmod>, which tells crawlers "everything
 * changed" at every deploy — the signal is then ignored.
 */
function gitLastmod(pathspecs: string[]): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...pathspecs], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

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
    const posts = (await response.json()) as { slug: string; updated_at?: string }[];
    return posts.map((p) => ({ slug: p.slug, updated_at: p.updated_at ?? '' }));
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

      // 1. Static routes — <lastmod> from git, build date as a last resort
      let fromGit = 0;
      const entries = staticRoutes.map((route) => {
        const committed = route.sources ? gitLastmod(route.sources) : null;
        if (committed) fromGit++;
        const lastmod = committed || today;
        return buildUrlEntry(siteUrl, route.path, {
          changefreq: route.changefreq,
          priority: route.priority,
          lastmod,
        });
      });
      if (fromGit === 0) {
        console.warn('  ⚠️  Sitemap: git history unavailable, every static <lastmod> is the build date');
      }

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
