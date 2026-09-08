/**
 * Titles and descriptions that fit where search engines display them.
 *
 * Twin of `docker/backend/seo-meta.js`. The two runtimes ship separately — the
 * backend is downloaded from GitHub at container boot, the front-end is bundled
 * by Vite — so the rules live twice, with the same cases pinned in both test
 * suites. Change one, change the other.
 *
 * They must agree because both write the same tags: the server injects them for
 * crawlers that do not run JavaScript, and this module rewrites them once the
 * app hydrates. When they disagreed, an article was served with a 55-character
 * title and rendered with an 83-character one, and the crawler saw the second.
 */

export const TITLE_MAX = 60;
export const DESC_MAX = 160;
export const DESC_MIN = 120;
const BRAND_SUFFIX = ' | Blog AInspiration';

const SUBTITLE_SEPARATORS = [' : ', ' — ', ' – ', ' | ', ' - '];

const TRAILING_STOPWORDS = new Set([
  'a', 'à', 'au', 'aux', 'avec', 'dans', 'de', 'des', 'du', 'en', 'et', 'la',
  'le', 'les', 'par', 'pour', 'sans', 'sur', 'un', 'une', 'ou', 'chez', 'vers',
  'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with', 'your',
  'aan', 'bij', 'het', 'met', 'naar', 'om', 'op', 'te', 'van', 'voor', 'zonder',
]);

function trimTrailing(text: string): string {
  const out = text.replace(/[\s,;:–—-]+$/u, '');
  const words = out.split(' ');
  while (words.length > 3 && TRAILING_STOPWORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(' ').replace(/[\s,;:–—-]+$/u, '');
}

function cutToWords(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return trimTrailing(lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, limit));
}

/** The brand suffix is kept only while there is room for it. */
export function metaTitleFor(rawTitle: string | null | undefined): string {
  const title = String(rawTitle || '').trim().replace(/\s+/g, ' ');
  if (!title) return 'Blog AInspiration';

  const withBrand = `${title}${BRAND_SUFFIX}`;
  if (withBrand.length <= TITLE_MAX) return withBrand;
  if (title.length <= TITLE_MAX) return title;

  for (const separator of SUBTITLE_SEPARATORS) {
    const index = title.lastIndexOf(separator);
    if (index >= 30 && index <= TITLE_MAX) return title.slice(0, index).trim();
  }

  return cutToWords(title, TITLE_MAX);
}

/** A description stops at a full stop when one falls in range, else it says it was cut. */
export function metaDescriptionFor(
  excerpt: string | null | undefined,
  fallbackText?: string | null
): string {
  const source = String(excerpt || '').trim() || String(fallbackText || '').trim();
  const text = source.replace(/\s+/g, ' ');
  if (!text || text.length <= DESC_MAX) return text;

  const sentenceEnd = /[.!?](\s|$)/g;
  let best = 0;
  let match: RegExpExecArray | null;
  while ((match = sentenceEnd.exec(text)) !== null) {
    const end = match.index + 1;
    if (end > DESC_MAX) break;
    best = end;
  }
  if (best >= DESC_MIN) return text.slice(0, best);

  return `${cutToWords(text, DESC_MAX - 1)}…`;
}

/** Article body as plain text, for when the excerpt is missing. */
export function plainTextFrom(html: string | null | undefined): string {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
