import type {
  DistritoStats,
  HistoricoParams,
  HistoricoResult,
  Kpis,
  ListOcorrenciasParams,
  ListOcorrenciasResult,
  OcorrenciaDetalhe,
  OcorrenciasSource,
  StreamEvent,
} from '../types';

/** Implementação real, contra o backend .NET/WolverineFx, seguindo o mesmo
 * contrato de docs/api/openapi.yaml. Ativada quando VITE_API_BASE_URL está
 * definida (ver src/api/index.ts). */
export class RemoteOcorrenciasSource implements OcorrenciasSource {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private url(path: string, query: Record<string, unknown> = {}): string {
    const u = new URL(this.baseUrl.replace(/\/$/, '') + path, window.location.origin);
    for (const [k, v] of Object.entries(query)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((item) => u.searchParams.append(k, String(item)));
      else u.searchParams.set(k, String(v));
    }
    return u.toString();
  }

  private async json<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.url(path, query));
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return res.json() as Promise<T>;
  }

  listOcorrencias(params: ListOcorrenciasParams): Promise<ListOcorrenciasResult> {
    return this.json('/ocorrencias', params);
  }

  async getOcorrencia(id: string): Promise<OcorrenciaDetalhe | null> {
    const res = await fetch(this.url(`/ocorrencias/${encodeURIComponent(id)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`getOcorrencia → ${res.status}`);
    return res.json();
  }

  listDistritos(): Promise<DistritoStats[]> {
    return this.json('/distritos');
  }

  async getDistrito(nome: string): Promise<DistritoStats | null> {
    const res = await fetch(this.url(`/distritos/${encodeURIComponent(nome)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`getDistrito → ${res.status}`);
    return res.json();
  }

  getHistorico(params: HistoricoParams): Promise<HistoricoResult> {
    return this.json('/historico', params);
  }

  getKpis(): Promise<Kpis> {
    return this.json('/kpis');
  }

  subscribe(onEvent: (event: StreamEvent) => void): () => void {
    const es = new EventSource(this.url('/ocorrencias/stream'));
    const handler = (type: StreamEvent['type']) => (ev: MessageEvent<string>) => {
      onEvent({ type, payload: JSON.parse(ev.data) } as StreamEvent);
    };
    es.addEventListener('ocorrencia.created', handler('ocorrencia.created'));
    es.addEventListener('ocorrencia.updated', handler('ocorrencia.updated'));
    es.addEventListener('heartbeat', handler('heartbeat'));
    return () => es.close();
  }
}
