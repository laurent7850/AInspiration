import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import OpenRouterCostsCard from './OpenRouterCostsCard';
import type { OrcostsCard } from '../../services/orcostsService';

vi.mock('../../services/orcostsService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/orcostsService')>();
  return { ...actual, fetchOrcostsCard: vi.fn() };
});

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

import { fetchOrcostsCard } from '../../services/orcostsService';
import { useAuth } from '../../hooks/useAuth';

const mockedFetch = vi.mocked(fetchOrcostsCard);
const mockedAuth = vi.mocked(useAuth);

// Ce que le serveur renvoie pour le JSON d'exemple de la consigne, une fois
// validé et tronqué (docker/backend/orcosts.js, `toCard`).
const CARD: OrcostsCard = {
  available: true,
  dashboardUrl: 'https://orcosts.distr-action.com',
  lastCollectionAt: '2026-10-12T07:00:02.000Z',
  period: { from: '2026-10-01', to: '2026-10-12' },
  totals: { todayEur: 1.84, last7Eur: 12.4, monthEur: 38.12, billableEur: 46.9, trend: 0.228 },
  applications: [{ name: 'Paperclip (agents IA)', client: 'Radio Horizon', eur: 20.1 }],
  unassignedKeys: 1,
};

type AuthValue = ReturnType<typeof useAuth>;
const asUser = (role?: string): AuthValue => ({
  user: { id: 'u1', email: 'x@test', role },
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  loading: false,
});

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <OpenRouterCostsCard />
    </QueryClientProvider>
  );
}

// Les montants sortent d'Intl avec des espaces insécables : on compare sans.
const flat = (s: string | null) => (s || '').replace(/[\s\u00a0\u202f]/g, ' ');

describe('OpenRouterCostsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockReturnValue(asUser('admin'));
  });

  it('ne rend rien pour un compte non-admin et ne demande rien au serveur', () => {
    mockedAuth.mockReturnValue(asUser('user'));
    const { container } = renderCard();
    expect(container).toBeEmptyDOMElement();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('affiche les quatre chiffres, la tendance, les applications et le lien', async () => {
    mockedFetch.mockResolvedValue(CARD);
    renderCard();

    await waitFor(() => expect(screen.getByText("Aujourd'hui")).toBeInTheDocument());

    const dl = screen.getByRole('list', { hidden: true }).closest('section')!;
    const text = flat(dl.textContent);
    expect(text).toContain('1,84 €');
    expect(text).toContain('12,40 €');
    expect(text).toContain('38,12 €');
    expect(text).toContain('46,90 €');
    expect(text).toContain('À refacturer');
    expect(text).toContain('+22,8 %');
    expect(screen.getByText('Paperclip (agents IA)')).toBeInTheDocument();
    expect(screen.getByText('Radio Horizon')).toBeInTheDocument();
    expect(text).toContain('20,10 €');
    expect(text).toContain('1 clé non rattachée');
    expect(text).toContain('Dernière collecte : 12 oct. 2026');

    const link = screen.getByRole('link', { name: /Ouvrir ORcosts/ });
    expect(link).toHaveAttribute('href', 'https://orcosts.distr-action.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('formate les montants à la belge (milliers séparés, virgule décimale)', async () => {
    mockedFetch.mockResolvedValue({ ...CARD, totals: { ...CARD.totals, monthEur: 1234.56 } });
    renderCard();
    await waitFor(() => expect(screen.getByText("Aujourd'hui")).toBeInTheDocument());
    expect(flat(document.body.textContent)).toContain('1 234,56 €');
  });

  it('cache la tendance quand elle est nulle, et le pluriel des clés suit', async () => {
    mockedFetch.mockResolvedValue({ ...CARD, totals: { ...CARD.totals, trend: null }, unassignedKeys: 3 });
    renderCard();
    await waitFor(() => expect(screen.getByText("Aujourd'hui")).toBeInTheDocument());
    expect(flat(document.body.textContent)).not.toContain('période précédente');
    expect(flat(document.body.textContent)).toContain('3 clés non rattachées');
  });

  it('ne mentionne pas les clés non rattachées quand il n’y en a pas', async () => {
    mockedFetch.mockResolvedValue({ ...CARD, unassignedKeys: 0 });
    renderCard();
    await waitFor(() => expect(screen.getByText("Aujourd'hui")).toBeInTheDocument());
    expect(document.body.textContent).not.toContain('non rattachée');
  });

  for (const reason of ['unauthorized', 'rate_limited', 'unavailable'] as const) {
    it(`affiche « Chiffres indisponibles » avec le lien quand le serveur répond ${reason}`, async () => {
      mockedFetch.mockResolvedValue({ available: false, reason, dashboardUrl: 'https://orcosts.distr-action.com' });
      renderCard();
      await waitFor(() => expect(screen.getByText('Chiffres indisponibles')).toBeInTheDocument());
      expect(document.body.textContent).not.toContain(reason);
      expect(screen.getByRole('link', { name: /Ouvrir ORcosts/ })).toHaveAttribute('href', 'https://orcosts.distr-action.com');
    });
  }

  it('affiche « Chiffres indisponibles » si la requête elle-même échoue', async () => {
    mockedFetch.mockRejectedValue(new Error('boom'));
    renderCard();
    await waitFor(() => expect(screen.getByText('Chiffres indisponibles')).toBeInTheDocument());
    expect(document.body.textContent).not.toContain('boom');
    expect(screen.getByRole('link', { name: /Ouvrir ORcosts/ })).toHaveAttribute('href', 'https://orcosts.distr-action.com');
  });
});
