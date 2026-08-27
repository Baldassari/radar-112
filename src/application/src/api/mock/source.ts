import type {
  DistritoStats,
  HistoricoParams,
  HistoricoResult,
  Kpis,
  ListOcorrenciasParams,
  ListOcorrenciasResult,
  OcorrenciaDetalhe,
  OcorrenciaResumo,
  OcorrenciasSource,
  StreamEvent,
} from '../types';
import { OCORRENCIAS_ESTE_MES, store } from './store';

function paginate<T>(items: T[], cursor: string | undefined, limit: number): { items: T[]; nextCursor: string | null } {
  const offset = cursor ? Number(cursor) : 0;
  const slice = items.slice(offset, offset + limit);
  const nextOffset = offset + slice.length;
  return { items: slice, nextCursor: nextOffset < items.length ? String(nextOffset) : null };
}

function matchesFiltros(o: OcorrenciaResumo, params: ListOcorrenciasParams): boolean {
  if (params.distrito && o.distrito !== params.distrito) return false;
  if (params.niveis?.length && !params.niveis.includes(o.niv)) return false;
  if (params.tipos?.length && !params.tipos.includes(o.tipo)) return false;
  if (params.q) {
    const q = params.q.toLowerCase();
    if (!o.concelho.toLowerCase().includes(q) && !o.freguesia.toLowerCase().includes(q)) return false;
  }
  const view = params.view ?? 'Ativas';
  if (view === 'Ativas' && o.estado === 'Encerrada') return false;
  if (view === 'Histórico' && o.estado !== 'Encerrada') return false;
  return true;
}

export class MockOcorrenciasSource implements OcorrenciasSource {
  private tickHandle?: ReturnType<typeof setInterval>;
  private heartbeatHandle?: ReturnType<typeof setInterval>;
  private unsubscribeStore?: () => void;

  async listOcorrencias(params: ListOcorrenciasParams): Promise<ListOcorrenciasResult> {
    const todas = store.all().filter((o) => matchesFiltros(o, params));
    const { items, nextCursor } = paginate(todas, params.cursor, params.limit ?? 50);
    return { items, total: OCORRENCIAS_ESTE_MES, nextCursor };
  }

  async getOcorrencia(id: string): Promise<OcorrenciaDetalhe | null> {
    return store.get(id);
  }

  async listDistritos(): Promise<DistritoStats[]> {
    return store.distritos();
  }

  async getDistrito(nome: string): Promise<DistritoStats | null> {
    return store.distritos().find((d) => d.distrito === nome) ?? null;
  }

  async getHistorico(params: HistoricoParams): Promise<HistoricoResult> {
    const { dias, kpis, encerradas } = store.historico();
    const filtradas = encerradas.filter((o) => {
      if (params.tipo && o.tipo !== params.tipo) return false;
      if (params.de && (o.dia ?? '') < params.de) return false;
      if (params.ate && (o.dia ?? '') > params.ate) return false;
      if (params.q) {
        const q = params.q.toLowerCase();
        if (!o.concelho.toLowerCase().includes(q) && !o.freguesia.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const { items, nextCursor } = paginate(filtradas, params.cursor, params.limit ?? 12);
    return { items, total: OCORRENCIAS_ESTE_MES, nextCursor, ultimosCatorzeDias: dias, kpis };
  }

  async getKpis(): Promise<Kpis> {
    return store.kpis();
  }

  subscribe(onEvent: (event: StreamEvent) => void): () => void {
    this.unsubscribeStore?.();
    this.unsubscribeStore = store.onChange(onEvent);
    this.tickHandle = setInterval(() => store.tick(), 14_000);
    this.heartbeatHandle = setInterval(() => store.heartbeat(), 1_000);
    return () => {
      clearInterval(this.tickHandle);
      clearInterval(this.heartbeatHandle);
      this.unsubscribeStore?.();
    };
  }
}
