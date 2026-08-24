import type {
  ConcelhoAfetado,
  CronologiaEntry,
  DistritoStats,
  Estado,
  HistoricoDia,
  HistoricoKpis,
  Kpis,
  Meio,
  OcorrenciaDetalhe,
  StreamEvent,
} from '../types';
import {
  DISTRITOS,
  ENTIDADES,
  ESTADOS_ATIVOS,
  FONTES_IMPRENSA,
  NIVEIS,
  SUBTIPOS,
  TIPOS,
  jitter,
  nextId,
  pick,
  randInt,
} from './data';

function horaAtual(offsetMin = 0): string {
  const d = new Date(Date.now() - offsetMin * 60_000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDur(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function parseDurMinutos(dur: string): number {
  const h = /(\d+)h/.exec(dur)?.[1];
  const m = /(\d+)m/.exec(dur)?.[1];
  return (h ? Number(h) * 60 : 0) + (m ? Number(m) : 0);
}

function novaCronologia(estado: Estado, tipo: string, local: string, desdeMin: number): CronologiaEntry[] {
  const passos: [Estado, string, string][] = [
    ['Despacho', 'Alerta recebido', `Alerta recebido para ${tipo.toLowerCase()} em ${local}.`],
    ['Em Curso', 'Meios acionados', 'Primeiros meios acionados e a caminho do local.'],
    ['Chegada ao TO', 'Chegada ao teatro de operações', 'Primeira equipa chegou ao local e iniciou avaliação.'],
    ['Em Resolução', 'Operação em curso', 'Meios no local a atuar; via com trânsito condicionado.'],
    ['Em Conclusão', 'Operação a concluir', 'Situação controlada; meios em fase de desmobilização.'],
    ['Vigilância', 'Em vigilância', 'Situação estabilizada, mantém-se acompanhamento no local.'],
    ['Encerrada', 'Ocorrência encerrada', 'Todos os meios desmobilizados. Ocorrência encerrada.'],
  ];
  const ordem = passos.map((p) => p[0]);
  const ate = ordem.indexOf(estado);
  const usados = ate === -1 ? passos : passos.slice(0, ate + 1);
  // Espaça os passos já ocorridos entre o momento do alerta (há `desdeMin`) e agora.
  return usados.map(([, titulo, texto], i) => {
    const fracao = usados.length > 1 ? i / (usados.length - 1) : 0;
    const offset = Math.round(desdeMin * (1 - fracao));
    return { hora: horaAtual(offset), titulo, texto };
  });
}

function novosMeios(count: number): Meio[] {
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    entidade: `${pick(ENTIDADES)} de ${pick(DISTRITOS).nome}`,
    meios: randInt(1, 3),
    operacionais: randInt(2, 12),
    chegada: i === 0 ? horaAtual(randInt(2, 40)) : '—',
    estado: i === 0 || Math.random() > 0.4 ? 'No local' : 'Em trânsito',
  }));
}

function novaImprensa(tipo: string, local: string): OcorrenciaDetalhe['imprensa'] {
  if (Math.random() < 0.4) return [];
  return Array.from({ length: randInt(1, 2) }, () => ({
    fonte: pick(FONTES_IMPRENSA),
    hora: horaAtual(randInt(5, 90)),
    titulo: `${tipo} mobiliza meios em ${local}`,
    url: 'https://example.org/noticia',
  }));
}

/** Ocorrências ao vivo guardam o instante exato do alerta para poder
 * recalcular `dur` ("desde o alerta") a cada leitura — o near-real-time do
 * README exige que a duração suba entre eventos SSE, não só quando o estado
 * muda. Ocorrências do arquivo (`dia` definido) já estão encerradas: a
 * duração fica fixa, não há `alertaTs` a acompanhar. */
type Stored = OcorrenciaDetalhe & { alertaTs?: number };

