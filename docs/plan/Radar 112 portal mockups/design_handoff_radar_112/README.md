# Handoff: Radar 112 — portal público de ocorrências

Destino: https://github.com/Baldassari/radar-112 (repositório vazio; só `.gitignore` de Node).

## Overview

Radar 112 é um portal público de acompanhamento near-real-time das ocorrências
reportadas pela Proteção Civil. Cinco vistas desktop mais duas vistas mobile:

| Vista | Rota sugerida | O que faz |
| --- | --- | --- |
| Mapa | `/` | Mapa de Portugal continental + timeline ao vivo + filtros |
| Ocorrências | `/ocorrencias` | Tabela completa, pesquisável e exportável |
| Histórico | `/historico` | Arquivo de ocorrências encerradas + gráfico de 14 dias |
| Distritos | `/distritos` | Estatísticas por distrito com mapa focado |
| Detalhe | `/ocorrencias/:id` | Ficha da ocorrência: estado, meios, cronologia, imprensa |
| Mobile | — | Mapa com folha "Perto de mim" e detalhe, em 390×844 |

## About the Design Files

Os ficheiros deste pacote são **referências de design feitas em HTML** — protótipos
que mostram aspeto e comportamento pretendidos, não código de produção para copiar.
A tarefa é **recriar estes designs no ambiente do repositório**. O repositório está
vazio, com um `.gitignore` de Node, portanto a stack está por escolher. Recomendação:

- **Vite + React + TypeScript** (o `.gitignore` já cobre Vite e Next).
- **TanStack Query** para o polling do near-real-time.
- **d3-geo + topojson-client** para o mapa (o protótipo já usa exatamente isto).
- CSS com custom properties, replicando os tokens abaixo. Sem framework de UI:
  o sistema é flat, sem raio de canto, e as classes são poucas.

## Fidelity

**High-fidelity.** Cores, tipografia, espaçamento e estados são finais. Recriar
pixel-perfect. Todos os dados são fictícios (ver "Data").

## Design System — Modernist

Flat, arquitetónico, tudo em **Archivo**. Vermelho quase-mono sobre branco, grelha
modular visível, **raio de canto zero em toda a parte**, réguas de 2px fortes.
Tudo alinhado à esquerda, incluindo labels dentro de botões largos.

### Tokens

```css
:root {
  /* ground + ink */
  --color-bg:        #f3f2f2;
  --color-surface:   #eae9e9;   /* fundo do mapa, cartão selecionado */
  --color-text:      #201e1d;
  --color-divider:   #d6d3d3;   /* réguas de 2px entre secções */

  /* accent (mono) */
  --color-accent:     #ec3013;
  --color-accent-700: #b32309;  /* texto de tamanho corpo em accent */

  /* escala de aviso ANEPC — semânticos do produto, não tokens do DS */
  --niv-vermelho: #EC3013;  --niv-vermelho-bg: #EC3013;  --niv-vermelho-fg: #f3f2f2;
  --niv-laranja:  #F07300;  --niv-laranja-bg:  #FFE4CC;  --niv-laranja-fg:  #7A3600;
  --niv-amarelo:  #E8A800;  --niv-amarelo-bg:  #FAF0CE;  --niv-amarelo-fg:  #5F4700;

  --font-heading: 'Archivo', Helvetica, sans-serif;  /* weight 800 */
  --font-body:    'Archivo', Helvetica, sans-serif;  /* weight 400 */
  --radius-md: 0;
}
```

`_ds/modernist-*/styles.css` neste pacote é a folha canónica — usar as variáveis
dela, não os hex acima, sempre que possível. Classes do sistema usadas no
protótipo: `.nav`, `.nav-brand`, `.btn` (+`.btn-primary`/`.btn-secondary`/`.btn-ghost`/`.btn-block`),
`.tag` (+`.tag-neutral`/`.tag-outline`), `.field`, `.input`, `.seg`, `.table`, `.hr`.

### Escala tipográfica usada

