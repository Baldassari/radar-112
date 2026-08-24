# Plano de frontend: Radar 112

## 1. Objetivo

Implementar o frontend do Radar 112 em Next.js dentro de `src/application`, reproduzindo o mockup como uma central operacional para acompanhamento de ocorrências da Proteção Civil em Portugal continental.

O frontend deve permitir:

- acompanhar ocorrências ativas em mapa e timeline;
- filtrar por localidade, criticidade, distrito e natureza;
- abrir o detalhe de uma ocorrência sem perder o contexto do mapa;
- consultar todas as ocorrências e o histórico;
- consultar a visão agregada por distrito;
- receber atualizações próximas de tempo real;
- funcionar bem em desktop e mobile;
- expor estados claros de carregamento, vazio, erro e dados desatualizados.

## 2. Leitura do mockup

### Shell operacional

- Marca `RADAR 112`.
- Navegação: `Mapa`, `Ocorrências`, `Histórico`, `Distritos` e `Mobile`.
- Indicador de conexão/atualização: `Em direto` e idade do último dado.
- Ação para subscrever alertas.

### Dashboard do mapa

- Indicadores: ocorrências ativas, níveis vermelho, meios no terreno, operacionais e distritos afetados.
- Faixa de aviso vermelho com mensagem e validade.
- Filtros laterais:
  - pesquisa por localidade;
  - criticidade: vermelho, laranja e amarelo;
  - distrito;
  - natureza: acidente rodoviário, salvamento e emergência médica;
  - limpar filtros.
- Mapa de Portugal continental com marcadores por criticidade e posição aproximada.
- Legenda de criticidade.
- Painel da ocorrência selecionada com identificador, nível, natureza, localização, meios, operacionais, duração e ação para abrir detalhe.
- Timeline com abas `Ativas`, `Todas` e `Histórico`, cartões clicáveis e estado operacional.

### Outras visões

- **Ocorrências:** listagem pesquisável e filtrável, com ordenação, paginação ou carregamento incremental e acesso ao detalhe.
- **Histórico:** consulta por intervalo de tempo, filtros e estado final da ocorrência.
- **Distritos:** agregação por distrito, criticidade, quantidade de ocorrências, meios e operacionais, com acesso às ocorrências do distrito.
- **Mobile:** não deve ser uma tela separada com conteúdo duplicado; deve ser o comportamento responsivo da mesma experiência, com filtros e detalhe convertidos em drawers/bottom sheets quando necessário.

## 3. Arquitetura proposta

### Stack

- Next.js com App Router e TypeScript.
- React Server Components para estrutura e carregamento inicial onde fizer sentido.
- Componentes client apenas para mapa, filtros, seleção, tabs, drawers, subscrição e atualizações em tempo real.
- Biblioteca de mapa com suporte a Portugal, marcadores, clustering e acessibilidade. Avaliar MapLibre GL JS ou Leaflet; decidir na prova de conceito conforme licenciamento, bundle e suporte a tiles internos.
- Biblioteca de componentes acessíveis e utilitários de estilo consistente com o mockup. Evitar introduzir um design system grande antes de validar as telas.
- Cliente HTTP tipado gerado a partir do contrato OpenAPI, quando a API o disponibilizar.
- TanStack Query ou equivalente para cache, invalidação, polling e estados de consulta; manter a escolha consistente em todo o app.

### Estrutura inicial sugerida

```text
src/application/
  app/
    layout.tsx
    page.tsx
    mapa/page.tsx
    ocorrencias/page.tsx
    ocorrencias/[id]/page.tsx
    historico/page.tsx
    distritos/page.tsx
    distritos/[codigo]/page.tsx
  components/
    shell/
    dashboard/
    map/
    occurrences/
    history/
    districts/
    filters/
    alerts/
    ui/
  lib/
    api/
    realtime/
    formatters/
    geography/
  types/
  styles/
  public/
```

A estrutura é uma referência inicial. Os nomes finais devem acompanhar as convenções do projeto quando o bootstrap for criado.

### Responsabilidades

- `app/layout.tsx`: fontes, tema, providers, metadados e shell persistente.
- `shell`: cabeçalho, navegação, indicador de atualização e layout responsivo.
- `dashboard`: KPIs, faixa de alerta, painel selecionado e composição do mapa/timeline.
- `map`: mapa, marcadores, legenda, seleção e estados de posição aproximada.
- `filters`: estado serializável em URL, filtros reutilizáveis e limpeza.
- `occurrences`, `history`, `districts`: tabelas/listas e seus estados próprios.
- `lib/api`: chamadas HTTP, normalização e tratamento de erros.
- `lib/realtime`: conexão SSE ou WebSocket e eventos de atualização.
- `types`: modelos compartilhados do frontend, enums e contratos derivados da API.