function criarOcorrencia(opts: { estado?: Estado; dia?: string } = {}): Stored {
  const distrito = pick(DISTRITOS);
  const local = pick(distrito.concelhos);
  const tipo = pick(TIPOS);
  const subtipo = pick(SUBTIPOS[tipo]);
  const niv = pick(NIVEIS);
  const estado = opts.estado ?? pick(ESTADOS_ATIVOS);
  const desdeMin = randInt(4, 260);
  const meios = randInt(1, 14);
  const operacionais = meios * randInt(3, 6);
  const local_label = local.freguesia || local.concelho;

  const hora = opts.dia
    ? `${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`
    : horaAtual(desdeMin);

  return {
    id: nextId(),
    dia: opts.dia,
    alertaTs: opts.dia ? undefined : Date.now() - desdeMin * 60_000,
    hora,
    tipo,
    subtipo,
    concelho: local.concelho,
    freguesia: local.freguesia,
    distrito: distrito.nome,
    niv,
    estado,
    meios,
    operacionais,
    lat: jitter(local.lat, 0.06),
    lon: jitter(local.lon, 0.06),
    dur: formatDur(desdeMin),
    viaturasEnvolvidas: tipo === 'Acidente rodoviário' ? randInt(1, 6) : 0,
    viaCortada: tipo === 'Acidente rodoviário' && Math.random() > 0.5,
    pontoDeSituacao:
      'Situação a ser acompanhada pelas equipas no local. Recomenda-se evitar a zona até indicação em contrário.',
    condicoesNoLocal: [
      { label: 'Trânsito', valor: tipo === 'Acidente rodoviário' ? 'Condicionado' : 'Normal' },
      { label: 'Visibilidade', valor: pick(['Boa', 'Reduzida', 'Boa', 'Boa']) },
      { label: 'Precipitação', valor: pick(['Sem chuva', 'Chuva fraca', 'Sem chuva']) },
      { label: 'Vento', valor: pick(['Fraco', 'Moderado', 'Fraco']) },
    ],
    cronologia: novaCronologia(estado, tipo, local_label, desdeMin),
    meiosNoLocal: novosMeios(Math.max(1, Math.round(meios / 3))),
    imprensa: novaImprensa(tipo, local_label),
  };
}

const PROGRESSAO: Estado[] = ['Despacho', 'Em Curso', 'Chegada ao TO', 'Em Resolução', 'Em Conclusão', 'Vigilância', 'Encerrada'];

function comDuracaoAtual(o: Stored): OcorrenciaDetalhe {
  if (o.alertaTs == null) return o;
  return { ...o, dur: formatDur(Math.round((Date.now() - o.alertaTs) / 60_000)) };
}

class OcorrenciasStore {
  private itens = new Map<string, Stored>();
  private listeners = new Set<(e: StreamEvent) => void>();
  private syncedAt = new Date();
  private historicoArquivo: OcorrenciaDetalhe[] = [];

