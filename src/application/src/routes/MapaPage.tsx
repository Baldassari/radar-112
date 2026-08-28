import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Nivel, View } from '../api/types';
import { FilterPanel } from '../components/filters/FilterPanel';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { MapLegend } from '../components/map/MapLegend';
import { PtMap, type MapMarker } from '../components/map/PtMap';
import { MobileMapa } from '../components/mobile/MobileMapa';
import { TimelineList } from '../components/timeline/TimelineList';
import { useDistritos } from '../hooks/useDistritos';
import { useIsMobileViewport } from '../hooks/useMediaQuery';
import { useNewIds } from '../hooks/useNewIds';
import { useOcorrencias } from '../hooks/useOcorrencias';
import { useStreamState } from '../hooks/useOcorrenciaStream';
import { useKpis } from '../hooks/useKpis';
import { applyFacets, countByDistrito, countByNivel, type Facets } from '../lib/filterOcorrencias';
import './MapaPage.css';

const TIPOS_DISPONIVEIS = ['Acidente rodoviário', 'Salvamento', 'Emergência médica'];

function parseFacets(params: URLSearchParams): Facets {
  return {
    q: params.get('q') ?? '',
    niveis: (params.get('niveis')?.split(',').filter(Boolean) as Nivel[]) ?? [],
    distrito: params.get('distrito'),
    tipos: params.get('tipos')?.split(',').filter(Boolean) ?? [],
  };
}

export function MapaPage() {
  const isMobile = useIsMobileViewport();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const facets = parseFacets(params);
  const view = (params.get('view') as View) ?? 'Ativas';
  const selectedId = params.get('selected');

  const { data: pool } = useOcorrencias({ view, limit: 200 });
  const { data: kpis } = useKpis();
  const { data: distritos } = useDistritos();
  const { lastEventId } = useStreamState();
  const newIds = useNewIds(lastEventId);

  const items = useMemo(() => applyFacets(pool?.items ?? [], facets), [pool, facets]);
  const nivelCounts = useMemo(() => countByNivel(pool?.items ?? []), [pool]);
  const distritoCounts = useMemo(
    () => countByDistrito(pool?.items ?? [], (distritos ?? []).map((d) => d.distrito)),
    [pool, distritos],
  );

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  }

  function toggleNivel(n: Nivel) {
    const nv = facets.niveis.includes(n) ? facets.niveis.filter((x) => x !== n) : [...facets.niveis, n];
    update({ niveis: nv.join(',') || null });
  }
  function toggleDistrito(d: string) {
    update({ distrito: facets.distrito === d ? null : d });
  }
  function toggleTipo(t: string) {
    const tv = facets.tipos.includes(t) ? facets.tipos.filter((x) => x !== t) : [...facets.tipos, t];
    update({ tipos: tv.join(',') || null });
  }

  const markers: MapMarker[] = items.map((o) => ({
    id: o.id,
    lat: o.lat,
    lon: o.lon,
    crit: o.niv,
    local: o.freguesia || o.concelho,
    live: o.estado !== 'Encerrada',
  }));

  if (isMobile) {
    return <MobileMapa items={items} kpis={kpis} selectedId={selectedId} onSelect={(id) => navigate(`/ocorrencias/${id}`)} />;
  }

  return (
    <div className="rdr-mapa-shell">
      <KpiStrip kpis={kpis} />
      <div className="rdr-mapa-body">
        <FilterPanel
          q={facets.q}
          onQChange={(q) => update({ q: q || null })}
          niveis={facets.niveis}
          onToggleNivel={toggleNivel}
          nivelCounts={nivelCounts}
          distrito={facets.distrito}
          onToggleDistrito={toggleDistrito}
          distritoCounts={distritoCounts}
          tipos={facets.tipos}
          onToggleTipo={toggleTipo}
          tiposDisponiveis={TIPOS_DISPONIVEIS}
          onClear={() => update({ q: null, niveis: null, distrito: null, tipos: null })}
        />

        <div className="rdr-mapa-map-col">
          <MapLegend ambito={facets.distrito ? `Distrito de ${facets.distrito}` : 'Portugal continental'} count={items.length} />
          <div className="rdr-mapa-map-body">
            <PtMap markers={markers} selected={selectedId} district={facets.distrito} onMarkerClick={(id) => update({ selected: id })} />
          </div>
        </div>

        <TimelineList
          items={items}
          selectedId={selectedId}
          onSelect={(id) => update({ selected: id })}
          view={view}
          onViewChange={(v) => update({ view: v === 'Ativas' ? null : v })}
          newIds={newIds}
        />
      </div>
    </div>
  );
}
