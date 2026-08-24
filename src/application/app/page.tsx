"use client";

import { useMemo, useState } from "react";

type Criticality = "red" | "orange" | "yellow";
type Nature = "Acidente rodoviário" | "Salvamento" | "Emergência médica";

type Occurrence = {
  id: string;
  time: string;
  nature: Nature;
  locality: string;
  district: string;
  road: string;
  criticality: Criticality;
  status: string;
  resources: number;
  personnel: number;
  age: string;
  x: number;
  y: number;
};

const occurrences: Occurrence[] = [
  { id: "RD-2026-08417", time: "14:02", nature: "Acidente rodoviário", locality: "Pombal", district: "Leiria", road: "A1 · km 213", criticality: "red", status: "Em Resolução", resources: 11, personnel: 42, age: "3h 36m", x: 40, y: 40 },
  { id: "RD-2026-08406", time: "15:11", nature: "Emergência médica", locality: "Loulé", district: "Faro", road: "Quarteira", criticality: "orange", status: "Em Curso", resources: 4, personnel: 14, age: "2h 27m", x: 66, y: 84 },
  { id: "RD-2026-08399", time: "15:38", nature: "Salvamento", locality: "Porto", district: "Porto", road: "Campanhã", criticality: "orange", status: "Chegada ao TO", resources: 3, personnel: 12, age: "2h 00m", x: 40, y: 13 },
  { id: "RD-2026-08394", time: "16:04", nature: "Acidente rodoviário", locality: "Sines", district: "Setúbal", road: "EN 120", criticality: "yellow", status: "Em Resolução", resources: 2, personnel: 8, age: "1h 34m", x: 24, y: 72 },
  { id: "RD-2026-08381", time: "16:22", nature: "Salvamento", locality: "Monchique", district: "Faro", road: "Alferce", criticality: "orange", status: "Em Curso", resources: 6, personnel: 24, age: "1h 16m", x: 59, y: 75 },
  { id: "RD-2026-08372", time: "16:47", nature: "Salvamento", locality: "Manteigas", district: "Guarda", road: "Sameiro", criticality: "yellow", status: "Em Curso", resources: 3, personnel: 14, age: "51m", x: 62, y: 29 },
  { id: "RD-2026-08368", time: "17:02", nature: "Emergência médica", locality: "Águeda", district: "Aveiro", road: "Recardães", criticality: "red", status: "Em Conclusão", resources: 2, personnel: 6, age: "36m", x: 45, y: 27 },
  { id: "RD-2026-08355", time: "17:14", nature: "Acidente rodoviário", locality: "Mação", district: "Santarém", road: "EN 244", criticality: "orange", status: "Em Curso", resources: 2, personnel: 7, age: "24m", x: 57, y: 47 },
  { id: "RD-2026-08341", time: "17:21", nature: "Acidente rodoviário", locality: "Murça", district: "Vila Real", road: "IP4 · km 71", criticality: "yellow", status: "Vigilância", resources: 2, personnel: 6, age: "17m", x: 55, y: 14 },
  { id: "RD-2026-08333", time: "17:26", nature: "Emergência médica", locality: "Coimbra", district: "Coimbra", road: "Sto. António dos Olivais", criticality: "yellow", status: "Em Curso", resources: 1, personnel: 4, age: "12m", x: 48, y: 38 },
];

const criticalityLabels: Record<Criticality, string> = { red: "Vermelho", orange: "Laranja", yellow: "Amarelo" };
const districts = ["Aveiro", "Coimbra", "Faro", "Guarda", "Leiria", "Porto", "Santarém", "Setúbal", "Vila Real"];
const natures: Nature[] = ["Acidente rodoviário", "Salvamento", "Emergência médica"];

