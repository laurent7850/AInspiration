'use strict';
/**
 * Client ORcosts — le résumé des coûts OpenRouter, lu côté serveur seulement.
 *
 * ORcosts (orcosts.distr-action.com) expose `GET /api/v1/summary` derrière un
 * jeton Bearer. Ce module est le SEUL endroit d'AInspiration qui connaît ce
 * jeton : il le lit dans `ORCOSTS_API_TOKEN` au moment de l'appel, ne le
 * journalise jamais, et ne le renvoie jamais à qui que ce soit. Le navigateur
 * ne parle jamais à ORcosts — il reçoit, par une route admin, le résultat déjà
 * validé et déjà mis en forme (voir routes/orcosts.js).
 *
 * Trois propriétés, verrouillées par test/orcosts.test.mjs :
 *   1. tout ce qui vient du réseau passe par un schéma Zod STRICT — une clé
 *      inconnue, un type inattendu, un JSON tronqué = « indisponible », jamais
 *      une valeur partielle affichée comme vraie ;
 *   2. ORcosts n'est lu que QUATRE fois par jour : à 6 h, 10 h, 14 h et 18 h,
 *      heure de Bruxelles (décision de Laurent du 12/10/2026 — des chiffres
 *      rafraîchis toutes les quatre heures entre 6 h et 20 h suffisent). Un
 *      résultat est retenu jusqu'au créneau suivant ; de 18 h à 6 h, la carte
 *      montre les chiffres de 18 h. Un échec, lui, est retenu 60 s, ou le
 *      `Retry-After` d'un 429, pour réessayer sans marteler ;
 *   3. aucune erreur ne remonte brute : le résultat est `{ available: false,
 *      reason }` avec une raison parmi six mots-clés, et le message d'origine
 *      ne sort pas du serveur. Une variable absente FERME la porte
 *      (`not_configured`), elle ne fait pas appeler ORcosts sans jeton.
 *
 * Baseline Distr'Action, « Secrets et accès » et « Validation côté serveur ».
 */
const { z } = require('zod');

const DEFAULT_DASHBOARD_URL = 'https://orcosts.distr-action.com';
const DEFAULT_API_URL = 'https://orcosts.distr-action.com';
const SUMMARY_PATH = '/api/v1/summary';

// Heures (Europe/Brussels) auxquelles un résultat retenu devient périmé.
const REFRESH_HOURS = [6, 10, 14, 18];
const REFRESH_TIMEZONE = 'Europe/Brussels';
const FAILURE_TTL_MS = 60 * 1000;
const FAILURE_TTL_MAX_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 5000;

// Combien d'applications la carte montre. Tronqué ICI, pas dans le
// navigateur : le reste de la page ORcosts n'a rien à faire dans la réponse.
const TOP_APPLICATIONS = 5;

// ── Schéma ───────────────────────────────────────────────────────────────────
//
// Reflète la forme documentée par ORcosts, clé pour clé. `strictObject`
// refuse toute clé supplémentaire : si ORcosts change sa réponse, la carte
// passe en « indisponible » plutôt que d'afficher un chiffre dont on ne sait
// plus ce qu'il veut dire.
const num = z.number().finite();
const count = z.number().int().nonnegative();
const ratio = num.nullable();
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const httpUrl = z.string().url().refine((u) => /^https?:\/\//i.test(u), 'http(s) only');

const applicationSchema = z.strictObject({
  id: z.number().int(),
  name: z.string().min(1),
  client: z.string().nullable(),
  eur: num,
  usd: num,
  requests: count,
  marginPct: num.nullable(),
  billableEur: num.nullable(),
  trend: ratio,
});

const clientSchema = z.strictObject({
  name: z.string().min(1),
  applications: count,
  eur: num,
  billableEur: num,
});

const summarySchema = z.strictObject({
  generatedAt: z.iso.datetime({ offset: true }),
  lastCollectionAt: z.iso.datetime({ offset: true }).nullable(),
  dashboardUrl: httpUrl,
  currency: z.literal('EUR'),
  period: z.strictObject({ from: isoDay, to: isoDay }),
  totals: z.strictObject({
    todayEur: num,
    last7Eur: num,
    monthEur: num,
    periodEur: num,
    periodUsd: num,
    periodRequests: count,
    billableEur: num,
    previousPeriodEur: num,
    trend: ratio,
  }),
  applications: z.array(applicationSchema),
  clients: z.array(clientSchema),
  unassigned: z.strictObject({ eur: num, keys: count }),
  legacyEur: num,
});

// ── Mise en forme pour la carte ──────────────────────────────────────────────
//
// Le serveur décide de ce que la carte montre. Le navigateur ne reçoit que ces
// champs-là, dans cet ordre, déjà tronqués.
function toCard(summary) {
  return {
    available: true,
    dashboardUrl: summary.dashboardUrl || DEFAULT_DASHBOARD_URL,
    lastCollectionAt: summary.lastCollectionAt,
    period: summary.period,
    totals: {
      todayEur: summary.totals.todayEur,
      last7Eur: summary.totals.last7Eur,
      monthEur: summary.totals.monthEur,
      billableEur: summary.totals.billableEur,
      trend: summary.totals.trend,
    },
    applications: summary.applications.slice(0, TOP_APPLICATIONS).map((a) => ({
      name: a.name,
      client: a.client,
      eur: a.eur,
    })),
    unassignedKeys: summary.unassigned.keys,
  };
}

// Instant (ms UTC) du prochain créneau de rafraîchissement après `nowMs`.
//
// Calculé dans le fuseau de Bruxelles : la différence entre maintenant et le
// créneau est prise en heures locales, puis retranchée en millisecondes. Le
// seul écart possible est le changement d'heure, qui tombe toujours la nuit
// entre 18 h et 6 h : deux jours par an, la lecture de 6 h se fait à 5 h ou à
// 7 h. Acceptable pour des coûts lus quatre fois par jour.
const brusselsParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: REFRESH_TIMEZONE,
  hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
});