| Uso | Família | Tamanho | Peso | Notas |
| --- | --- | --- | --- | --- |
| H1 detalhe | heading | 46px | 800 | `letter-spacing:-0.015em` |
| H3 título de vista | heading | ~30px | 800 | |
| H4 distrito em foco | heading | ~23px | 800 | |
| H6 label de secção | heading | 11px | 800 | `letter-spacing:.09em`, uppercase, `opacity:.6` |
| Número de KPI | heading | 26px | 800 | `letter-spacing:-0.02em`, `line-height:1` |
| Linha de timeline (título) | heading | 13.5px | 800 | |
| Corpo | body | 12.5–13px | 400 | |
| Meta / timestamp | body | 10.5–11px | 400 | `opacity:.5–.6`, tabular-nums |
| Micro-label uppercase | heading | 10–11px | 800 | `letter-spacing:.08–.12em` |

**Todos os números** (horas, contagens, coordenadas, durações) levam
`font-variant-numeric: tabular-nums`.

## Screens / Views

### 1. Barra de navegação (todas as vistas)

- `padding:0 20px`, `min-width:1200px`, fundo `--color-bg`.
- Marca: quadrado `14×14` em `--color-accent` + "RADAR 112" (heading 800,
  `letter-spacing:-0.02em`, `white-space:nowrap`), `padding:12px 24px 12px 0`,
  `border-right:2px solid --color-divider`.
- Tabs: Mapa · Ocorrências · Histórico · Distritos · Mobile. Ativa em
  `--color-accent`, peso 800, `border-bottom:2px solid --color-accent`; inativa
  peso 400, borda transparente. `padding:8px 12px`, heading 13.5px.
- À direita: indicador "EM DIRETO" — quadrado `8×8` accent com
  `animation: rdrBlink 1.6s steps(1,end) infinite` (0/100% `opacity:1`, 50% `opacity:.25`),
  label uppercase 11px, e "· dados da Proteção Civil, há N s" a `opacity:.55`.
  Segue-se `.btn-secondary` "Subscrever alertas".

### 2. Mapa (vista principal)

Coluna flex de `100vh`, `min-height:660px`, `overflow-x:auto; overflow-y:hidden`
(permite scroll lateral abaixo de 1200px).

**Faixa de KPIs** — `display:flex`, `border-bottom:2px solid --color-divider`.
Cinco células `flex:1`, `padding:12px 20px`, `border-right:1px solid --color-divider`:
Ocorrências ativas (número em accent), Nível vermelho (`#EC3013`), Meios no
terreno, Operacionais, Distritos com ocorrências. À direita, célula fixa de
`300px` com fundo `--color-accent` e texto `--color-bg`: "AVISO VERMELHO" +
descrição meteorológica.

**Corpo** — `display:grid; grid-template-columns:238px minmax(380px,1fr) 396px`.

*Coluna 1 — filtros* (`border-right:2px`, `overflow:auto`):
- Cabeçalho "Filtros" + `.btn-ghost` "Limpar".
- Campo "Localidade" (`.field`+`.input`, `type=search`).
- Blocos separados por `border-top:1px solid --color-divider`, `padding:14px 16px`:
  - **Criticidade** — três linhas (Vermelho / Laranja / Amarelo) com quadrado
    `10×10` da cor, nome e contagem à direita. Multi-seleção; ativo inverte para
    fundo `#201e1d` / texto `#f3f2f2`.
  - **Distrito** — lista com contagem; seleção única, clicar de novo desmarca.
    Selecionar um distrito faz zoom no mapa.
  - **Natureza** — chips `.tag` (Acidente rodoviário, Salvamento, Emergência
    médica), multi-seleção, mesma inversão.

*Coluna 2 — mapa*:
- Barra superior `padding:10px 18px`, `border-bottom:1px solid`: âmbito
  ("PORTUGAL CONTINENTAL" ou "Distrito de X"), contagem, e legenda com três
  bolinhas `9×9` (`border-radius:50%` — única exceção ao raio zero, por ser
  notação cartográfica).
- Mapa a preencher o resto, fundo `--color-surface`.

*Coluna 3 — timeline* (`border-left:2px`):
- **Cartão da seleção** (só com marcador selecionado) no topo, fundo
  `--color-surface`, `border-bottom:2px solid --color-text`, `padding:14px 16px 16px`:
  código em accent uppercase + tag do nível; título 19px; subtipo e local;
  `.hr`; três KPIs (Meios / Operacionais / Desde o alerta); `.btn-primary.btn-block`
  "Abrir detalhe da ocorrência →".
