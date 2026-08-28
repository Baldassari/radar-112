import { useState } from 'react';
import { KpiGrid } from '../components/kpi/KpiGrid';
import { PtMap } from '../components/map/PtMap';
import { MobileDistritos } from '../components/mobile/MobileDistritos';
import { useDistritos } from '../hooks/useDistritos';
import { useIsMobileViewport } from '../hooks/useMediaQuery';
import './DistritosPage.css';

export function DistritosPage() {
  const isMobile = useIsMobileViewport();
  const { data } = useDistritos();
  const distritos = data ?? [];
  const [focoNome, setFocoNome] = useState<string | null>(null);
  const foco = distritos.find((d) => d.distrito === focoNome) ?? distritos[0];
  const maxAtivas = Math.max(1, ...distritos.map((d) => d.ativas));
  const maxConcelho = Math.max(1, ...(foco?.concelhosMaisAfetados ?? []).map((c) => c.count));

  if (isMobile) {
    return <MobileDistritos distritos={distritos} foco={foco} onFocoChange={setFocoNome} />;
  }

  return (
    <div className="rdr-page">
      <div className="rdr-page-header">
        <div>
          <h3>Distritos</h3>
          <p className="rdr-page-subtitle">Estatísticas por distrito com mapa focado.</p>
        </div>
      </div>

      <div className="rdr-distritos-body">
        <table className="table">
          <thead>
            <tr>
              <th>Distrito</th>
              <th style={{ textAlign: 'right' }}>Ativas</th>
              <th style={{ textAlign: 'right' }}>Vermelho</th>
              <th style={{ textAlign: 'right' }}>Laranja</th>
              <th style={{ textAlign: 'right' }}>Amarelo</th>
              <th>Peso relativo</th>
              <th style={{ textAlign: 'right' }}>Meios</th>
            </tr>
          </thead>
          <tbody>
            {distritos.map((d) => (
              <tr
                key={d.distrito}
                className="rdr-distrito-table-row"
                data-selected={foco?.distrito === d.distrito}
                onClick={() => setFocoNome(d.distrito)}
              >
                <td>{d.distrito}</td>
                <td className="rdr-num-cell tabular-nums">{d.ativas}</td>
                <td className="rdr-num-cell tabular-nums" style={{ color: '#EC3013' }}>
                  {d.vermelho}
                </td>
                <td className="rdr-num-cell tabular-nums" style={{ color: '#F07300' }}>
                  {d.laranja}
                </td>
                <td className="rdr-num-cell tabular-nums" style={{ opacity: 0.7 }}>
                  {d.amarelo}
                </td>
                <td>
                  <div className="rdr-peso-bar-track">
                    <div className="rdr-peso-bar-fill" style={{ width: `${(d.ativas / maxAtivas) * 100}%` }} />
                  </div>
                </td>
                <td className="rdr-num-cell tabular-nums">{d.meios}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {foco && (
          <div className="rdr-foco">
            <div className="rdr-foco-header">
              <h4 style={{ margin: 0 }}>{foco.distrito}</h4>
              <span className="tabular-nums" style={{ opacity: 0.6 }}>
                {foco.ativas} ativas
              </span>
            </div>

            <div className="rdr-foco-mapa">
              <PtMap markers={[]} district={foco.distrito} labels />
            </div>

            <KpiGrid
              items={[
                { label: 'Ativas agora', value: foco.ativas },
                { label: 'Operacionais', value: foco.operacionais ?? 0 },
                { label: 'Tempo médio de resposta', value: foco.tempoMedioResposta ?? '—' },
                { label: 'Natureza mais frequente', value: foco.naturezaMaisFrequente ?? '—' },
              ]}
            />

            <div>
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
    </div>
  );
}
