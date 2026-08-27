import { geoMercator, geoPath } from 'd3-geo';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Nivel } from '../../api/types';
import { loadDistricts, type DistrictFeature } from '../../lib/geo';

export type MapMarker = {
  id: string;
  lat: number;
  lon: number;
  crit: Nivel;
  local?: string;
  live?: boolean;
};

type Props = {
  markers: MapMarker[];
  selected?: string | null;
  district?: string | null;
  labels?: boolean;
  onMarkerClick?: (id: string) => void;
  className?: string;
};

const COLOR: Record<Nivel, string> = { vermelho: '#EC3013', laranja: '#F07300', amarelo: '#E8A800' };
const INK = '#201e1d';
const CITIES: [string, number, number][] = [
  ['Porto', -8.611, 41.15],
  ['Coimbra', -8.42, 40.207],
  ['Lisboa', -9.139, 38.722],
  ['Faro', -7.93, 37.019],
  ['Évora', -7.907, 38.571],
  ['Bragança', -6.757, 41.806],
  ['Guarda', -7.267, 40.537],
  ['Beja', -7.863, 38.015],
];

function useElementSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      // a caixa ainda pode estar a assentar quando o observer dispara
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
}

/** Porte para React de portugal-map.js (`<pt-map>`). Mesmo algoritmo:
 * fitExtent com zoom por distrito, grelha modular de fundo, teste de
 * colisão de labels, anel de pulso nos marcadores ativos. */
export function PtMap({ markers, selected = null, district = null, labels = true, onMarkerClick, className }: Props) {
  const [containerRef, { width: w, height: h }] = useElementSize();
  const { features } = useMemo(() => loadDistricts(), []);

  if (!w || !h) {
    return <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }} />;
  }

  const focus = (district && features.find((f) => f.properties.name === district)) || null;
  const fitTo = focus ?? { type: 'FeatureCollection', features } as const;
  const pad = Math.min(w, h) * 0.05;
  const projection = geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], fitTo as never);
  const path = geoPath(projection);

  const step = 44;
  const gridV = Array.from({ length: Math.ceil(w / step) + 1 }, (_, i) => i * step);
  const gridH = Array.from({ length: Math.ceil(h / step) + 1 }, (_, i) => i * step);

  const showDistrictLabels = !focus && labels && w >= 300;
  const placedBoxes: { x0: number; x1: number; y0: number; y1: number }[] = [];

  const showCities = labels && !!focus;

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Mapa de ocorrências em Portugal">
        <g stroke={INK} strokeOpacity={0.07} strokeWidth={1}>
          {gridV.map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={h} />
          ))}
          {gridH.map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={w} y2={y} />
          ))}
        </g>

        {features.map((f: DistrictFeature) => {
          const on = focus === f;
          return (
            <path
              key={f.properties.name}
              d={path(f) ?? undefined}
              fill={on ? '#ffe0d9' : '#dedbdb'}
              stroke={INK}
              strokeOpacity={on ? 1 : 0.45}
              strokeWidth={on ? 1.6 : 0.9}
              strokeLinejoin="round"
            />
          );
        })}

        {showDistrictLabels &&
          features.map((f) => {
            const c = path.centroid(f);
            if (!c || Number.isNaN(c[0])) return null;
            const label = f.properties.name.toUpperCase();
            const halfW = label.length * 3.1 + 4;
            const box = { x0: c[0] - halfW, x1: c[0] + halfW, y0: c[1] - 7, y1: c[1] + 3 };
            const overlaps = placedBoxes.some((p) => box.x0 < p.x1 && box.x1 > p.x0 && box.y0 < p.y1 && box.y1 > p.y0);
            if (overlaps) return null;
            placedBoxes.push(box);
            return (
              <text
                key={f.properties.name}
                x={c[0]}
                y={c[1]}
                textAnchor="middle"
                fontFamily="Archivo, sans-serif"
                fontSize={8.5}
                letterSpacing="0.1em"
                fill={INK}
                fillOpacity={0.38}
              >
                {label}
              </text>
            );
          })}

        {showCities &&
          CITIES.map(([name, lon, lat]) => {
            const p = projection([lon, lat]);
            if (!p || p[0] < 0 || p[0] > w || p[1] < 0 || p[1] > h) return null;
            return (
              <g key={name}>
                <rect x={p[0] - 1.5} y={p[1] - 1.5} width={3} height={3} fill={INK} fillOpacity={0.5} />
                <text x={p[0] + 6} y={p[1] + 3.5} fontFamily="Archivo, sans-serif" fontSize={9} letterSpacing="0.09em" fill={INK} fillOpacity={0.5}>
                  {name.toUpperCase()}
                </text>
              </g>
            );
          })}

        {markers.map((m) => {
          const p = projection([m.lon, m.lat]);
          if (!p) return null;
          const color = COLOR[m.crit] ?? COLOR.amarelo;
          const isSelected = selected === m.id;
          const r = m.crit === 'vermelho' ? 7 : m.crit === 'laranja' ? 6 : 5;
          const live = m.live !== false;
          const flip = p[0] > w - 150;
          const tx = flip ? p[0] - r - 11 : p[0] + r + 11;

          return (
            <g
              key={m.id}
              onClick={() => onMarkerClick?.(m.id)}
              style={{ cursor: onMarkerClick ? 'pointer' : undefined }}
            >
              {live && (
                <circle
                  className="pt-pulse"
                  cx={p[0]}
                  cy={p[1]}
                  r={5}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  style={{ animation: 'ptPulse 2.4s cubic-bezier(.2,.6,.3,1) infinite' }}
                />
              )}
              <circle cx={p[0]} cy={p[1]} r={r + 8} fill="transparent" />
              {isSelected && (
                <rect
                  x={p[0] - r - 7}
                  y={p[1] - r - 7}
                  width={(r + 7) * 2}
                  height={(r + 7) * 2}
                  fill="none"
                  stroke={INK}
                  strokeWidth={1.5}
                />
              )}
              <circle cx={p[0]} cy={p[1]} r={r} fill={live ? color : '#f3f2f2'} stroke={color} strokeWidth={2} />
              {isSelected && (
                <>
                  <text x={tx} y={p[1] - 2} textAnchor={flip ? 'end' : 'start'} fontFamily="Archivo, sans-serif" fontWeight={800} fontSize={11.5} fill={INK}>
                    {m.local ?? ''}
                  </text>
                  <text x={tx} y={p[1] + 11} textAnchor={flip ? 'end' : 'start'} fontFamily="Archivo, sans-serif" fontSize={10} fill={INK} fillOpacity={0.6}>
                    {m.id}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
