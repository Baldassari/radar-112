import { useState } from 'react';
import { FourteenDayBars } from '../components/charts/FourteenDayBars';
import { NivSwatch } from '../components/common/NivTag';
import { KpiGrid } from '../components/kpi/KpiGrid';
import { MobileHistorico } from '../components/mobile/MobileHistorico';
import { useHistorico } from '../hooks/useHistorico';
import { useIsMobileViewport } from '../hooks/useMediaQuery';
import { formatDiaLabel } from '../lib/format';
import { NIVEL_LABEL } from '../lib/niveis';
import './HistoricoPage.css';

const TIPOS_DISPONIVEIS = ['Acidente rodoviário', 'Salvamento', 'Emergência médica'];

export function HistoricoPage() {
  const isMobile = useIsMobileViewport();
  const [draft, setDraft] = useState({ q: '', de: '', ate: '', tipo: '' });
  const [applied, setApplied] = useState({ q: '', de: '', ate: '', tipo: '' });
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading } = useHistorico({
    q: applied.q || undefined,
    de: applied.de || undefined,
    ate: applied.ate || undefined,
    tipo: applied.tipo || undefined,
    cursor,
    limit: 12,
  });

  const items = data?.items ?? [];
  const showDiaFlags = items.reduce<{ prev?: string; flags: boolean[] }>(
    (acc, o) => {
      const dia = o.dia ?? '';
      acc.flags.push(dia !== acc.prev);
      acc.prev = dia;
      return acc;
    },
    { flags: [] },
  ).flags;

  if (isMobile) {
    return (
      <MobileHistorico
        items={items}
        total={data?.total ?? 0}
        isLoading={isLoading}
        draft={draft}
        onDraftChange={(patch) => setDraft((s) => ({ ...s, ...patch }))}
        onSearch={() => {
          setCursor(undefined);
          setApplied(draft);
        }}
        hasMore={!!data?.nextCursor}
        onLoadMore={() => setCursor(data?.nextCursor ?? undefined)}
        ultimosCatorzeDias={data?.ultimosCatorzeDias ?? []}
        kpis={data?.kpis}
      />
    );
  }

  return (
    <div>
      <div className="rdr-historico-search">
        <div className="field rdr-historico-q">
          <label htmlFor="hist-q">Localidade</label>
          <input
            id="hist-q"
            className="input"
            type="search"
            placeholder="Concelho ou freguesia"
            value={draft.q}
            onChange={(e) => setDraft((s) => ({ ...s, q: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="hist-de">De</label>
          <input id="hist-de" className="input" type="date" value={draft.de} onChange={(e) => setDraft((s) => ({ ...s, de: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="hist-ate">Até</label>
          <input id="hist-ate" className="input" type="date" value={draft.ate} onChange={(e) => setDraft((s) => ({ ...s, ate: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="hist-tipo">Natureza</label>
          <select id="hist-tipo" className="input" value={draft.tipo} onChange={(e) => setDraft((s) => ({ ...s, tipo: e.target.value }))}>
            <option value="">Todas</option>
            {TIPOS_DISPONIVEIS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setCursor(undefined);
            setApplied(draft);
          }}
        >
          Pesquisar
        </button>
      </div>

      <div className="rdr-historico-body">
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Hora</th>
                <th>Natureza</th>
                <th>Local</th>
                <th>Nível</th>
                <th>Duração</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7}>A carregar…</td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7}>Sem resultados para esta pesquisa.</td>
                </tr>
              )}
              {items.map((o, i) => {
                const dia = o.dia ?? '';
                const showDia = showDiaFlags[i];
                return (
                  <tr key={o.id}>
                    <td className={`rdr-dia-cell tabular-nums${showDia ? '' : ' hidden'}`}>{formatDiaLabel(dia)}</td>
                    <td className="tabular-nums">{o.hora}</td>
                    <td>{o.tipo}</td>
                    <td>{o.freguesia || o.concelho}</td>
                    <td>
                      <NivSwatch niv={o.niv} /> {NIVEL_LABEL[o.niv]}
                    </td>
                    <td className="tabular-nums">{o.dur}</td>
                    <td>
                      <span className="tag tag-neutral">Encerrada</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12.5 }}>
            <span>
              {items.length > 0 ? `1–${items.length}` : '0'} de <span className="tabular-nums">{data?.total ?? 0}</span> resultados
            </span>
            <button type="button" className="btn btn-ghost" disabled={!data?.nextCursor} onClick={() => setCursor(data?.nextCursor ?? undefined)}>
              Página seguinte →
            </button>
          </div>
        </div>

        <div className="rdr-historico-side">
          <div className="rdr-historico-side-section">
            <h6>Últimos 14 dias</h6>
            <FourteenDayBars dias={data?.ultimosCatorzeDias ?? []} />
          </div>
          <div className="rdr-historico-side-section">
            <h6>No período selecionado</h6>
            <KpiGrid
              items={[
                { label: 'Ocorrências', value: data?.kpis.ocorrencias ?? 0 },
                { label: 'Tempo médio de resposta', value: data?.kpis.tempoMedioResposta ?? '—' },
                { label: '% acidentes rodoviários', value: `${data?.kpis.pctAcidentesRodoviarios ?? 0}%` },
                { label: 'Avisos vermelhos', value: data?.kpis.avisosVermelhos ?? 0 },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
