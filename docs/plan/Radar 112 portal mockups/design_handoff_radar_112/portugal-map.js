/* <pt-map> — Portugal (mainland) district geometry with occurrence markers.
   Geometry: deldersveld/topojson portugal-districts (district polygons), with the
   pinned world-atlas country outline as a fallback. Plain custom element so the
   map owns its own load/resize lifecycle. */
(() => {
  if (window.__ptMapDefined) return;
  window.__ptMapDefined = true;

  /* District polygons (GADM-derived, TopoJSON). Islands in this file are placed
     artificially close to the mainland, so they are filtered out. */
  const DISTRICTS_URL = window.__PT_GEO_URL__ || 'https://gist.githubusercontent.com/ptalmeida/b9d68071b1665dfc43c6fa63f794d4f5/raw';
  const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

  const COLOR = { vermelho: '#EC3013', laranja: '#F07300', amarelo: '#E8A800' };
  const CITIES = [
    ['Porto', -8.611, 41.150], ['Coimbra', -8.42, 40.207], ['Lisboa', -9.139, 38.722],
    ['Faro', -7.93, 37.019], ['Évora', -7.907, 38.571], ['Bragança', -6.757, 41.806],
    ['Guarda', -7.267, 40.537], ['Beja', -7.863, 38.015]
  ];
  const NAME_FIX = {
    'Lisbon': 'Lisboa', 'Braganca': 'Bragança', 'Bragança': 'Bragança',
    'Evora': 'Évora', 'Setubal': 'Setúbal', 'Santarem': 'Santarém'
  };

  const STYLE_ID = '__pt-map-style';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `@keyframes ptPulse{0%{r:5;opacity:.6}70%{r:26;opacity:0}100%{r:26;opacity:0}}
      .pt-pulse{animation:ptPulse 2.4s cubic-bezier(.2,.6,.3,1) infinite}
      pt-map svg{display:block}
      pt-map .pt-hit{cursor:pointer}`;
    document.head.appendChild(s);
  }

  let geoPromise = null;
  function ready() {
    return new Promise((res, rej) => {
      const t0 = Date.now();
      (function poll() {
        if (window.d3 && window.topojson) return res();
        if (Date.now() - t0 > 15000) return rej(new Error('d3 not loaded'));
        setTimeout(poll, 50);
      })();
    });
  }
  function getGeo() {
    if (geoPromise) return geoPromise;
    geoPromise = ready().then(() =>
      fetch(DISTRICTS_URL).then(r => {
        if (!r.ok) throw new Error('districts unavailable');
        return r.json();
      }).then(topo => {
        const key = Object.keys(topo.objects)[0];
        const fc = window.topojson.feature(topo, topo.objects[key]);
        const features = fc.features.map(f => {
          const p = f.properties || {};
          const raw = p.NAME_1 || p.name || p.NAME || '';
          return Object.assign({}, f, { name: NAME_FIX[raw] || raw });
        }).filter(f => !/^Ilha/.test(f.name));
        return { features, outline: { type: 'FeatureCollection', features }, mode: 'districts' };
      }).catch(() =>
        fetch(WORLD_URL).then(r => r.json()).then(topo => {
          const feats = window.topojson.feature(topo, topo.objects.countries).features;
          const pt = feats.find(f => f.properties && f.properties.name === 'Portugal');
          let mainland = pt;
          if (pt.geometry.type === 'MultiPolygon') {
            const best = pt.geometry.coordinates.slice().sort((a, b) => b[0].length - a[0].length)[0];
            mainland = { type: 'Feature', properties: pt.properties, geometry: { type: 'Polygon', coordinates: best } };
          }
          return { features: [Object.assign({}, mainland, { name: '' })], outline: mainland, mode: 'country' };
        })
      )
    );
    return geoPromise;
  }

  class PtMap extends HTMLElement {
    constructor() {
      super();
      this._markers = [];
      this._selected = null;
      this._district = '';
      this._labels = true;
    }
    static get observedAttributes() { return ['markers', 'selected', 'district', 'labels']; }
    attributeChangedCallback(n, o, v) {
      if (n === 'markers') this.markers = v;
      else if (n === 'selected') this.selected = v;
      else if (n === 'district') this.district = v;
      else if (n === 'labels') this.labels = v;
    }
    set markers(v) {
      try { this._markers = typeof v === 'string' ? JSON.parse(v) : (v || []); } catch (e) { this._markers = []; }
      this._draw();
    }
    get markers() { return this._markers; }
    set selected(v) { this._selected = v == null || v === '' ? null : String(v); this._draw(); }
    set labels(v) { this._labels = !(v === false || v === 'false'); this._draw(); }
    set district(v) { this._district = v || ''; this._draw(); }

    connectedCallback() {
      this.style.cssText = 'display:block;position:relative;width:100%;height:100%;min-height:0';
      getGeo().then(g => { this._geo = g; this._draw(); }).catch(() => {
        this.innerHTML = '<div style="padding:16px;font:12px Archivo,sans-serif;opacity:.6">Geometria do mapa indisponível (sem rede).</div>';
      });
      this._ro = new ResizeObserver(() => this._draw());
      this._ro.observe(this);
    }
    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
    }

    _draw() {
      if (!this._geo) return;
      const r = this.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return;
      // the box can still be settling when a prop lands — re-measure next frame
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        const n = this.getBoundingClientRect();
        if (Math.round(n.width) !== w || Math.round(n.height) !== h) this._draw();
      });
      const d3 = window.d3;
      const ink = '#201e1d';
      const pad = Math.min(w, h) * 0.05;
      const focus = this._district && this._geo.features.find(f => f.name === this._district);
      const fitTo = focus || this._geo.outline;
      const proj = d3.geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], fitTo);
      const path = d3.geoPath(proj);
      const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

      const grid = [];
      const step = 44;
      for (let x = 0; x < w; x += step) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
      for (let y = 0; y < h; y += step) grid.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);

      const shapes = this._geo.features.map(f => {
        const on = focus && f.name === this._district;
        return `<path d="${path(f)}" fill="${on ? '#ffe0d9' : '#dedbdb'}" stroke="${ink}" stroke-opacity="${on ? '1' : '.45'}" stroke-width="${on ? 1.6 : 0.9}" stroke-linejoin="round"/>`;
      }).join('');

      let districtLabels = '';
      if (this._geo.mode === 'districts' && !focus && this._labels && w >= 300) {
        const placed = [];
        districtLabels = this._geo.features.map(f => {
          const c = path.centroid(f);
          if (!c || isNaN(c[0])) return '';
          const label = (f.name || '').toUpperCase();
          const halfW = label.length * 3.1 + 4;
          const box = { x0: c[0] - halfW, x1: c[0] + halfW, y0: c[1] - 7, y1: c[1] + 3 };
          if (placed.some(p => box.x0 < p.x1 && box.x1 > p.x0 && box.y0 < p.y1 && box.y1 > p.y0)) return '';
          placed.push(box);
          return `<text x="${c[0]}" y="${c[1]}" text-anchor="middle" font-family="Archivo,sans-serif" font-size="8.5" letter-spacing=".1em" fill="${ink}" fill-opacity=".38">${esc(label)}</text>`;
        }).join('');
      }

      const cityMarks = (this._labels && (focus || this._geo.mode === 'country')) ? CITIES.map(([n, lon, lat]) => {
        const p = proj([lon, lat]);
        if (!p || p[0] < 0 || p[0] > w || p[1] < 0 || p[1] > h) return '';
        return `<g><rect x="${p[0] - 1.5}" y="${p[1] - 1.5}" width="3" height="3" fill="${ink}" fill-opacity=".5"/>
          <text x="${p[0] + 6}" y="${p[1] + 3.5}" font-family="Archivo,sans-serif" font-size="9" letter-spacing=".09em" fill="${ink}" fill-opacity=".5">${esc(n.toUpperCase())}</text></g>`;
      }).join('') : '';

      const marks = (this._markers || []).map(m => {
        const p = proj([m.lon, m.lat]);
        if (!p) return '';
        const c = COLOR[m.crit] || COLOR.amarelo;
        const sel = this._selected === String(m.id);
        const r = m.crit === 'vermelho' ? 7 : m.crit === 'laranja' ? 6 : 5;
        const live = m.live !== false;
        const flip = p[0] > w - 150;
        const tx = flip ? p[0] - r - 11 : p[0] + r + 11;
        const anchor = flip ? 'end' : 'start';
        return `<g class="pt-hit" data-id="${esc(m.id)}">
          ${live ? `<circle class="pt-pulse" cx="${p[0]}" cy="${p[1]}" r="5" fill="none" stroke="${c}" stroke-width="2"/>` : ''}
          <circle cx="${p[0]}" cy="${p[1]}" r="${r + 8}" fill="transparent"/>
          ${sel ? `<rect x="${p[0] - r - 7}" y="${p[1] - r - 7}" width="${(r + 7) * 2}" height="${(r + 7) * 2}" fill="none" stroke="${ink}" stroke-width="1.5"/>` : ''}
          <circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${live ? c : '#f3f2f2'}" stroke="${c}" stroke-width="2"/>
          ${sel ? `<text x="${tx}" y="${p[1] - 2}" text-anchor="${anchor}" font-family="Archivo,sans-serif" font-weight="800" font-size="11.5" fill="${ink}">${esc(m.local || '')}</text>
            <text x="${tx}" y="${p[1] + 11}" text-anchor="${anchor}" font-family="Archivo,sans-serif" font-size="10" fill="${ink}" fill-opacity=".6">${esc(m.id)}</text>` : ''}
        </g>`;
      }).join('');

      this.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mapa de ocorrências em Portugal">
        <g stroke="${ink}" stroke-opacity=".07" stroke-width="1">${grid.join('')}</g>
        ${shapes}${districtLabels}${cityMarks}${marks}
      </svg>`;

      this.querySelectorAll('.pt-hit').forEach(g => {
        g.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('marker-click', { detail: g.dataset.id, bubbles: true }));
        });
      });
    }
  }
  customElements.define('pt-map', PtMap);
})();