- Cabeçalho "Timeline" + timestamp + `.seg` com Ativas / Todas / Histórico
  (ativo: fundo accent, texto `--color-bg`).
- **Lista** `overflow:auto`. Cada linha é um botão em
  `grid-template-columns:46px 5px minmax(0,1fr) auto`, `gap:10px`,
  `padding:11px 14px`, `border-bottom:1px solid`:
  hora (tabular, `opacity:.6`) · barra vertical de 5px na cor do nível ·
  título (heading 13.5/800) + local + meta ("11 meios · 42 operacionais · há 3h 36m")
  · tag do nível + estado uppercase 10.5px `opacity:.5`.
  Selecionada: fundo `#eae9e9`. Nova: `animation: rdrIn .5s ease-out`
  (`from{opacity:0;translateY(-10px)}`).
- Rodapé `border-top:2px`: contagem + `.btn-ghost` "Ver histórico →".

### 3. Ocorrências (tabela)

`padding:24px 28px 56px`, `min-width:1100px`. Cabeçalho: H3 "Ocorrências" +
subtítulo; à direita pesquisa (260px), select de distrito (170px) e
`.btn-secondary` "Exportar CSV" (`height:36px`).

`.table`: Hora · Código · Natureza (título 800 + subtipo em `opacity:.6` numa
segunda linha) · Local · Distrito · Nível (quadrado `10×10` + nome) · Estado
(`.tag` com as cores de estado) · Meios (dir.) · Operacionais (dir.) ·
`.btn-ghost` "Detalhe →" que navega para o detalhe dessa ocorrência.

Rodapé: "A mostrar N de 3 482 ocorrências registadas este mês" +
`.btn-secondary` "Carregar mais".

### 4. Histórico

Barra de pesquisa em faixa própria (`border-top:2px` / `border-bottom:1px`,
`padding:16px 0`): texto livre (máx. 320px), De / Até (`type=date`), Natureza
(select), `.btn-primary` "Pesquisar".

Corpo em `grid-template-columns:minmax(0,1fr) 340px; gap:36px`.

*Esquerda* — `.table`: Dia · Hora · Natureza · Local · Nível · Duração · Estado
(`.tag-neutral` "Encerrada"). O rótulo do dia aparece só na primeira linha do
grupo (as restantes usam `opacity:0` para manter a largura da coluna estável).
Rodapé "1–12 de 3 482 resultados" + "Página seguinte →".

*Direita* — coluna com `border-top:2px solid --color-text`:
- **Últimos 14 dias**: 14 barras `flex:1` com `gap:4px` numa caixa de `height:120px`,
  altura proporcional ao máximo. Barras em `rgba(32,30,29,.35)`; dia de pico em
  `#EC3013`. Número do dia sob cada barra, 9px, `opacity:.45`.
- **No período selecionado**: grelha 2×2 de KPIs (Ocorrências, Tempo médio de
  resposta, % acidentes rodoviários, Avisos vermelhos), separada por `gap:1px`
  sobre fundo `--color-divider` (truque de régua de 1px).

### 5. Distritos

`grid-template-columns:minmax(0,1fr) 420px; gap:36px`, `min-width:1150px`.

*Esquerda* — `.table` ordenada por ativas desc.: Distrito · Ativas · Vermelho
(texto `#EC3013`) · Laranja (`#F07300`) · Amarelo (`opacity:.7`) · Peso relativo
(barra de `height:8px` em `--color-text`, largura em %) · Meios. Linha clicável;
a linha em foco tem fundo `#eae9e9`.

*Direita* — distrito em foco: H4 + contagem, mapa de `height:300px` com
`border:1px solid --color-divider` limitado a esse distrito, grelha 2×2 de KPIs
(Ativas agora, Operacionais, Tempo médio de resposta, Natureza mais frequente) e
"Concelhos mais afetados" — linhas em
`grid-template-columns:130px minmax(0,1fr) 28px` com barra de 8px (o primeiro em
`#EC3013`, os restantes em `rgba(32,30,29,.35)`).

### 6. Detalhe da ocorrência

`max-width:1320px; margin:0 auto; padding:0 24px 56px`, `min-width:1000px`.

- **Barra de ação**: `.btn-secondary` "← Voltar ao mapa", breadcrumb
  "Radar 112 · Ocorrências · RD-…", `.btn-primary` "Seguir esta ocorrência".
