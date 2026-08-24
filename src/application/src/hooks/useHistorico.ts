import { useQuery } from '@tanstack/react-query';
import { ocorrenciasSource } from '../api';
import { queryKeys } from '../api/queryKeys';
import type { HistoricoParams } from '../api/types';

export function useHistorico(params: HistoricoParams) {
  return useQuery({
    queryKey: queryKeys.historico(params),
    queryFn: () => ocorrenciasSource.getHistorico(params),
  });
}