## 4. Rotas e navegação

- `/`: redireciona para `/mapa` ou renderiza o dashboard principal.
- `/mapa`: mapa, filtros, KPIs, alerta e timeline.
- `/ocorrencias`: consulta operacional com os mesmos filtros básicos.
- `/ocorrencias/[id]`: detalhe completo; no desktop pode abrir como intercepting route/modal sobre a lista ou mapa, preservando deep link.
- `/historico`: ocorrências encerradas e consulta por período.
- `/distritos`: visão comparativa dos distritos.
- `/distritos/[codigo]`: detalhe do distrito e ocorrências associadas.

Filtros, tab ativa, ordenação e paginação devem ser refletidos nos parâmetros da URL sempre que isso melhorar compartilhamento, refresh e navegação do operador.

## 5. Modelo de dados mínimo

Alinhar com o backend os seguintes recursos:

- `Occurrence`:
  - `id`, `reportedAt`, `updatedAt`;
  - `nature`;
  - `criticality` (`red`, `orange`, `yellow`);
  - `status` (`monitoring`, `inProgress`, `resolving`, `concluding`, `closed`);
  - `districtCode`, `districtName`, `locality`, `locationDescription`;
  - `latitude`, `longitude`, `locationAccuracy`;
  - `resourcesCount`, `personnelCount`;
  - descrição resumida e descrição detalhada;
  - timeline de eventos.
- `DashboardSummary`: contadores e timestamp da fonte.
- `DistrictSummary`: totais por distrito e distribuição por criticidade/natureza.
- `Alert`: nível, mensagem, distritos afetados, início, validade e atualização.
- `OccurrenceEvent`: timestamp, tipo, texto, origem e autor, se aplicável.
- `PagedResult<T>`: itens, total, cursor/página e filtros aplicados.

Os estados visuais devem depender de enums/valores normalizados, nunca de texto livre retornado pela API.

## 6. Contrato com o backend .NET 10 + Wolverine FX

Definir antes da implementação final um contrato versionado, preferencialmente OpenAPI para consultas e eventos tipados para tempo real.