- **Cabeçalho** `grid-template-columns:minmax(0,1fr) 320px; gap:32px`,
  `border-bottom:2px`: kicker accent uppercase 11px; H1 46px; fila de tags
  (Nível vermelho a cheio + estado + "Via cortada" + distrito, todas com
  `white-space:nowrap`). À direita, metadados com
  `border-left:2px solid --color-divider; padding-left:20px`: label uppercase
  10.5px `opacity:.55` à esquerda, valor heading 800 à direita, `border-bottom:1px`
  por linha (Distrito, Concelho, Local, Alerta, Desde o alerta, Viaturas envolvidas).
- **Cadeia de estados** (vocabulário ANEPC):
  Despacho → Em Curso → Chegada ao TO → Em Resolução → Em Conclusão → Encerrada.
  Seis células `flex:1`, `padding:10px 12px`, `border-left:2px`. Passados: fundo
  `--color-surface`, borda `--color-text`. Atual: fundo `#EC3013`, texto `#f3f2f2`.
  Futuros: fundo transparente, borda `--color-divider`. Cada célula mostra o nome
  e a hora (ou "—").
- **Corpo** `grid-template-columns:minmax(0,1fr) 340px; gap:36px`.
  - *Localização*: mapa de `height:360px` com `border:1px solid`, cartucho de
    coordenadas no canto superior direito (fundo `--color-bg`,
    `border:1px solid --color-text`, `padding:8px 12px`, 11px tabular). Sob o
    mapa: "Posição aproximada ao nível do quilómetro. A localização exata não é
    divulgada publicamente." (12px, `opacity:.55`).
  - *Cronologia*: linhas `grid-template-columns:64px 1fr; gap:16px`,
    `padding:14px 0`, `border-top:1px solid`. Hora heading 800 14px (a última
    entrada em accent), título 15px/800, texto 13px `opacity:.75`,
    `max-width:62ch`, `text-wrap:pretty`.
  - *Meios no local*: `.table` — Entidade · Meios · Operacionais (dir.) ·
    Chegada · Estado (`.tag`: "No local" `#eae7e7`/`#444141`; "Em trânsito"
    `#FFE4CC`/`#7A3600`).
  - *Coluna lateral*: "Ponto de situação" (`border-top:2px solid --color-text`),
    bloco de aviso ao público com fundo `--color-accent` e texto `--color-bg`
    ("Se vai circular na zona"), "Condições no local" em grelha 2×2 com
    `gap:1px`, e "Na imprensa" — links `padding:12px 0`, `border-top:1px`, com
    fonte + hora uppercase 10.5px `opacity:.55` e título 14px/800.

### 7. Mobile (390×844)

Duas molduras de telefone lado a lado com `gap:56px`.

*Mapa*: cabeçalho com marca e "EM DIRETO"; três KPIs compactos (Ativas /
Vermelho / Meios, número 18px); mapa de `height:250px` sem labels de distrito
(`labels="false"`); folha "Perto de mim" com `border-top:2px solid --color-text`,
puxador de `36×4` centrado e quatro linhas de ocorrência; tab bar inferior
(Mapa / Lista / Alertas / Eu) com `border-top:2px` e `padding-bottom:22px` para o
home indicator.

*Detalhe*: barra "← RD-…"; faixa `#EC3013` com "NÍVEL VERMELHO · EM RESOLUÇÃO";
título 23px; três KPIs; mini-mapa de `height:170px`; cronologia condensada
(`grid-template-columns:44px 1fr`, só horas e títulos); rodapé fixo com
`.btn-primary.btn-block` "Seguir esta ocorrência" e `border-top:2px solid --color-text`.

**Alvos de toque:** mínimo 44px de altura em todas as linhas e botões.

## O mapa (`portugal-map.js`)

Custom element `<pt-map>`, sem dependências além de d3 e topojson-client.
**Não desenhar geografia à mão** — o protótipo carrega geometria real:

- Geometria: TopoJSON dos 18 distritos do continente, neste pacote como
  `pt-districts.topo.json` (52 KB). Servir do próprio domínio, não de um CDN de
  terceiros. Fallback: `world-atlas@2.0.2/countries-110m.json`, do qual se extrai
  o maior anel do polígono "Portugal" (o continente).
