/**
 * Carte « Coûts OpenRouter » — lecture du résumé déjà mis en forme par le serveur.
 *
 * Le navigateur ne parle jamais à ORcosts. Il lit une route admin
 * d'AInspiration (GET /api/admin/orcosts-summary) qui a déjà appelé ORcosts
 * avec le jeton, validé la réponse et tronqué ce qui n'a rien à faire ici
 * (docker/backend/orcosts.js). Les types ci-dessous reflètent cette forme-là,
 * pas celle d'ORcosts.
 */
import { api } from '../utils/api';

export interface OrcostsApplication {
  name: string;
  client: string | null;
  eur: number;
}

export interface OrcostsCardAvailable {
  available: true;
  dashboardUrl: string;
  lastCollectionAt: string | null;
  period: { from: string; to: string };
  totals: {
    todayEur: number;
    last7Eur: number;
    monthEur: number;
    billableEur: number;
    /** Ratio (0.228 = +22,8 %), ou null si la période précédente est vide. */
    trend: number | null;
  };
  applications: OrcostsApplication[];
  unassignedKeys: number;
}

export type OrcostsUnavailableReason =
  | 'not_configured'
  | 'unauthorized'
  | 'rate_limited'
  | 'unavailable'
  | 'network'
  | 'invalid';

export interface OrcostsCardUnavailable {
  available: false;
  reason: OrcostsUnavailableReason;
  dashboardUrl: string;
}

export type OrcostsCard = OrcostsCardAvailable | OrcostsCardUnavailable;

export const ORCOSTS_DASHBOARD_URL = 'https://orcosts.distr-action.com';

export async function fetchOrcostsCard(): Promise<OrcostsCard> {
  return api.get<OrcostsCard>('/admin/orcosts-summary');
}
