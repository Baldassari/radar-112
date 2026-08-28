import type { DistritoStats } from '../../api/types';
import { KpiGrid } from '../kpi/KpiGrid';
import { PtMap } from '../map/PtMap';
import './Mobile.css';

export function MobileDistritos({
  distritos,
  foco,
  onFocoChange,
}: {
  distritos: DistritoStats[];
  foco: DistritoStats | undefined;
  onFocoChange: (distrito: string) => void;
}) {
  const maxAtivas = Math.max(1, ...distritos.map((d) => d.ativas));
  const maxConcelho = Math.max(1, ...(foco?.concelhosMaisAfetados ?? []).map((c) => c.count));

  return (
    <div className="rdr-mobile-page">
      <div className="rdr-mobile-page-header">
        <h3>Distritos</h3>
        <p className="rdr-page-subtitle">Estatísticas por distrito. Toque para ver o detalhe.</p>
      </div>

      <div className="rdr-mobile-list">
        {distritos.map((d) => (
          <button
            key={d.distrito}
            type="button"
            className="rdr-mobile-card"
            style={{ textAlign: 'left', border: 0, background: 'transparent', font: 'inherit', color: 'inherit', width: '100%' }}
            onClick={() => onFocoChange(d.distrito)}
          >
            <div className="rdr-mobile-card-top">
              <span className="rdr-mobile-card-title">{d.distrito}</span>
              <span style={{ marginLeft: 'auto' }} className="tabular-nums">
                {d.ativas} ativas
              </span>
            </div>
            <div className="rdr-mobile-card-stats">
              <span style={{ color: '#EC3013' }} className="tabular-nums">
                {d.vermelho} vermelho
              </span>
              <span style={{ color: '#F07300' }} className="tabular-nums">
                {d.laranja} laranja
              </span>
              <span style={{ opacity: 0.7 }} className="tabular-nums">
                {d.amarelo} amarelo
              </span>
            </div>
            <div className="rdr-peso-bar-track">
              <div className="rdr-peso-bar-fill" style={{ width: `${(d.ativas / maxAtivas) * 100}%` }} />
            </div>
          </button>
        ))}
      </div>

      {foco && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <h4 style={{ margin: 0 }}>{foco.distrito}</h4>
            <span className="tabular-nums" style={{ opacity: 0.6 }}>
              {foco.ativas} ativas
            </span>
          </div>

          <div style={{ height: 220, position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
            <PtMap markers={[]} district={foco.distrito} labels />
          </div>

          <div style={{ marginTop: 14 }}>
            <KpiGrid
              items={[
                { label: 'Ativas agora', value: foco.ativas },
                { label: 'Operacionais', value: foco.operacionais ?? 0 },
                { label: 'Tempo médio de resposta', value: foco.tempoMedioResposta ?? '—' },
                { label: 'Natureza mais frequente', value: foco.naturezaMaisFrequente ?? '—' },
              ]}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <h6>Concelhos mais afetados</h6>
            {(foco.concelhosMaisAfetados ?? []).map((c, i) => (
              <div key={c.concelho} className="rdr-concelho-row">
                <span>{c.concelho}</span>
                <div className="rdr-concelho-bar-track">
                  <div
                    className="rdr-concelho-bar-fill"
                    style={{ width: `${(c.count / maxConcelho) * 100}%`, background: i === 0 ? '#EC3013' : 'rgba(32,30,29,.35)' }}
                  />
                </div>
                <span className="rdr-concelho-count tabular-nums">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
