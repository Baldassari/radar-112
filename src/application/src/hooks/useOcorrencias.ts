import { useQuery } from '@tanstack/react-query';
import { ocorrenciasSource } from '../api';
import { queryKeys } from '../api/queryKeys';
import type { ListOcorrenciasParams } from '../api/types';

export function useOcorrencias(params: ListOcorrenciasParams) {
  return useQuery({
    queryKey: queryKeys.ocorrencias(params),
    queryFn: () => ocorrenciasSource.listOcorrencias(params),
  });
}

export function useOcorrencia(id: string | null) {
  return useQuery({
    queryKey: queryKeys.ocorrencia(id ?? ''),
    queryFn: () => ocorrenciasSource.getOcorrencia(id as string),
    enabled: id != null,
  });
}
