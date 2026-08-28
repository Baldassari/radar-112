import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NivSwatch } from '../components/common/NivTag';
import { MobileOcorrencias } from '../components/mobile/MobileOcorrencias';
import { useDistritos } from '../hooks/useDistritos';
import { useIsMobileViewport } from '../hooks/useMediaQuery';
import { useOcorrencias } from '../hooks/useOcorrencias';
import { downloadCsv, ocorrenciasToCsv } from '../lib/exportCsv';
import { NIVEL_LABEL } from '../lib/niveis';
import './OcorrenciasPage.css';

export function OcorrenciasPage() {
  const isMobile = useIsMobileViewport();
  const [q, setQ] = useState('');
  const [distrito, setDistrito] = useState('');
  const [limit, setLimit] = useState(50);
  const navigate = useNavigate();

  const { data: distritos } = useDistritos();
  const { data, isLoading } = useOcorrencias({ view: 'Todas', q: q || undefined, distrito: distrito || undefined, limit });

  const items = data?.items ?? [];

  if (isMobile) {
    return (
      <MobileOcorrencias
        items={items}
        total={data?.total ?? 0}
        isLoading={isLoading}
        distritos={distritos ?? []}
        q={q}
        onQChange={setQ}
        distrito={distrito}
        onDistritoChange={setDistrito}
        onExportCsv={() => downloadCsv('radar112-ocorrencias.csv', ocorrenciasToCsv(items))}
        hasMore={!!data?.nextCursor}
        onLoadMore={() => setLimit((l) => l + 50)}
      />
    );
  }

  return (
    <div className="rdr-page">
      <div className="rdr-page-header">
        <div>
          <h3>Ocorrências</h3>
          <p className="rdr-page-subtitle">Tabela completa, pesquisável e exportável.</p>
        </div>
        <div className="rdr-page-actions">
          <input
            className="input rdr-search-input"
            type="search"
            placeholder="Pesquisar concelho ou freguesia"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input rdr-distrito-select" value={distrito} onChange={(e) => setDistrito(e.target.value)}>
            <option value="">Todos os distritos</option>
            {(distritos ?? []).map((d) => (
              <option key={d.distrito} value={d.distrito}>
                {d.distrito}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 36 }}
            onClick={() => downloadCsv('radar112-ocorrencias.csv', ocorrenciasToCsv(items))}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Código</th>
            <th>Natureza</th>
            <th>Local</th>
            <th>Distrito</th>
            <th>Nível</th>
            <th>Estado</th>
            <th style={{ textAlign: 'right' }}>Meios</th>
            <th style={{ textAlign: 'right' }}>Operacionais</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={10}>A carregar…</td>
            </tr>
          )}
          {!isLoading && items.length === 0 && (
            <tr>
              <td colSpan={10}>Sem ocorrências para os filtros selecionados.</td>
            </tr>
          )}
          {items.map((o) => (
            <tr key={o.id}>
              <td className="tabular-nums">{o.hora}</td>
              <td>{o.id}</td>
              <td>
                <div className="rdr-natureza-title">{o.tipo}</div>
                <div className="rdr-natureza-sub">{o.subtipo}</div>
              </td>
              <td>{o.freguesia || o.concelho}</td>
              <td>{o.distrito}</td>
              <td>
                <span className="rdr-niv-cell">
                  <NivSwatch niv={o.niv} /> {NIVEL_LABEL[o.niv]}
                </span>
              </td>
              <td>
                <span className="tag tag-neutral">{o.estado}</span>
              </td>
              <td className="rdr-num-cell tabular-nums">{o.meios}</td>
              <td className="rdr-num-cell tabular-nums">{o.operacionais}</td>
              <td>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(`/ocorrencias/${o.id}`)}>
                  Detalhe →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rdr-page-footer">
        <span>
          A mostrar <span className="tabular-nums">{items.length}</span> de{' '}
          <span className="tabular-nums">{data?.total ?? 0}</span> ocorrências registadas este mês
        </span>
        <button type="button" className="btn btn-secondary" disabled={!data?.nextCursor} onClick={() => setLimit((l) => l + 50)}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
