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
// keeps a whole idea rather than half a phrase. English and Dutch titles put
// no space before the colon, so ': ' is a separator of its own.
const SUBTITLE_SEPARATORS = [' : ', ': ', ' — ', ' – ', ' | ', ' - '];

// Words that open a new group: a cut placed just before one of them ends on a
// whole phrase ("… par où commencer | quand on est …"). A cut placed anywhere
// else ends mid-phrase ("… when you are a small", "… with Generative").
const PHRASE_BOUNDARIES = new Set([
  // fr
  'a', 'à', 'au', 'aux', 'avec', 'dans', 'de', 'des', 'du', 'en', 'et', 'la',
  'le', 'les', 'par', 'pour', 'sans', 'sur', 'un', 'une', 'ou', 'chez', 'vers',
  'quand', 'lorsque', 'si', 'comme', 'grâce', 'afin', 'parce', 'mais',
  // en
  'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with', 'your',
  'an', 'or', 'when', 'if', 'as', 'while', 'because',
  // nl
  'aan', 'bij', 'het', 'met', 'naar', 'om', 'op', 'te', 'van', 'voor', 'zonder',
  'een', 'als', 'wanneer', 'omdat', 'terwijl',
]);

// Words that must not end a title: the boundaries above, plus the pronouns,
// auxiliaries and possessives a cut regularly strands ("… quand on est").
const TRAILING_STOPWORDS = new Set([
  ...PHRASE_BOUNDARIES,
  'est', 'sont', 'on', 'qui', 'que', 'son', 'sa', 'ses', 'vos', 'votre', 'nos', 'notre',
  'leur', 'leurs', 'ce', 'cette', 'ces', 'se', 'ne', 'il', 'elle',
  'is', 'are', 'be', 'it', 'its', 'our', 'you', 'we', 'how', 'why', 'what', 'that', 'this', 'their',
  'zijn', 'u', 'uw', 'je', 'jouw', 'die', 'dat', 'hoe', 'waarom', 'wat', 'hun', 'ons', 'onze',
]);

const bare = (word) => String(word || '').toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');

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

  // A word cut is kept when it falls on a phrase boundary ("… par où
  // commencer | quand on est"). Otherwise it ends mid-phrase ("… when you are
  // a small"), and the headline before the subtitle says more.
  const cut = cutToWords(title, TITLE_MAX);
  const firstRemoved = bare(title.slice(cut.length).trim().split(' ')[0]);
  // An empty word means the cut stopped on punctuation (": Le Guide"): a boundary too.
  const onBoundary = !firstRemoved || PHRASE_BOUNDARIES.has(firstRemoved) || /^\d+$/.test(firstRemoved);

  const separator = SUBTITLE_SEPARATORS
    .map((s) => ({ index: title.indexOf(s), length: s.length }))
    .filter(({ index }) => index >= 15 && index < cut.length)
    .sort((a, b) => a.index - b.index)[0];
  if (!separator) {
    if (onBoundary) return cut;
    // No headline to fall back on: step back to the last boundary word
    // ("… Content | with Generative" → "… Content"), if enough is left.
    const words = cut.split(' ');
    for (let i = words.length - 1; i >= 3; i--) {
      if (!PHRASE_BOUNDARIES.has(bare(words[i]))) continue;
      const shorter = trimTrailing(words.slice(0, i).join(' '));
      return shorter.length >= 30 ? shorter : cut;
    }
    return cut;
  }

  // A subtitle reduced to one or two words (": stratégies", ": Un tournant")
  // reads as cut even on a boundary, so it needs three to stay.
  const keptSubtitle = cut.slice(separator.index + separator.length).trim().split(' ').filter(Boolean);
  if (onBoundary && keptSubtitle.length >= 3) return cut;
  const headline = title.slice(0, separator.index).trim();
  return `${headline}${BRAND_SUFFIX}`.length <= TITLE_MAX ? `${headline}${BRAND_SUFFIX}` : headline;
}

// Accent- and punctuation-blind form, to tell an excerpt that merely repeats
// the title (the auto-blog wrote "L IA dans les PME du Hainaut : par ou
// commencer" under "L'IA dans les PME du Hainaut : par où commencer").
function fold(text) {
  return String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * The excerpt leads; when it is too short to fill a result snippet, the body
 * completes it. 23 of 102 articles had an excerpt under 120 characters, and
 * the crawler flagged every one of them.
 */
function composeSource(excerpt, fallbackText, title) {
  let lead = String(excerpt || '').trim().replace(/\s+/g, ' ');
  const rest = String(fallbackText || '').trim().replace(/\s+/g, ' ');
  if (lead && title && fold(lead) === fold(title)) lead = '';
  if (!lead) return rest;
  if (lead.length >= DESC_MIN || !rest) return lead;
  if (fold(rest).startsWith(fold(lead))) return rest;
  return `${/[.!?…]$/.test(lead) ? lead : `${lead}.`} ${rest}`;
}

/**
 * A description that stops at a full stop reads as written; one cut mid-clause
 * needs the ellipsis to say it was cut.
 */
function metaDescriptionFor(excerpt, fallbackText, title) {
  const text = composeSource(excerpt, fallbackText, title);
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

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', hellip: '…' };

/**
 * Paragraph text only, for a description. Stripping every tag ran the headings
 * into the prose: "LinkedIn + IA = prospection surpuissante LinkedIn compte…".
 * Falls back to the whole body when the article has no <p>.
 */
function paragraphTextFrom(html) {
  const source = String(html || '');
  const paragraphs = source.match(/<p[\s>][\s\S]*?<\/p>/gi);
  const text = (paragraphs ? paragraphs.join(' ') : source)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? m;
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    });
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = { metaTitleFor, metaDescriptionFor, paragraphTextFrom, TITLE_MAX, DESC_MAX, DESC_MIN };
