/**
 * Le rendu sans JavaScript (#seo-fallback dans index.html) est la seule chose
 * que voient les robots des moteurs génératifs : ils n'exécutent pas le bundle
 * React. Tant qu'il portait style="display:none" et aria-hidden="true", les
 * extracteurs de texte (Readability, trafilatura et les pipelines qui s'en
 * servent) l'écartaient comme un contenu masqué — l'audit GEO du 12/09/2026
 * concluait « une partie du contenu n'apparaît qu'après exécution de
 * JavaScript » et « des informations présentes en JSON-LD ne sont pas visibles
 * dans la page », alors que le serveur y injecte tout.
 *
 * Le masquage doit donc rester dans la feuille de styles, jamais sur la balise.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const root = resolve(__dirname, '..', '..');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
const indexCss = readFileSync(resolve(root, 'src', 'index.css'), 'utf8');

const fallbackTag = indexHtml.match(/<div id="seo-fallback"[^>]*>/)?.[0] ?? '';

describe('rendu sans JavaScript servi aux crawlers', () => {
  it('la balise #seo-fallback existe', () => {
    expect(fallbackTag).not.toBe('');
  });

  it("ne se masque pas par un attribut style, invisible pour les extracteurs", () => {
    expect(fallbackTag).not.toMatch(/display\s*:\s*none/i);
    expect(fallbackTag).not.toMatch(/\bhidden\b/i);
  });

  it("n'est pas retiré de l'arbre d'accessibilité — sans JS, ce bloc EST la page", () => {
    expect(fallbackTag).not.toMatch(/aria-hidden/i);
  });

  it('est masqué par la feuille de styles pour les visiteurs, et rétabli en <noscript>', () => {
    expect(indexCss).toMatch(/#seo-fallback\s*\{[^}]*display:\s*none/);
    expect(indexHtml).toMatch(/<noscript><style>#seo-fallback\{display:block!important\}<\/style><\/noscript>/);
  });

  it('reprend en texte visible ce que le JSON-LD Organization déclare', () => {
    const jsonLd = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '';
    const graph = JSON.parse(jsonLd)['@graph'];
    const org = graph.find((n: { '@type': string }) => n['@type'] === 'Organization');
    const body = indexHtml.slice(indexHtml.indexOf('<div id="seo-fallback"'));

    expect(body).toContain(org.email);
    expect(body).toContain(org.address.streetAddress.replace('Chaussee', 'Chaussée'));
    expect(body).toContain(org.address.addressLocality);
    expect(body).toContain(org.sameAs[0]);
    // Le téléphone est écrit en groupes lisibles dans le texte, en E.164 dans
    // le balisage : on compare les chiffres.
    expect(body.replace(/[^0-9+]/g, '')).toContain(org.telephone.replace(/[^0-9+]/g, ''));
  });
});
