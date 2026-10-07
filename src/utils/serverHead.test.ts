import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The hydrated page carried two titles and two canonicals until 2026-10-07,
 * the second canonical pointing /en pages at the French one.
 */
const SERVER_HEAD = `
  <title>Server title</title>
  <meta name="description" content="Server description">
  <meta name="viewport" content="width=device-width">
  <link rel="canonical" href="https://ainspiration.eu/en/audio">
  <link rel="alternate" hreflang="fr" href="https://ainspiration.eu/audio">
  <script type="application/ld+json">{"@type":"BlogPosting"}</script>
`;

function addClientTag(html: string): void {
  document.head.insertAdjacentHTML('beforeend', html);
}

async function loadModule() {
  vi.resetModules();
  return import('./serverHead');
}

afterEach(() => {
  document.head.innerHTML = '';
});

describe('dropServerDuplicates', () => {
  it('retire une balise du serveur dès que React a posé la sienne', async () => {
    document.head.innerHTML = SERVER_HEAD;
    const { dropServerDuplicates } = await loadModule();
    addClientTag('<title>Client title</title><link rel="canonical" href="https://ainspiration.eu/en/audio">');

    dropServerDuplicates();

    expect(Array.from(document.querySelectorAll('title')).map((t) => t.textContent)).toEqual(['Client title']);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('garde ce que React ne rend pas', async () => {
    document.head.innerHTML = SERVER_HEAD;
    const { dropServerDuplicates } = await loadModule();
    addClientTag('<title>Client title</title>');

    dropServerDuplicates();

    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Server description');
    expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
    expect(document.querySelector('link[hreflang="fr"]')).not.toBeNull();
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it('ne retire rien s’il est chargé après React', async () => {
    document.head.innerHTML = SERVER_HEAD;
    addClientTag('<title>Client title</title>');
    const { dropServerDuplicates } = await loadModule();

    dropServerDuplicates();

    expect(document.querySelectorAll('title')).toHaveLength(2);
  });
});
