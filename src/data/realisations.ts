/**
 * Réalisations — structural data.
 *
 * Split of concerns, decided in Phase 0 (docs/audit-realisations.md §1.2):
 * this module holds only what is NOT translatable — slugs, categories, years,
 * status, stacks, image paths and metric *values*. Every visible string lives in
 * the `realisations` i18n namespace, keyed by slug, so the three languages stay
 * in `public/locales/{fr,en,nl}/realisations.json` like the rest of the site.
 *
 * Why a TypeScript module rather than JSON in `public/`: `public/robots.txt`
 * disallows `/*.json$`, so a runtime-fetched data file would be invisible to
 * crawlers. Compiling the data into the bundle avoids that, and avoids a server
 * dependency for sixteen entries that change twice a year.
 *
 * NEVER add a real client name here. Anonymisation is decided per project in
 * docs/audit-realisations-addendum-local.md; the showcase names only TL Services
 * and L'Artpéro.
 */

/** Filter vocabulary — phrased in the client's words, never in jargon. */
export type RealisationCategory =
  | 'automatiser'
  | 'repondre'
  | 'creer'
  | 'exploiter'
  | 'conformite'
  | 'visible';

export const REALISATION_CATEGORIES: RealisationCategory[] = [
  'automatiser',
  'repondre',
  'creer',
  'exploiter',
  'conformite',
  'visible',
];

export type RealisationStatus = 'production' | 'prototype' | 'interne';

/**
 * `complet` — index card + detail page.
 * `reduit`  — index card only: one image and an explanation, no detail page,
 *             no metrics, no outbound link. Decided for Rampa and Enghien.
 */
export type RealisationFormat = 'complet' | 'reduit';

export interface RealisationMetric {
  /** Displayed as-is. Must be a measured or stated fact, never an estimate. */
  value: string;
  /** i18n key suffix, resolved as `<slug>.metrics.<labelKey>` */
  labelKey: string;
}

export interface Realisation {
  slug: string;
  categories: RealisationCategory[];
  year: number;
  status: RealisationStatus;
  format: RealisationFormat;
  /** Header metadata only (brief §5.3) — never an argument in the results block. */
  duration?: string;
  technologies: string[];
  /** Cover image; absent until Phase 4 produces the captures. */
  cover?: string;
  /** At most three. Empty is a deliberate choice, not an omission. */
  metrics: RealisationMetric[];
}

export const realisations: Realisation[] = [
  {
    slug: 'facturation-automatisee',
    categories: ['automatiser'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'Google Calendar', 'Google Sheets', 'SMTP'],
    metrics: [
      { value: '1 h → 13 s', labelKey: 'billing' },
      { value: '0', labelKey: 'reentry' },
    ],
  },
  {
    slug: 'reconciliation-caisse',
    categories: ['automatiser', 'exploiter'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['Python', 'Flask', 'Claude (OCR)', 'React', 'Excel'],
    metrics: [
      { value: '1 h / jour', labelKey: 'before' },
      { value: '2', labelKey: 'restaurants' },
    ],
  },
  {
    slug: 'factures-fournisseurs',
    categories: ['automatiser', 'exploiter'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['Python', 'pdfplumber', 'openpyxl'],
    metrics: [
      { value: '646', labelKey: 'references' },
      { value: '25', labelKey: 'formats' },
      { value: '2 jours', labelKey: 'manualEntry' },
    ],
  },
  {
    slug: 'chat-ia-site',
    categories: ['repondre'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'LangChain', 'OpenRouter'],
    metrics: [],
  },
  {
    slug: 'audityo',
    categories: ['conformite'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Auth.js', 'Stripe'],
    metrics: [],
  },
  {
    slug: 'labo-nostalgie',
    categories: ['creer', 'exploiter'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'Claude', 'Google Sheets', 'Gmail'],
    metrics: [
      { value: '1 h → 70 s', labelKey: 'composition' },
      { value: '5 / semaine', labelKey: 'listeners' },
    ],
  },
  {
    slug: 'autoseo',
    categories: ['creer', 'visible'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'Claude', 'PostgreSQL'],
    metrics: [
      { value: '50', labelKey: 'articles' },
      { value: '3', labelKey: 'brands' },
    ],
  },
  {
    slug: 'preparation-emission',
    categories: ['automatiser', 'creer'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'Claude', 'Google Sheets'],
    metrics: [{ value: '2 h → 3 min', labelKey: 'prep' }],
  },
  {
    slug: 'dreamoracle',
    categories: ['visible', 'creer'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'PWA'],
    metrics: [],
  },
  {
    slug: 'artpero',
    categories: ['visible', 'automatiser'],
    year: 2026,
    status: 'production',
    format: 'complet',
    duration: '8 semaines',
    technologies: ['React', 'Supabase', 'Stripe'],
    metrics: [],
  },
  {
    slug: 'tl-services',
    categories: ['visible'],
    year: 2026,
    status: 'production',
    format: 'complet',
    duration: '4 jours',
    technologies: ['Next.js', 'React', 'SMTP'],
    metrics: [{ value: '4 jours', labelKey: 'delivery' }],
  },
  {
    slug: 'playlist-spotify',
    categories: ['creer'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'Claude', 'API Spotify'],
    metrics: [{ value: '25–40 s', labelKey: 'toPlaylist' }],
  },
  {
    slug: 'enghien',
    categories: ['exploiter', 'repondre'],
    year: 2026,
    status: 'production',
    format: 'reduit',
    technologies: ['Next.js', 'pgvector', 'Claude'],
    metrics: [],
  },
  {
    slug: 'veille-youtube',
    categories: ['exploiter', 'automatiser'],
    year: 2026,
    status: 'production',
    format: 'complet',
    technologies: ['n8n', 'YouTube API', 'ElevenLabs', 'Google Sheets'],
    metrics: [],
  },
  {
    slug: 'paperclip',
    categories: ['exploiter'],
    year: 2026,
    status: 'interne',
    format: 'complet',
    technologies: ['Claude', 'Markdown'],
    metrics: [{ value: '10', labelKey: 'agents' }],
  },
  {
    slug: 'rampa',
    categories: ['exploiter'],
    year: 2026,
    status: 'production',
    format: 'reduit',
    technologies: ['Next.js', 'pgvector', 'Claude'],
    metrics: [],
  },
];

export const getRealisation = (slug: string): Realisation | undefined =>
  realisations.find((r) => r.slug === slug);

/** Slugs that own a detail page. `reduit` entries deliberately do not. */
export const detailSlugs = realisations
  .filter((r) => r.format === 'complet')
  .map((r) => r.slug);
