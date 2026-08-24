import type { HistoricoParams, ListOcorrenciasParams } from './types';

export const queryKeys = {
  ocorrencias: (params: ListOcorrenciasParams) => ['ocorrencias', params] as const,
  ocorrencia: (id: string) => ['ocorrencia', id] as const,
  distritos: () => ['distritos'] as const,
  distrito: (nome: string) => ['distrito', nome] as const,
  historico: (params: HistoricoParams) => ['historico', params] as const,
  kpis: () => ['kpis'] as const,
};
