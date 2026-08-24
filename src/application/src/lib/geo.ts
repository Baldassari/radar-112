import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import districtsTopo from '../assets/pt-districts.topo.json';

export type DistrictFeature = Feature<Geometry, { name: string }>;

const NAME_FIX: Record<string, string> = {
  Lisbon: 'Lisboa',
  Braganca: 'Bragança',
  Evora: 'Évora',
  Setubal: 'Setúbal',
  Santarem: 'Santarém',
};

let cached: { features: DistrictFeature[]; outline: FeatureCollection } | null = null;

/** Geometria dos 18 distritos de Portugal continental, servida do próprio
 * bundle (sem CDN de terceiros). As ilhas vêm mal posicionadas nesta fonte
 * e são filtradas — ver README do handoff, secção "O mapa". */
export function loadDistricts(): { features: DistrictFeature[]; outline: FeatureCollection } {
  if (cached) return cached;
  const topo = districtsTopo as unknown as Topology;
  const key = Object.keys(topo.objects)[0];
  const fc = topojson.feature(topo, topo.objects[key]) as unknown as FeatureCollection;
  const features = (fc.features as DistrictFeature[])
    .map((f) => {
      const raw = ((f.properties as Record<string, string> | null)?.NAME_1 ?? '') as string;
      const name = NAME_FIX[raw] ?? raw;
      return { ...f, properties: { name } };
    })
    .filter((f) => !/^Ilha/.test(f.properties.name));
  cached = { features, outline: { type: 'FeatureCollection', features } };
  return cached;
}
