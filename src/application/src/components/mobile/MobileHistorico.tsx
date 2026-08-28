import type { HistoricoDia, HistoricoKpis, OcorrenciaResumo } from '../../api/types';
import { FourteenDayBars } from '../charts/FourteenDayBars';
import { NivSwatch } from '../common/NivTag';
import { KpiGrid } from '../kpi/KpiGrid';
import { formatDiaLabel } from '../../lib/format';
import { NIVEL_LABEL } from '../../lib/niveis';
import './Mobile.css';

export function MobileHistorico({
  items,
  total,
  isLoading,
  draft,
  onDraftChange,
  onSearch,
  hasMore,
  onLoadMore,
  ultimosCatorzeDias,
  kpis,
}: {
  items: OcorrenciaResumo[];
  total: number;
  isLoading: boolean;
  draft: { q: string; de: string; ate: string; tipo: string };
  onDraftChange: (patch: Partial<{ q: string; de: string; ate: string; tipo: string }>) => void;
  onSearch: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  ultimosCatorzeDias: HistoricoDia[];
  kpis: HistoricoKpis | undefined;
}) {
  const TIPOS_DISPONIVEIS = ['Acidente rodoviário', 'Salvamento', 'Emergência médica'];
  const showDiaFlags = items.reduce<{ prev?: string; flags: boolean[] }>(
    (acc, o) => {
      const dia = o.dia ?? '';
      acc.flags.push(dia !== acc.prev);
      acc.prev = dia;
      return acc;
    },
    { flags: [] },
  ).flags;

  return (
    <div className="rdr-mobile-page">
      <div className="rdr-mobile-page-header">
        <h3>Histórico</h3>
        <p className="rdr-page-subtitle">Arquivo de ocorrências encerradas.</p>
      </div>

      <div className="rdr-mobile-filters">
        <input
          className="input"
          type="search"
          placeholder="Concelho ou freguesia"
          value={draft.q}
          onChange={(e) => onDraftChange({ q: e.target.value })}
        />
        <input className="input" type="date" value={draft.de} onChange={(e) => onDraftChange({ de: e.target.value })} />
        <input className="input" type="date" value={draft.ate} onChange={(e) => onDraftChange({ ate: e.target.value })} />
        <select className="input" value={draft.tipo} onChange={(e) => onDraftChange({ tipo: e.target.value })}>
          <option value="">Todas as naturezas</option>
          {TIPOS_DISPONIVEIS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-block" onClick={onSearch}>
          Pesquisar
        </button>
      </div>

      <div className="rdr-mobile-list">
        {isLoading && <p className="rdr-mobile-list-empty">A carregar…</p>}
        {!isLoading && items.length === 0 && <p className="rdr-mobile-list-empty">Sem resultados para esta pesquisa.</p>}
        {items.map((o, i) => {
          const dia = o.dia ?? '';
          return (
            <div key={o.id}>
              {showDiaFlags[i] && <div className="rdr-mobile-list-day">{formatDiaLabel(dia)}</div>}
              <div className="rdr-mobile-card">
                <div className="rdr-mobile-card-top">
                  <NivSwatch niv={o.niv} /> {NIVEL_LABEL[o.niv]}
                  <span style={{ marginLeft: 'auto' }} className="tabular-nums">
                    {o.hora}
                  </span>
                </div>
                <div className="rdr-mobile-card-title">{o.tipo}</div>
                <div className="rdr-mobile-card-meta">{o.freguesia || o.concelho}</div>
                <div className="rdr-mobile-card-stats">
                  <span className="tabular-nums">{o.dur}</span>
                  <span className="tag tag-neutral">Encerrada</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rdr-mobile-page-footer">
        <span>
          {items.length > 0 ? `1–${items.length}` : '0'} de {total} resultados
        </span>
        <button type="button" className="btn btn-ghost" disabled={!hasMore} onClick={onLoadMore}>
          Página seguinte →
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h6>Últimos 14 dias</h6>
        <FourteenDayBars dias={ultimosCatorzeDias} />
      </div>
      <div style={{ marginTop: 20 }}>
        <h6>No período selecionado</h6>
        <KpiGrid
          items={[
            { label: 'Ocorrências', value: kpis?.ocorrencias ?? 0 },
            { label: 'Tempo médio de resposta', value: kpis?.tempoMedioResposta ?? '—' },
            { label: '% acidentes rodoviários', value: `${kpis?.pctAcidentesRodoviarios ?? 0}%` },
            { label: 'Avisos vermelhos', value: kpis?.avisosVermelhos ?? 0 },
          ]}
        />
      </div>
    </div>
  );
}
