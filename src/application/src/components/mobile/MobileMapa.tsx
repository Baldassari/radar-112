import type { Kpis, OcorrenciaResumo } from '../../api/types';
import { PtMap, type MapMarker } from '../map/PtMap';
import './Mobile.css';
import { MobileKpiRow } from './MobileKpiRow';
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

      <MobileKpiRow
        items={[
          { label: 'Ativas', value: kpis?.ocorrenciasAtivas ?? 0 },
          { label: 'Vermelho', value: kpis?.nivelVermelho ?? 0, color: 'var(--niv-vermelho)' },
          { label: 'Meios', value: kpis?.meiosNoTerreno ?? 0 },
        ]}
      />

      <div className="rdr-mobile-map">
        <PtMap markers={markers} selected={selectedId} labels={false} onMarkerClick={onSelect} />
      </div>

      <PertoDeMimSheet items={items} onSelect={onSelect} />
    </div>
  );
}
