/**
 * The <head> tags the server injected, set aside before React renders.
 *
 * The server writes a full set of SEO tags into the raw HTML for crawlers that
 * do not run JavaScript. Once the app hydrates, SEOHead renders its own set, and
 * React 19 hoists those into <head> without removing the server's: until
 * 2026-10-07 every page ended up with two titles, two descriptions, two sets of
 * Open Graph tags — and two canonicals, the second one pointing at the French
 * page from /en and /nl.
 *
 * This module must be imported before React renders (first import of main.tsx).
 * If it ever runs late, the snapshot includes React's tags as well, and
 * `dropServerDuplicates` then finds nothing to remove: it fails safe.
 */

const serverTags: Set<Element> =
  typeof document === 'undefined' ? new Set() : new Set(Array.from(document.head.children));

/** The identity of a head tag that SEOHead also renders; null for anything else. */
function tagKey(el: Element): string | null {
  switch (el.tagName) {
    case 'TITLE':
      return 'title';
    case 'META': {
      const name = el.getAttribute('name');
      const property = el.getAttribute('property');
      if (name) return `name:${name}`;
      if (property) return `property:${property}`;
      return null;
    }
    case 'LINK': {
      const rel = el.getAttribute('rel');
      if (rel === 'canonical') return 'canonical';
      const hreflang = el.getAttribute('hreflang');
      if (rel === 'alternate' && hreflang) return `alternate:${hreflang}`;
      return null;
    }
    default:
      return null; // scripts (JSON-LD), styles, preloads: never touched
  }
}

/**
 * Removes each server tag whose key React has now rendered too. A server tag
 * with no client counterpart stays: nothing is lost, only duplicates go.
 */
export function dropServerDuplicates(): void {
  if (serverTags.size === 0) return;
  const clientKeys = new Set<string>();
  for (const el of Array.from(document.head.children)) {
    if (serverTags.has(el)) continue;
    const key = tagKey(el);
    if (key) clientKeys.add(key);
  }
  for (const el of Array.from(serverTags)) {
    const key = tagKey(el);
    if (key && clientKeys.has(key)) {
      el.remove();
      serverTags.delete(el);
    }
  }
}
