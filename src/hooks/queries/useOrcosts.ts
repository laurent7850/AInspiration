import { useQuery } from '@tanstack/react-query';
import { fetchOrcostsCard } from '../../services/orcostsService';
import { qk } from './queryKeys';

// Le serveur garde déjà le résultat 5 minutes : inutile de le redemander plus
// souvent côté navigateur. Un seul essai — en cas d'échec la carte dit
// « indisponible », elle ne martèle pas l'API.
export function useOrcostsCardQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.orcosts.card,
    queryFn: fetchOrcostsCard,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
