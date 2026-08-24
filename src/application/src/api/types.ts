import type { components } from './schema';

export type Nivel = components['schemas']['Nivel'];
export type Estado = components['schemas']['Estado'];
export type OcorrenciaResumo = components['schemas']['OcorrenciaResumo'];
export type OcorrenciaDetalhe = components['schemas']['OcorrenciaDetalhe'];
export type CronologiaEntry = components['schemas']['CronologiaEntry'];
export type Meio = components['schemas']['Meio'];
export type ImprensaLink = components['schemas']['ImprensaLink'];
export type ConcelhoAfetado = components['schemas']['ConcelhoAfetado'];
export type DistritoStats = components['schemas']['DistritoStats'];
export type HistoricoDia = components['schemas']['HistoricoDia'];
export type HistoricoKpis = components['schemas']['HistoricoKpis'];
export type Kpis = components['schemas']['Kpis'];

export type View = 'Ativas' | 'Todas' | 'Histórico';

export type ListOcorrenciasParams = {
  distrito?: string;
  niveis?: Nivel[];
  tipos?: string[];
  view?: View;
  q?: string;
  cursor?: string;
  limit?: number;
};

export type ListOcorrenciasResult = {
  items: OcorrenciaResumo[];
  total: number;
  nextCursor?: string | null;
};

export type HistoricoParams = {
  q?: string;
  de?: string;
  ate?: string;
  tipo?: string;
  cursor?: string;
  limit?: number;
};

export type HistoricoResult = {
  items: OcorrenciaResumo[];
  total: number;
  nextCursor?: string | null;
  ultimosCatorzeDias: HistoricoDia[];
  kpis: HistoricoKpis;
};

export type StreamEvent =
  | { type: 'ocorrencia.created'; payload: OcorrenciaResumo }
  | { type: 'ocorrencia.updated'; payload: OcorrenciaResumo }
  | { type: 'heartbeat'; payload: { syncedAt: string } };

/** Fonte de dados de ocorrências: a mesma interface por trás dos mocks e do
 * backend real, para que trocar de um para o outro não toque em componentes. */
export interface OcorrenciasSource {
  listOcorrencias(params: ListOcorrenciasParams): Promise<ListOcorrenciasResult>;
  getOcorrencia(id: string): Promise<OcorrenciaDetalhe | null>;
  listDistritos(): Promise<DistritoStats[]>;
  getDistrito(nome: string): Promise<DistritoStats | null>;
  getHistorico(params: HistoricoParams): Promise<HistoricoResult>;
  getKpis(): Promise<Kpis>;
  subscribe(onEvent: (event: StreamEvent) => void): () => void;
}
