import React from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Coins, ExternalLink, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrcostsCardQuery } from '../../hooks/queries/useOrcosts';
import { ORCOSTS_DASHBOARD_URL, type OrcostsCardAvailable } from '../../services/orcostsService';
import Skeleton from '../ui/Skeleton';

// Format belge : « 1 234,56 € ». Intl met une espace fine insécable comme
// séparateur de milliers et une insécable avant le symbole.
const eur = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const formatEur = (value: number): string => eur.format(value);

const formatTrend = (ratio: number): string => {
  const pct = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 1 }).format(Math.abs(ratio * 100));
  return `${ratio >= 0 ? '+' : '−'}${pct} %`;
};

const formatCollectedAt = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Brussels',
  }).format(date);
};

const CardShell: React.FC<{ children: React.ReactNode; dashboardUrl: string }> = ({ children, dashboardUrl }) => (
  <section className="bg-white rounded-xl shadow-lg p-6 mb-6" aria-labelledby="orcosts-title">
    <div className="flex items-start justify-between gap-4 mb-4">
      <h2 id="orcosts-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Coins className="w-5 h-5 text-indigo-600" />
        Coûts OpenRouter
      </h2>
      <a
        href={dashboardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
      >
        Ouvrir ORcosts
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>
    </div>
    {children}
  </section>
);

const Unavailable: React.FC = () => (
  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 text-gray-600">
    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
    <div>
      <p className="font-medium text-gray-800">Chiffres indisponibles</p>
      <p className="text-sm">Le tableau de bord complet reste accessible sur ORcosts.</p>
    </div>
  </div>
);

const Loading: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Chargement des coûts OpenRouter">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={72} />)}
    </div>
    <Skeleton variant="rounded" height={140} />
  </div>
);

const Figures: React.FC<{ card: OrcostsCardAvailable }> = ({ card }) => {
  const { totals, applications, unassignedKeys } = card;
  const collectedAt = formatCollectedAt(card.lastCollectionAt);
  const trend = totals.trend;

  const tiles = [
    { label: "Aujourd'hui", value: totals.todayEur },
    { label: '7 derniers jours', value: totals.last7Eur },
    { label: 'Mois en cours', value: totals.monthEur },
    { label: 'À refacturer', value: totals.billableEur, accent: true },
  ];

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-lg p-4 ${tile.accent ? 'bg-indigo-50' : 'bg-gray-50'}`}>
            <dt className="text-sm text-gray-500">{tile.label}</dt>
            <dd className={`mt-1 text-2xl font-bold ${tile.accent ? 'text-indigo-700' : 'text-gray-900'}`}>
              {formatEur(tile.value)}
            </dd>
          </div>
        ))}
      </dl>

      {trend !== null && (
        <p className="flex items-center gap-1 text-sm">
          {trend > 0 ? (
            <ArrowUpRight className="w-4 h-4 text-amber-500" aria-hidden="true" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-green-500" aria-hidden="true" />
          )}
          <span className={trend > 0 ? 'text-amber-700' : 'text-green-700'}>{formatTrend(trend)}</span>
          <span className="text-gray-500">sur le mois, par rapport à la période précédente</span>
        </p>
      )}

      {applications.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Principales applications</h3>
          <ul className="divide-y divide-gray-100">
            {applications.map((app) => (
              <li key={app.name} className="flex items-center justify-between gap-4 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{app.name}</p>
                  <p className="text-gray-500 truncate">{app.client ?? 'Usage interne'}</p>
                </div>
                <span className="font-semibold text-gray-900 whitespace-nowrap">{formatEur(app.eur)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
        <span>{collectedAt ? `Dernière collecte : ${collectedAt}` : 'Dernière collecte inconnue'}</span>
        {unassignedKeys > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            {unassignedKeys} clé{unassignedKeys > 1 ? 's' : ''} non rattachée{unassignedKeys > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Carte « Coûts OpenRouter » du tableau de bord CRM.
 *
 * Réservée à l'administrateur : le compte de démonstration est public, et ses
 * chiffres ne le sont pas. Le serveur refuse de toute façon (403) un compte
 * non-admin — le garde ici évite seulement un appel inutile et une carte vide.
 */
const OpenRouterCostsCard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const query = useOrcostsCardQuery(isAdmin);

  if (!isAdmin) return null;

  if (query.isPending) {
    return (
      <CardShell dashboardUrl={ORCOSTS_DASHBOARD_URL}>
        <Loading />
      </CardShell>
    );
  }

  const card = query.data;
  if (query.isError || !card || !card.available) {
    return (
      <CardShell dashboardUrl={card?.dashboardUrl || ORCOSTS_DASHBOARD_URL}>
        <Unavailable />
      </CardShell>
    );
  }

  return (
    <CardShell dashboardUrl={card.dashboardUrl || ORCOSTS_DASHBOARD_URL}>
      <Figures card={card} />
    </CardShell>
  );
};

export default OpenRouterCostsCard;