### Endpoints de leitura sugeridos

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/occurrences?status=&criticality=&district=&nature=&locality=&from=&to=&cursor=`
- `GET /api/v1/occurrences/{id}`
- `GET /api/v1/districts/summary`
- `GET /api/v1/districts/{code}`
- `GET /api/v1/alerts/active`

### Atualizações

Preferir SSE para atualização unidirecional do dashboard, salvo necessidade real de comunicação bidirecional:

- `GET /api/v1/stream/occurrences`
- eventos: `occurrence.created`, `occurrence.updated`, `occurrence.closed`, `alert.updated`, `summary.updated`.

O frontend deve reconectar com backoff, indicar `reconnecting`/`stale`, deduplicar eventos por `id` e `updatedAt`, e fazer refetch após reconexão. A subscrição de alertas deve ter contrato separado, com consentimento e estado de permissão.

### Decisões de contrato necessárias

- autenticação e autorização, incluindo perfis de operador e consulta pública;
- CORS, base URL por ambiente e política de rate limit;
- timezone oficial e formato ISO 8601;
- convenção de erro `ProblemDetails`;
- paginação/cursor e limites máximos;
- precisão permitida para localização aproximada;
- garantias de ordenação e idempotência dos eventos;
- comportamento quando uma ocorrência é removida ou fica indisponível.

Wolverine FX fica responsável por handlers, mensagens e persistência no backend; o frontend não deve conhecer detalhes internos de Wolverine nem depender de nomes de comandos internos.

## 7. Plano de execução

### Fase 0: decisões e bootstrap

1. Confirmar versão do Node, gerenciador de pacotes, padrão de lint/format e estratégia de deploy.
2. Criar o app Next.js em `src/application` com TypeScript, App Router, ESLint e aliases.
3. Definir variáveis de ambiente (`NEXT_PUBLIC_API_BASE_URL`, configuração de tiles e ambiente).
4. Fixar tipografia, tokens de cor, espaçamento, estados de criticidade e breakpoints derivados do mockup.
5. Definir contrato OpenAPI/eventos junto ao backend e gerar tipos do cliente.

### Fase 1: shell e dashboard estático

1. Implementar layout global, navegação e indicador de dados.
2. Implementar KPIs, faixa de alerta, filtros e timeline com fixtures tipadas.
3. Implementar responsividade: sidebar no desktop, drawer no tablet/mobile, bottom sheet para detalhe.
4. Implementar estados loading, empty, error e stale antes de ligar à API.

### Fase 2: mapa

1. Fazer uma prova de conceito com mapa de Portugal continental e tiles configuráveis.
2. Renderizar marcadores por criticidade, seleção, foco e clusterização.
3. Ligar filtros ao mapa e manter seleção sincronizada com timeline/URL.
4. Exibir aviso de posição aproximada e fallback quando geolocalização não estiver disponível.
5. Testar teclado, foco, contraste, alternativa textual da lista e desempenho com muitos marcadores.

### Fase 3: dados reais e detalhe

1. Integrar summary, ocorrências, alertas e detalhe através do cliente tipado.
2. Implementar cache, cancelamento de consultas, paginação/cursor e tratamento de `ProblemDetails`.
3. Implementar detalhe com timeline completa, metadados e histórico de alterações.
4. Implementar atualização SSE, reconexão e invalidação seletiva.

### Fase 4: vistas secundárias

1. Implementar `/ocorrencias` com filtros, ordenação e acesso ao detalhe.
2. Implementar `/historico` com período, paginação e estados finais.
3. Implementar `/distritos` e detalhe do distrito com agregações.
4. Reutilizar componentes e filtros sem duplicar regras de normalização.

### Fase 5: qualidade e entrega

1. Testes unitários para formatadores, filtros, reducers/estado e normalização de eventos.
2. Testes de componentes para seleção, filtros, timeline, drawers e estados de erro.
3. Testes E2E para abrir o mapa, filtrar, selecionar, navegar para detalhe e recuperar após reconexão.
4. Auditoria de acessibilidade com teclado, leitores de tela e axe.
5. Teste visual responsivo em larguras desktop, tablet e mobile.
6. Teste de desempenho do mapa, bundle, carregamento inicial e atualização de listas.
7. Configurar CI para lint, typecheck, testes e build; publicar relatório de cobertura e artefatos.

## 8. Critérios de aceite

- O operador consegue localizar uma ocorrência por mapa, filtro ou timeline e abrir seu detalhe.
- A seleção de uma ocorrência permanece coerente entre mapa, lista, URL e painel.
- Criticidade usa cor, texto e outro sinal visual; não depende apenas de cor.
- A interface diferencia dado ao vivo, reconectando, desatualizado, vazio e erro.
- Atualizações não apagam filtros nem movem o foco do operador sem intenção explícita.
- O layout é utilizável em mobile sem exigir zoom horizontal e sem sobreposição de painéis.
- Rotas profundas podem ser recarregadas diretamente.
- O frontend não expõe detalhes internos do backend e trata erros de contrato de forma previsível.
- `lint`, `typecheck`, testes e `next build` passam no CI.

## 9. Riscos e decisões em aberto

- **Mapa e tiles:** validar licença, disponibilidade offline/cache e custo antes de acoplar a biblioteca.
- **Tempo real:** começar com SSE; migrar para WebSocket apenas se houver requisito bidirecional comprovado.
- **Dados sensíveis:** limitar precisão de coordenadas e revisar autorização antes de exibir detalhes.
- **Volume:** definir limite de marcadores e estratégia de clustering/viewport query.
- **Semântica operacional:** fechar com o domínio a máquina de estados e os textos de cada status.
- **Offline:** o arquivo do mockup é offline, mas o produto precisa decidir se haverá cache read-only, banner de indisponibilidade ou somente modo online.

## 10. Primeiro incremento recomendado

Entregar uma fatia vertical pequena e demonstrável:

1. bootstrap Next.js em `src/application`;
2. shell responsiva;
3. dashboard com fixtures tipadas;
4. mapa com 10 ocorrências do mockup;
5. filtros de criticidade/distrito/natureza;
6. seleção sincronizada entre marcador, timeline e painel;
7. testes básicos do filtro e da seleção;
8. contrato inicial documentado para `summary`, `occurrences` e `occurrences/{id}`.

Essa fatia valida a composição visual e os estados compartilhados antes de investir nas telas secundárias e no tempo real.
