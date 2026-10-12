import { useQuery } from '@tanstack/react-query';
import { fetchOrcostsCard } from '../../services/orcostsService';
import { qk } from './queryKeys';

// Le serveur ne lit ORcosts que quatre fois par jour (6 h, 10 h, 14 h, 18 h,
// heure de Bruxelles) et garde le résultat entre deux : le redemander plus
// souvent qu'un quart d'heure ne rapporte rien. Un seul essai — en cas d'échec
// la carte dit « indisponible », elle ne martèle pas l'API.
export function useOrcostsCardQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.orcosts.card,
    queryFn: fetchOrcostsCard,
    enabled,
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
}
