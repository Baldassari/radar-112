import { useQuery } from '@tanstack/react-query';
import { ocorrenciasSource } from '../api';
import { queryKeys } from '../api/queryKeys';

export function useKpis() {
  return useQuery({
    queryKey: queryKeys.kpis(),
    queryFn: () => ocorrenciasSource.getKpis(),
  });
}