function nextRefreshAt(nowMs) {
  const parts = Object.fromEntries(brusselsParts.formatToParts(new Date(nowMs)).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour);
  const sinceHourMs = Number(parts.minute) * 60_000 + Number(parts.second) * 1_000 + (nowMs % 1_000);
  const next = REFRESH_HOURS.find((h) => h > hour);
  const hoursAhead = next !== undefined ? next - hour : 24 - hour + REFRESH_HOURS[0];
  return nowMs - sinceHourMs + hoursAhead * 3_600_000;
}

function unavailable(reason) {
  return { available: false, reason, dashboardUrl: DEFAULT_DASHBOARD_URL };
}

function retryAfterMs(response) {
  const raw = response.headers && response.headers.get ? response.headers.get('retry-after') : null;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return FAILURE_TTL_MS;
  return Math.min(Math.max(seconds * 1000, FAILURE_TTL_MS), FAILURE_TTL_MAX_MS);
}

/**
 * Fabrique un client. Tout est injectable pour les tests : `fetchImpl`,
 * l'environnement, l'horloge et le journal. En production, les valeurs par
 * défaut suffisent (voir `defaultClient`).
 */
function createOrcostsClient({
  fetchImpl = (...args) => globalThis.fetch(...args),
  env = process.env,
  now = Date.now,
  log = console,
} = {}) {
  let cache = null; // { expiresAt, value }

  function baseUrl() {
    const configured = (env.ORCOSTS_API_URL || '').trim();
    return (configured || DEFAULT_API_URL).replace(/\/+$/, '');
  }

  async function fetchSummary() {
    const token = (env.ORCOSTS_API_TOKEN || '').trim();
    if (!token) {
      log.warn('[orcosts] ORCOSTS_API_TOKEN absent — carte fermée.');
      return { value: unavailable('not_configured'), ttl: FAILURE_TTL_MS };
    }

    let response;
    try {
      response = await fetchImpl(baseUrl() + SUMMARY_PATH, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'error',
      });
    } catch (err) {
      // Pas de message : il peut contenir l'URL, et l'URL interne n'a rien à
      // faire dans un journal lisible par d'autres. Le code d'erreur suffit.
      const code = err && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 'timeout' : 'network';
      log.warn(`[orcosts] summary unreachable (${code}).`);
      return { value: unavailable('network'), ttl: FAILURE_TTL_MS };
    }

    if (response.status === 401) {
      log.warn('[orcosts] summary refused (HTTP 401) — jeton absent ou invalide.');
      return { value: unavailable('unauthorized'), ttl: FAILURE_TTL_MS };
    }
    if (response.status === 429) {
      const ttl = retryAfterMs(response);
      log.warn(`[orcosts] summary rate-limited (HTTP 429), retry in ${Math.round(ttl / 1000)}s.`);
      return { value: unavailable('rate_limited'), ttl };
    }
    if (response.status === 503) {
      log.warn('[orcosts] summary unavailable (HTTP 503) — API non configurée côté ORcosts.');
      return { value: unavailable('unavailable'), ttl: FAILURE_TTL_MS };
    }
    if (!response.ok) {
      log.warn(`[orcosts] summary failed (HTTP ${response.status}).`);
      return { value: unavailable('unavailable'), ttl: FAILURE_TTL_MS };
    }

    let body;
    try {
      body = await response.json();
    } catch {
      log.warn('[orcosts] summary is not JSON.');
      return { value: unavailable('invalid'), ttl: FAILURE_TTL_MS };
    }

    const parsed = summarySchema.safeParse(body);
    if (!parsed.success) {
      // Les chemins fautifs, pas les valeurs : assez pour diagnostiquer un
      // changement de forme, sans recopier la réponse dans le journal.
      const paths = parsed.error.issues.slice(0, 5).map((i) => i.path.join('.') || '(root)').join(', ');
      log.warn(`[orcosts] summary rejected by schema at: ${paths}.`);
      return { value: unavailable('invalid'), ttl: FAILURE_TTL_MS };
    }

    return { value: toCard(parsed.data), ttl: nextRefreshAt(now()) - now() };
  }

  let inflight = null;

  async function getSummary() {
    const t = now();
    if (cache && cache.expiresAt > t) return cache.value;
    // Une seule requête à la fois : dix onglets ouverts en même temps ne font
    // qu'un appel à ORcosts.
    if (!inflight) {
      inflight = fetchSummary()
        .then(({ value, ttl }) => {
          cache = { expiresAt: now() + ttl, value };
          return value;
        })
        .finally(() => { inflight = null; });
    }
    return inflight;
  }

  function reset() { cache = null; }

  return { getSummary, reset };
}

const defaultClient = createOrcostsClient();

module.exports = {
  createOrcostsClient,
  defaultClient,
  summarySchema,
  toCard,
  nextRefreshAt,
  DEFAULT_DASHBOARD_URL,
  REFRESH_HOURS,
  FAILURE_TTL_MS,
  TIMEOUT_MS,
  TOP_APPLICATIONS,
};
