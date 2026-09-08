'use strict';
/**
 * HTML sanitizer for server-rendered article bodies (extracted from
 * routes/seo.js on 2026-09-08 so it can be unit-tested: test/sanitize.test.mjs).
 *
 * SECURITY: article bodies are stored HTML (authenticated /api/blog-posts
 * writes and the AI generator) and are injected verbatim into the served
 * markup. A stored <script> or an onerror= attribute would execute in the
 * visitor's browser. Everything outside this allowlist is dropped before it
 * can reach the page. No dependency on purpose: this runs on every article
 * render and must keep working when node_modules is rebuilt.
 */

// HTML-escape helper for any value injected into the served markup.
const escHtml = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'span',
  'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a',
  'blockquote', 'code', 'pre', 'figure', 'figcaption', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
]);
const ALLOWED_ATTRS = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};
const URL_ATTRS = new Set(['href', 'src']);
const SAFE_URL = /^(https?:\/\/|\/|#|mailto:|tel:)/i;

function sanitizeArticleHtml(raw) {
  let html = String(raw || '');
  // Executable / embedding elements: drop the element *and* its content.
  html = html.replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '');
  // …and any unbalanced opening tag of the same kind left behind.
  html = html.replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[^>]*>/gi, '');
  return html.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_match, closing, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (closing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || [];
    const kept = [];
    const attrRe = /([a-z_:][a-z0-9_.:-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
    let attr;
    while ((attr = attrRe.exec(rawAttrs)) !== null) {
      const name = attr[1].toLowerCase();
      const value = attr[2].replace(/^["']|["']$/g, '');
      if (!allowed.includes(name)) continue;            // also drops every on* handler
      if (URL_ATTRS.has(name) && !SAFE_URL.test(value)) continue;
      kept.push(`${name}="${escHtml(value)}"`);
    }
    if (tag === 'a') kept.push('rel="noopener"');
    return `<${tag}${kept.length ? ' ' + kept.join(' ') : ''}>`;
  });
}

module.exports = { escHtml, sanitizeArticleHtml, ALLOWED_TAGS };
