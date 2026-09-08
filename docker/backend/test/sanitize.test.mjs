/**
 * Article-body sanitizer: stored HTML is injected server-side into every
 * article page. These cases are the ones that would become a stored XSS on
 * ainspiration.eu if the allowlist regressed. Run: `npm test` in docker/backend.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { sanitizeArticleHtml, escHtml } = require('../sanitize.js');

const clean = (s) => sanitizeArticleHtml(s);

test('keeps the editorial structure the auto-blog produces', () => {
  const body = '<h2>Titre</h2><p>Texte <strong>gras</strong> et <em>italique</em>.</p><ul><li>un</li><li>deux</li></ul>'
    + '<blockquote><p>cit.</p></blockquote><table><thead><tr><th colspan="2">a</th></tr></thead><tbody><tr><td>b</td><td>c</td></tr></tbody></table>';
  assert.equal(clean(body), body);
});

test('drops <script> with its content, even nested or uppercase', () => {
  assert.equal(clean('<p>a</p><script>alert(1)</script><p>b</p>'), '<p>a</p><p>b</p>');
  assert.equal(clean('<p>a</p><SCRIPT src="https://evil/x.js"></SCRIPT>'), '<p>a</p>');
  assert.equal(clean('<p>x</p><script>document.cookie'), '<p>x</p>document.cookie', 'unbalanced opening tag removed, text stays inert');
});

test('drops style, iframe, object, embed, svg, math, template, noscript', () => {
  for (const tag of ['style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'noscript']) {
    assert.equal(clean(`<p>ok</p><${tag}>payload</${tag}>`), '<p>ok</p>', tag);
  }
});

test('removes every event handler attribute', () => {
  assert.equal(clean('<img src="/a.png" onerror="alert(1)" alt="x">'), '<img src="/a.png" alt="x">');
  assert.equal(clean('<p onclick="alert(1)" onmouseover=alert(2)>t</p>'), '<p>t</p>');
  assert.equal(clean('<a href="/x" ONCLICK="alert(1)">l</a>'), '<a href="/x" rel="noopener">l</a>');
});

test('blocks javascript:, data: and vbscript: URLs but keeps safe schemes', () => {
  assert.equal(clean('<a href="javascript:alert(1)">l</a>'), '<a rel="noopener">l</a>');
  assert.equal(clean('<a href="JAVASCRIPT:alert(1)">l</a>'), '<a rel="noopener">l</a>');
  assert.equal(clean('<img src="data:text/html;base64,PHNjcmlwdD4=">'), '<img>');
  assert.equal(clean('<a href="vbscript:msgbox">l</a>'), '<a rel="noopener">l</a>');
  assert.equal(clean('<a href="https://ainspiration.eu/audit" title="t">l</a>'), '<a href="https://ainspiration.eu/audit" title="t" rel="noopener">l</a>');
  assert.equal(clean('<a href="mailto:contact@ainspiration.eu">m</a>'), '<a href="mailto:contact@ainspiration.eu" rel="noopener">m</a>');
  assert.equal(clean('<a href="#section">s</a>'), '<a href="#section" rel="noopener">s</a>');
});

test('drops unknown tags but keeps their text; drops style/class/id attributes', () => {
  assert.equal(clean('<div class="x" id="y"><p style="color:red">t</p><marquee>m</marquee></div>'), '<p>t</p>m');
  assert.equal(clean('<form action="/steal"><input name="pw"></form>'), '');
});

test('escapes quotes inside kept attribute values so they cannot break out', () => {
  assert.equal(clean('<img src="/a.png" alt=\'x" onerror="alert(1)\'>'), '<img src="/a.png" alt="x&quot; onerror=&quot;alert(1)">');
});

test('tolerates empty, null and non-string input', () => {
  assert.equal(clean(''), '');
  assert.equal(clean(null), '');
  assert.equal(clean(undefined), '');
  assert.equal(clean(42), '42');
});

test('escHtml neutralises the four HTML metacharacters', () => {
  assert.equal(escHtml('<a href="x">&</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  assert.equal(escHtml(null), '');
});