export default function Home() {
  const [selectedId, setSelectedId] = useState("RD-2026-08417");
  const [locality, setLocality] = useState("");
  const [criticalities, setCriticalities] = useState<Criticality[]>([]);
  const [district, setDistrict] = useState("");
  const [nature, setNature] = useState<Nature | "">("");
  const [activeTab, setActiveTab] = useState("Ativas");

  const filtered = useMemo(() => occurrences.filter((item) => {
    const matchesLocality = !locality || `${item.locality} ${item.road}`.toLowerCase().includes(locality.toLowerCase());
    const matchesCriticality = criticalities.length === 0 || criticalities.includes(item.criticality);
    const matchesDistrict = !district || item.district === district;
    const matchesNature = !nature || item.nature === nature;
    return matchesLocality && matchesCriticality && matchesDistrict && matchesNature;
  }), [locality, criticalities, district, nature]);

  const selected = occurrences.find((item) => item.id === selectedId) ?? filtered[0];
  const toggleCriticality = (value: Criticality) => setCriticalities((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const clearFilters = () => { setLocality(""); setCriticalities([]); setDistrict(""); setNature(""); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">RADAR <span>112</span></a>
        <nav className="nav-links" aria-label="Navegação principal">
          {[["Mapa", "/"], ["Ocorrências", "#occurrences"], ["Histórico", "#history"], ["Distritos", "#districts"]].map(([label, href]) => <a className={label === "Mapa" ? "active" : ""} href={href} key={label}>{label}</a>)}
        </nav>
        <div className="live-status"><span className="pulse" /> <strong>Em direto</strong><span className="muted">dados da Proteção Civil, há 6 s</span></div>
        <button className="subscribe" type="button">＋ Subscrever alertas</button>
      </header>

      <section className="metrics" aria-label="Resumo operacional">
        <Metric value="10" label="Ocorrências ativas" />
        <Metric value="2" label="Nível vermelho" accent="red" />
        <Metric value="36" label="Meios no terreno" />
        <Metric value="137" label="Operacionais" />
        <Metric value="9" label="Distritos com ocorrências" />
        <div className="warning"><span>Aviso vermelho</span><strong>Chuva forte e vento</strong><small>Leiria, Coimbra, Aveiro até às 22:00</small></div>
      </section>

      <section className="workspace">
        <aside className="filters" aria-label="Filtros">
          <div className="section-heading"><h2>Filtros</h2><button type="button" onClick={clearFilters}>Limpar</button></div>
          <label className="field-label" htmlFor="locality">Localidade</label>
          <div className="search-field"><span>⌕</span><input id="locality" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Pesquisar localidade" /></div>
          <FilterSection title="Criticidade" hint="Escala de aviso da Proteção Civil.">{(["red", "orange", "yellow"] as Criticality[]).map((item) => <FilterButton key={item} active={criticalities.includes(item)} color={item} onClick={() => toggleCriticality(item)}>{criticalityLabels[item]} <b>{occurrences.filter((occurrence) => occurrence.criticality === item).length}</b></FilterButton>)}</FilterSection>
          <FilterSection title="Distrito"><select value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">Todos os distritos</option>{districts.map((item) => <option key={item}>{item}</option>)}</select></FilterSection>
          <FilterSection title="Natureza">{natures.map((item) => <button className={`nature-button ${nature === item ? "selected" : ""}`} type="button" onClick={() => setNature(nature === item ? "" : item)} key={item}>{item}</button>)}</FilterSection>
        </aside>

        <section className="map-column" aria-label="Mapa de ocorrências">
          <div className="map-header"><div><p className="eyebrow">Portugal continental</p><h1>Mapa de ocorrências</h1><span>{filtered.length} ocorrências visíveis · posição aproximada</span></div><div className="legend">{(["red", "orange", "yellow"] as Criticality[]).map((item) => <span key={item}><i className={`dot ${item}`} />{criticalityLabels[item]}</span>)}</div></div>
          <div className="map-stage"><div className="portugal-shape" aria-hidden="true"><span>PORTUGAL</span></div>{filtered.map((item) => <button aria-label={`${item.nature}, ${item.locality}, ${criticalityLabels[item.criticality]}`} className={`map-marker ${item.criticality} ${selected?.id === item.id ? "selected" : ""}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => setSelectedId(item.id)} key={item.id}><i />{selected?.id === item.id && <b>{item.locality}<small>{item.id}</small></b>}</button>)}<div className="map-scale">⌖ Posição aproximada<br /><span>50 km</span></div></div>
          {selected && <SelectedOccurrence item={selected} />}
        </section>

        <aside className="timeline" id="occurrences"><div className="timeline-heading"><div><p className="eyebrow">Atualizado há 6 s</p><h2>Timeline</h2></div><span className="live-badge">● LIVE</span></div><div className="tabs">{["Ativas", "Todas", "Histórico"].map((tab) => <button className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} type="button" key={tab}>{tab}</button>)}</div><div className="timeline-list">{filtered.map((item) => <button className={`timeline-item ${selected?.id === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)} type="button" key={item.id}><time>{item.time}</time><span className={`timeline-line ${item.criticality}`} /><span className="timeline-copy"><strong>{item.nature}</strong><small>{item.locality} · {item.road}</small><small>{item.resources} meios · {item.personnel} operacionais · há {item.age}</small></span><span className="timeline-tags"><em className={item.criticality}>{criticalityLabels[item.criticality]}</em><em>{item.status}</em></span></button>)}</div><p className="timeline-footer">{filtered.length} de 12 ocorrências nas últimas 12 h <a href="#history">Ver histórico →</a></p></aside>
      </section>
    </main>
  );
}

function Metric({ value, label, accent }: { value: string; label: string; accent?: string }) { return <div className="metric"><strong className={accent}>{value}</strong><span>{label}</span></div>; }
function FilterSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) { return <section className="filter-section"><h3>{title}</h3>{hint && <p>{hint}</p>}<div className="filter-options">{children}</div></section>; }
function FilterButton({ active, color, onClick, children }: { active: boolean; color: Criticality; onClick: () => void; children: React.ReactNode }) { return <button type="button" className={`filter-button ${color} ${active ? "selected" : ""}`} onClick={onClick}>{children}</button>; }
function SelectedOccurrence({ item }: { item: Occurrence }) { return <article className="selected-occurrence"><div className="occurrence-title"><div><span className={`criticality-label ${item.criticality}`}>Nível {criticalityLabels[item.criticality]}</span><h2>{item.id}</h2></div><span className="live-badge">● Ativo</span></div><p className="occurrence-nature">{item.nature}</p><p className="occurrence-description">Colisão múltipla, 6 viaturas · {item.locality} · {item.road}</p><div className="occurrence-stats"><span><strong>{item.resources}</strong>Meios</span><span><strong>{item.personnel}</strong>Operacionais</span><span><strong>{item.age}</strong>Desde o alerta</span></div><a href={`#${item.id}`}>Abrir detalhe da ocorrência →</a></article>; }