- As ilhas vêm mal posicionadas nessa fonte e são filtradas
  (`.filter(f => !/^Ilha/.test(f.name))`). **Se as ilhas forem necessárias**,
  trocar por uma fonte com CAOP oficial e desenhar Madeira e Açores em cartuchos
  separados, não à escala no mesmo enquadramento.
- Projeção `d3.geoMercator().fitExtent(...)` com padding de 5% do lado menor.
  Passar um distrito faz `fitExtent` só a esse polígono (o zoom por distrito).
- Grelha de fundo: linhas a cada 44px em `stroke-opacity:.07` — é a grelha
  modular do sistema, não uma retícula geográfica.
- Distritos: `fill:#dedbdb`, `stroke:#201e1d` `stroke-opacity:.45`, `0.9px`.
  Distrito em foco: `fill:#ffe0d9`, `stroke-opacity:1`, `1.6px`.
- Labels de distrito só no enquadramento nacional, 8.5px `fill-opacity:.38`, com
  **teste de colisão** por caixa aproximada — as que se sobrepõem são omitidas
  (senão o norte fica ilegível). Omitidos abaixo de 300px de largura.
- Marcadores: raio 7 (vermelho) / 6 (laranja) / 5 (amarelo). Ativos com `fill` a
  cheio e um anel `@keyframes ptPulse` (r 5→26, opacity .6→0, 2.4s,
  `cubic-bezier(.2,.6,.3,1)`, infinito). Encerrados: `fill:#f3f2f2` com contorno.
  Alvo de clique invisível de `r+8`. Selecionado: quadrado de contorno em
  `--color-text` mais label do concelho e código, com `text-anchor` invertido
  quando o marcador está a menos de 150px da margem direita.
- Redesenho: `ResizeObserver` mais uma re-medição em `requestAnimationFrame`
  (a caixa ainda está a assentar quando uma propriedade chega, e sem isso o SVG
  fica cortado). Medir com `getBoundingClientRect()`, não `clientWidth`.
- Emite `CustomEvent('marker-click', { detail: id, bubbles: true })`.
- Atributos: `markers` (JSON), `selected` (id), `district` (nome), `labels`.

## Interactions & Behavior

- **Near-real-time**: contador "há N s" a subir a cada segundo; a cada ~14 s entra
  uma ocorrência nova no topo da timeline com `rdrIn` e o contador reinicia. Em
  produção: polling do endpoint a cada 30–60 s, comparar ids e animar apenas os
  novos. Manter o contador visível mesmo quando o polling falha (é o sinal de
  honestidade do "near-real-time").
- **Seleção**: clicar num marcador ou numa linha da timeline seleciona a
  ocorrência — o mapa desenha a caixa de seleção, a linha ganha fundo `#eae9e9`
  e o cartão de resumo aparece no topo da coluna. Um só id selecionado.
- **Filtros**: criticidade e natureza são multi-seleção (OR dentro do grupo, AND
  entre grupos); distrito é seleção única com toggle. "Limpar" reinicia os três.
  A vista (Ativas / Todas / Histórico) filtra por estado `Encerrada`.
- **Navegação**: tabs no topo; "Abrir detalhe" e "Detalhe →" abrem o detalhe;
  "← Voltar ao mapa" regressa; "Ver histórico →" salta para o Histórico.
- **Responsivo**: abaixo de 1200px a vista Mapa faz scroll horizontal em vez de
  comprimir as colunas (a timeline não deve estreitar). Mobile é um layout
  próprio, não o desktop reflowed.
- **Estados por implementar** (o protótipo não os mostra): loading da primeira
  carga, falha do endpoint (mostrar o último timestamp bom e um aviso discreto),
  zero resultados após filtrar.

## State Management

```ts
screen: 'mapa' | 'lista' | 'historico' | 'distritos' | 'detalhe' | 'mobile'
selectedId: string | null       // ocorrência selecionada
distrito: string | null         // filtro, seleção única
nivs: ('vermelho'|'laranja'|'amarelo')[]
tipos: string[]                 // naturezas selecionadas
view: 'Ativas' | 'Todas' | 'Histórico'
focusDistrito: string           // vista Distritos
ago: number                     // segundos desde a última sincronização
```