  constructor() {
    for (let i = 0; i < 54; i += 1) {
      const o = criarOcorrencia();
      this.itens.set(o.id, o);
    }
    const hoje = new Date();
    for (let dia = 1; dia <= 14; dia += 1) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - dia);
      const diaISO = d.toISOString().slice(0, 10);
      const n = randInt(14, 26);
      for (let i = 0; i < n; i += 1) {
        this.historicoArquivo.push(criarOcorrencia({ estado: 'Encerrada', dia: diaISO }));
      }
    }
  }

  private emit(event: StreamEvent) {
    this.listeners.forEach((l) => l(event));
  }

  onChange(listener: (e: StreamEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  all(): OcorrenciaDetalhe[] {
    return [...this.itens.values()].map(comDuracaoAtual).sort((a, b) => (a.hora < b.hora ? 1 : -1));
  }

  get(id: string): OcorrenciaDetalhe | null {
    const o = this.itens.get(id);
    return o ? comDuracaoAtual(o) : null;
  }

  /** Chamado periodicamente pelo simulador: cria uma ocorrência nova ou faz
   * progredir o estado de uma já ativa, e notifica os subscritores. */
  tick(): void {
    this.syncedAt = new Date();
    const ativos = this.all().filter((o) => o.estado !== 'Encerrada');
    const criarNova = ativos.length < 20 || Math.random() < 0.45;

    if (criarNova) {
      const o = criarOcorrencia();
      this.itens.set(o.id, o);
      this.emit({ type: 'ocorrencia.created', payload: o });
      return;
    }

    const alvo = pick(ativos);
    const idx = PROGRESSAO.indexOf(alvo.estado);
    const proximo = PROGRESSAO[Math.min(idx + 1, PROGRESSAO.length - 1)];
    const atualizado: Stored = {
      ...alvo,
      estado: proximo,
      cronologia: novaCronologia(proximo, alvo.tipo, alvo.freguesia || alvo.concelho, parseDurMinutos(alvo.dur)),
    };
    this.itens.set(atualizado.id, atualizado);
    this.emit({ type: 'ocorrencia.updated', payload: atualizado });
  }

  heartbeat(): void {
    this.syncedAt = new Date();
    this.emit({ type: 'heartbeat', payload: { syncedAt: this.syncedAt.toISOString() } });
  }

  kpis(): Kpis {
    const ativos = this.all().filter((o) => o.estado !== 'Encerrada');
    const distritos = new Set(ativos.map((o) => o.distrito));
    return {
      ocorrenciasAtivas: ativos.length,
      nivelVermelho: ativos.filter((o) => o.niv === 'vermelho').length,
      meiosNoTerreno: ativos.reduce((s, o) => s + o.meios, 0),
      operacionais: ativos.reduce((s, o) => s + o.operacionais, 0),
      distritosComOcorrencias: distritos.size,
      avisoVermelhoAtivo:
        ativos.some((o) => o.niv === 'vermelho')
          ? {
              titulo: 'Aviso Vermelho',
              descricao: 'Chuva forte e vento — Leiria, Coimbra, Aveiro até às 22:00',
            }
          : null,
    };
  }

  distritos(): DistritoStats[] {
    const ativos = this.all().filter((o) => o.estado !== 'Encerrada');
    const totalAtivas = ativos.length || 1;
    return DISTRITOS.map(({ nome }) => {
      const doDistrito = ativos.filter((o) => o.distrito === nome);
      const porConcelho = new Map<string, number>();
      doDistrito.forEach((o) => porConcelho.set(o.concelho, (porConcelho.get(o.concelho) ?? 0) + 1));
      const concelhosMaisAfetados: ConcelhoAfetado[] = [...porConcelho.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([concelho, count]) => ({ concelho, count }));
      const tipoCounts = new Map<string, number>();
      doDistrito.forEach((o) => tipoCounts.set(o.tipo, (tipoCounts.get(o.tipo) ?? 0) + 1));
      const naturezaMaisFrequente = [...tipoCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        distrito: nome,
        ativas: doDistrito.length,
        vermelho: doDistrito.filter((o) => o.niv === 'vermelho').length,
        laranja: doDistrito.filter((o) => o.niv === 'laranja').length,
        amarelo: doDistrito.filter((o) => o.niv === 'amarelo').length,
        meios: doDistrito.reduce((s, o) => s + o.meios, 0),
        operacionais: doDistrito.reduce((s, o) => s + o.operacionais, 0),
        tempoMedioResposta: `${randInt(9, 24)}min`,
        naturezaMaisFrequente,
        pesoRelativo: Math.round((doDistrito.length / totalAtivas) * 1000) / 10,
        concelhosMaisAfetados,
      };
    }).sort((a, b) => b.ativas - a.ativas);
  }

  /** Arquivo completo da vista Histórico — independente do pool ao vivo do
   * Mapa/Timeline, com um `dia` explícito para agrupar por dia na tabela. */
  historico(): { dias: HistoricoDia[]; kpis: HistoricoKpis; encerradas: OcorrenciaDetalhe[] } {
    const porDia = new Map<string, number>();
    this.historicoArquivo.forEach((o) => {
      const d = o.dia as string;
      porDia.set(d, (porDia.get(d) ?? 0) + 1);
    });
    const dias: HistoricoDia[] = [...porDia.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([dia, count]) => ({ dia, count }));

    const rodoviarios = this.historicoArquivo.filter((o) => o.tipo === 'Acidente rodoviário').length;
    return {
      dias,
      kpis: {
        ocorrencias: this.historicoArquivo.length,
        tempoMedioResposta: `${randInt(11, 19)}min`,
        pctAcidentesRodoviarios: this.historicoArquivo.length
          ? Math.round((rodoviarios / this.historicoArquivo.length) * 1000) / 10
          : 0,
        avisosVermelhos: this.historicoArquivo.filter((o) => o.niv === 'vermelho').length,
      },
      encerradas: [...this.historicoArquivo].sort((a, b) => {
        const chaveA = `${a.dia ?? ''} ${a.hora}`;
        const chaveB = `${b.dia ?? ''} ${b.hora}`;
        return chaveA < chaveB ? 1 : -1;
      }),
    };
  }
}

export const store = new OcorrenciasStore();
export const OCORRENCIAS_ESTE_MES = 3482;
