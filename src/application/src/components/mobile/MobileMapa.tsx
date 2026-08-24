import type { Kpis, OcorrenciaResumo } from '../../api/types';
import { PtMap, type MapMarker } from '../map/PtMap';
import './Mobile.css';
import { MobileTabBar } from './MobileTabBar';
import { PertoDeMimSheet } from './PertoDeMimSheet';

export function MobileMapa({
  items,
  kpis,
  selectedId,
  onSelect,
}: {
  items: OcorrenciaResumo[];
  kpis: Kpis | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const markers: MapMarker[] = items.map((o) => ({
    id: o.id,
    lat: o.lat,
    lon: o.lon,
    crit: o.niv,
    live: o.estado !== 'Encerrada',
  }));

  return (
    <div className="rdr-mobile-shell">
      <div className="rdr-mobile-header">
        <div className="rdr-mobile-brand">
          <span className="rdr-mobile-brand-mark" aria-hidden="true" />
          RADAR 112
        </div>
        <div className="rdr-mobile-live">
          <span className="rdr-mobile-live-dot" aria-hidden="true" />
          Em direto
        </div>
      </div>

      <div className="rdr-mobile-kpis">
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums">{kpis?.ocorrenciasAtivas ?? 0}</span>
          <span className="rdr-mobile-kpi-label">Ativas</span>
        </div>
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums" style={{ color: 'var(--niv-vermelho)' }}>
            {kpis?.nivelVermelho ?? 0}
          </span>
          <span className="rdr-mobile-kpi-label">Vermelho</span>
        </div>
        <div className="rdr-mobile-kpi">
          <span className="rdr-mobile-kpi-value tabular-nums">{kpis?.meiosNoTerreno ?? 0}</span>
          <span className="rdr-mobile-kpi-label">Meios</span>
        </div>
      </div>

      <div className="rdr-mobile-map">
        <PtMap markers={markers} selected={selectedId} labels={false} onMarkerClick={onSelect} />
      </div>

      <PertoDeMimSheet items={items} onSelect={onSelect} />
      <MobileTabBar active="Mapa" />
    </div>
  );
}