Derivados (não guardar): lista filtrada, KPIs, contagens por distrito e por
nível, marcadores do mapa.

## Data

**Todos os registos do protótipo são fictícios.** As coordenadas são posições
reais de concelho; ocorrências, horas, meios e notícias são inventados.

```ts
type Ocorrencia = {
  id: string;            // 'RD-2026-08417'
  hora: string;          // '14:02' — hora do alerta
  tipo: string;          // 'Acidente rodoviário' | 'Salvamento' | 'Emergência médica'
  subtipo: string;       // 'Colisão múltipla, 6 viaturas'
  concelho: string;
  freguesia: string;     // ou referência de via: 'A1 · km 213'
  distrito: string;
  niv: 'vermelho' | 'laranja' | 'amarelo';
  estado: 'Despacho' | 'Em Curso' | 'Chegada ao TO' | 'Em Resolução'
        | 'Em Conclusão' | 'Vigilância' | 'Encerrada';
  meios: number;
  operacionais: number;
  lat: number; lon: number;
  dur: string;           // '3h 36m' desde o alerta
};
```

**Fonte pretendida** (indicada pelo utilizador): o portal ArcGIS da Proteção Civil —
`https://prociv-portal.geomai.mai.gov.pt/arcgis/apps/experiencebuilder/experience/?id=29e83f11f7a34339b35364e483e3846f`.
Ainda não foi mapeada. Antes de implementar:

1. Inspecionar a app do Experience Builder e apanhar os pedidos de rede — os
   dados vêm de um FeatureServer
   (`.../FeatureServer/0/query?f=json&where=1=1&outFields=*`), não de HTML.
   Preferir sempre esse endpoint a scraping.
2. Mapear os campos reais para o modelo acima e **substituir a nomenclatura do
   protótipo pela do serviço** onde diferir; os nomes de estado seguem o
   vocabulário público da ANEPC, mas confirmar.
3. Verificar termos de uso e limites de pedidos; sem autorização para consumo
   direto, montar um proxy com cache no servidor (também resolve CORS e protege o
   portal de picos).
4. Nunca expor coordenadas mais precisas do que a fonte publica — o portal é
   público e o protótipo assume precisão ao nível da freguesia/quilómetro.

## Assets

- `pt-districts.topo.json` — geometria dos 18 distritos (TopoJSON, 52 KB).
  Derivada de dados GADM; verificar licença antes de publicar.
- `_ds/modernist-*/` — o design system: `styles.css` (tokens + componentes),
  `_ds_bundle.js`, e o `readme.md` com a direção visual.
- Archivo (Google Fonts), pesos 400 e 800.
- Ícones: Lucide, se forem necessários. O protótipo não usa nenhum — a hierarquia
  é toda tipográfica e de réguas. Não acrescentar ícones decorativos.
- Sem imagens. Se vierem a existir fotografias, passam pelo wrapper
  `.grayscale` do sistema.

## Files

| Ficheiro | O que é |
| --- | --- |
| `Radar 112.dc.html` | Protótipo completo: cinco vistas desktop, detalhe e duas vistas mobile. **A referência principal.** |
| `Radar 112 offline.html` | O mesmo protótipo num ficheiro único, sem rede. Abre sem servidor. |
| `portugal-map.js` | O custom element `<pt-map>`. Portar tal e qual ou reescrever em React seguindo as notas acima. |
| `pt-districts.topo.json` | Geometria dos distritos. |
| `ios-frame.jsx` | Moldura de iPhone — andaime de apresentação, **não** faz parte do produto. |
| `support.js` | Runtime dos protótipos. Não portar. |
| `_ds/modernist-*/` | Design system Modernist. |

Para abrir `Radar 112.dc.html` é preciso um servidor local (`npx serve .`) —
carrega ficheiros irmãos. O `offline.html` abre direto.

## Notas finais

- O repositório está vazio: não há convenções a respeitar, mas também não há nada
  para reaproveitar. As escolhas de stack acima são recomendação, não requisito.
- Nenhum dado real foi ligado. A primeira tarefa útil é o passo 1 de "Data" — sem
  o endpoint mapeado, o resto é fachada.
- O produto é para o **público geral**, não para sala de operações: sem jargão
  desnecessário, sem densidade de dashboard interno, e avisos escritos na
  perspetiva de quem vai passar no local.
