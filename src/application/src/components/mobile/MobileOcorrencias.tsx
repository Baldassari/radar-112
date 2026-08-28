import { useNavigate } from 'react-router-dom';
import type { DistritoStats, OcorrenciaResumo } from '../../api/types';
import { MobileListRow } from './MobileListRow';
import './Mobile.css';

export function MobileOcorrencias({
  items,
  total,
  isLoading,
  distritos,
  q,
  onQChange,
  distrito,
  onDistritoChange,
  onExportCsv,
  hasMore,
  onLoadMore,
}: {
  items: OcorrenciaResumo[];
  total: number;
  isLoading: boolean;
  distritos: DistritoStats[];
  q: string;
  onQChange: (q: string) => void;
  distrito: string;
  onDistritoChange: (d: string) => void;
  onExportCsv: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="rdr-mobile-page">
      <div className="rdr-mobile-page-header">
        <h3>Ocorrências</h3>
        <p className="rdr-page-subtitle">Todas as ocorrências registadas, pesquisáveis e exportáveis.</p>
      </div>

      <div className="rdr-mobile-filters">
        <input
          className="input"
          type="search"
          placeholder="Pesquisar concelho ou freguesia"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
        <select className="input" value={distrito} onChange={(e) => onDistritoChange(e.target.value)}>
          <option value="">Todos os distritos</option>
          {distritos.map((d) => (
            <option key={d.distrito} value={d.distrito}>
              {d.distrito}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary btn-block" onClick={onExportCsv}>
          Exportar CSV
        </button>
      </div>

      <div className="rdr-mobile-list">
        {isLoading && <p className="rdr-mobile-list-empty">A carregar…</p>}
        {!isLoading && items.length === 0 && <p className="rdr-mobile-list-empty">Sem ocorrências para os filtros selecionados.</p>}
        {items.map((o) => (
          <MobileListRow
            key={o.id}
            id={o.id}
            niv={o.niv}
            title={`${o.tipo} · ${o.subtipo}`}
            meta={`${o.hora} · ${o.freguesia || o.concelho}, ${o.distrito} · ${o.estado} · ${o.meios} meios`}
            onSelect={(id) => navigate(`/ocorrencias/${id}`)}
          />
        ))}
      </div>

      <div className="rdr-mobile-page-footer">
        <span>
          A mostrar {items.length} de {total} ocorrências
        </span>
        <button type="button" className="btn btn-secondary" disabled={!hasMore} onClick={onLoadMore}>
          Carregar mais
        </button>
      </div>
    </div>
  );
}
