import { useQuery } from '@tanstack/react-query';
import { ocorrenciasSource } from '../api';
import { queryKeys } from '../api/queryKeys';

export function useDistritos() {
  return useQuery({
    queryKey: queryKeys.distritos(),
    queryFn: () => ocorrenciasSource.listDistritos(),
  });
}
