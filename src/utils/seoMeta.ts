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

// ': ' too: English and Dutch titles put no space before the colon.
const SUBTITLE_SEPARATORS = [' : ', ': ', ' — ', ' – ', ' | ', ' - '];

// Words that open a new group: a cut just before one ends on a whole phrase.
const PHRASE_BOUNDARIES = new Set([
  'a', 'à', 'au', 'aux', 'avec', 'dans', 'de', 'des', 'du', 'en', 'et', 'la',
  'le', 'les', 'par', 'pour', 'sans', 'sur', 'un', 'une', 'ou', 'chez', 'vers',
  'quand', 'lorsque', 'si', 'comme', 'grâce', 'afin', 'parce', 'mais',
  'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with', 'your',
  'an', 'or', 'when', 'if', 'as', 'while', 'because',
  'aan', 'bij', 'het', 'met', 'naar', 'om', 'op', 'te', 'van', 'voor', 'zonder',
  'een', 'als', 'wanneer', 'omdat', 'terwijl',
]);

// Words that must not end a title: the boundaries, plus stranded pronouns,
// auxiliaries and possessives ("… quand on est").
const TRAILING_STOPWORDS = new Set([
  ...PHRASE_BOUNDARIES,
  'est', 'sont', 'on', 'qui', 'que', 'son', 'sa', 'ses', 'vos', 'votre', 'nos', 'notre',
  'leur', 'leurs', 'ce', 'cette', 'ces', 'se', 'ne', 'il', 'elle',
  'is', 'are', 'be', 'it', 'its', 'our', 'you', 'we', 'how', 'why', 'what', 'that', 'this', 'their',
  'zijn', 'u', 'uw', 'je', 'jouw', 'die', 'dat', 'hoe', 'waarom', 'wat', 'hun', 'ons', 'onze',
]);

const bare = (word: string | undefined): string =>
  String(word || '').toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');

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

  // A word cut is kept when it falls on a phrase boundary (punctuation counts);
  // otherwise the headline before the subtitle says more than half a phrase.
  const cut = cutToWords(title, TITLE_MAX);
  const firstRemoved = bare(title.slice(cut.length).trim().split(' ')[0]);
  const onBoundary = !firstRemoved || PHRASE_BOUNDARIES.has(firstRemoved) || /^\d+$/.test(firstRemoved);

  const separator = SUBTITLE_SEPARATORS
    .map((s) => ({ index: title.indexOf(s), length: s.length }))
    .filter(({ index }) => index >= 15 && index < cut.length)
    .sort((a, b) => a.index - b.index)[0];
  if (!separator) {
    if (onBoundary) return cut;
    // No headline to fall back on: step back to the last boundary word.
    const words = cut.split(' ');
    for (let i = words.length - 1; i >= 3; i--) {
      if (!PHRASE_BOUNDARIES.has(bare(words[i]))) continue;
      const shorter = trimTrailing(words.slice(0, i).join(' '));
      return shorter.length >= 30 ? shorter : cut;
    }
    return cut;
  }

  // A subtitle reduced to one or two words reads as cut, so it needs three to stay.
  const keptSubtitle = cut.slice(separator.index + separator.length).trim().split(' ').filter(Boolean);
  if (onBoundary && keptSubtitle.length >= 3) return cut;
  const headline = title.slice(0, separator.index).trim();
  return `${headline}${BRAND_SUFFIX}`.length <= TITLE_MAX ? `${headline}${BRAND_SUFFIX}` : headline;
}

// Accent- and punctuation-blind form, to tell an excerpt that merely repeats the title.
function fold(text: string | null | undefined): string {
  return String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** The excerpt leads; when it is too short to fill a snippet, the body completes it. */
function composeSource(
  excerpt: string | null | undefined,
  fallbackText: string | null | undefined,
  title: string | null | undefined
): string {
  let lead = String(excerpt || '').trim().replace(/\s+/g, ' ');
  const rest = String(fallbackText || '').trim().replace(/\s+/g, ' ');
  if (lead && title && fold(lead) === fold(title)) lead = '';
  if (!lead) return rest;
  if (lead.length >= DESC_MIN || !rest) return lead;
  if (fold(rest).startsWith(fold(lead))) return rest;
  return `${/[.!?…]$/.test(lead) ? lead : `${lead}.`} ${rest}`;
}

/** A description stops at a full stop when one falls in range, else it says it was cut. */
export function metaDescriptionFor(
  excerpt: string | null | undefined,
  fallbackText?: string | null,
  title?: string | null
): string {
  const text = composeSource(excerpt, fallbackText, title);
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

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', hellip: '…',
};

/** Paragraph text only, so headings do not run into the prose of a description. */
export function paragraphTextFrom(html: string | null | undefined): string {
  const source = String(html || '');
  const paragraphs = source.match(/<p[\s>][\s\S]*?<\/p>/gi);
  const text = (paragraphs ? paragraphs.join(' ') : source)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? m;
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    });
  return text.replace(/\s+/g, ' ').trim();
}
