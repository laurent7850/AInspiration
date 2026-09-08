/**
 * Titles and descriptions that fit where search engines display them.
 *
 * Article meta was assembled without any bound: the title was always
 * `${post.title} | Blog AInspiration`, which turned a 74-character headline
 * into a 94-character title, and the description was the excerpt as typed —
 * 239 characters on one article. Google cuts both, so the end of the sentence
 * the reader was meant to act on never reaches the results page.
 *
 * The limits are the ones the SEO crawler checks: 60 characters for a title,
 * 120 to 160 for a description.
 */

const TITLE_MAX = 60;
const DESC_MAX = 160;
const DESC_MIN = 120;
const BRAND_SUFFIX = ' | Blog AInspiration';

// Separators an author uses to hang a subtitle off a title; cutting there
// keeps a whole idea rather than half a phrase.
const SUBTITLE_SEPARATORS = [' : ', ' — ', ' – ', ' | ', ' - '];

// Words that must not end a title: cutting on a word boundary regularly lands
// just after one, and "les meilleurs outils pour les" reads like a truncation.
const TRAILING_STOPWORDS = new Set([
  // fr
  'a', 'à', 'au', 'aux', 'avec', 'dans', 'de', 'des', 'du', 'en', 'et', 'la',
  'le', 'les', 'par', 'pour', 'sans', 'sur', 'un', 'une', 'ou', 'chez', 'vers',
  // en
  'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with', 'your',
  // nl
  'aan', 'bij', 'het', 'met', 'naar', 'om', 'op', 'te', 'van', 'voor', 'zonder',
]);

function trimTrailing(text) {
  let out = text.replace(/[\s,;:–—-]+$/u, '');
  const words = out.split(' ');
  while (words.length > 3 && TRAILING_STOPWORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(' ').replace(/[\s,;:–—-]+$/u, '');
}

/** Cut on the last word boundary that fits, never mid-word. */
function cutToWords(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return trimTrailing(lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, limit));
}

/**
 * The brand suffix is a nicety, the headline is the message: the suffix is
 * kept only while there is room for it.
 */
function metaTitleFor(rawTitle) {
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

/**
 * A description that stops at a full stop reads as written; one cut mid-clause
 * needs the ellipsis to say it was cut.
 */
function metaDescriptionFor(excerpt, fallbackText) {
  const source = String(excerpt || '').trim() || String(fallbackText || '').trim();
  const text = source.replace(/\s+/g, ' ');
  if (!text || text.length <= DESC_MAX) return text;

  const sentenceEnd = /[.!?](\s|$)/g;
  let best = 0;
  let match;
  while ((match = sentenceEnd.exec(text)) !== null) {
    const end = match.index + 1;
    if (end > DESC_MAX) break;
    best = end;
  }
  if (best >= DESC_MIN) return text.slice(0, best);

  return `${cutToWords(text, DESC_MAX - 1)}…`;
}

module.exports = { metaTitleFor, metaDescriptionFor, TITLE_MAX, DESC_MAX, DESC_MIN };
