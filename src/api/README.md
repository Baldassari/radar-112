# Radar 112 — backend (esqueleto)

.NET 10 + WolverineFx. Nesta fase é **só esqueleto**: solução, projeto web,
Wolverine e WolverineFx.Http ligados, documento OpenAPI nativo do .NET 10,
CORS para o dev server do frontend (`http://localhost:5173`) e um
`GET /health`. Sem endpoints de negócio ainda.

## Correr

```bash
dotnet run --project Radar112.Api
```

- `GET /health` → `{ "status": "ok" }`
- `GET /openapi/v1.json` → documento OpenAPI gerado

## Próximos passos

O contrato em `docs/api/openapi.yaml` (raiz do repo) é a fonte da verdade —
o frontend já gera tipos TS a partir dele (`npm run gen:api` em
`src/application`) e corre sobre mocks que seguem essa mesma forma.

Para implementar a API real, portar cada path do contrato para um endpoint
WolverineFx.Http (`[WolverinePost]`/`[WolverineGet]` em handlers, descobertos
automaticamente por `app.MapWolverineEndpoints()`), incluindo:

- `GET /ocorrencias`, `/ocorrencias/{id}`, `/distritos`, `/distritos/{nome}`,
  `/historico`, `/kpis` — endpoints Wolverine.Http normais.
- `GET /ocorrencias/stream` — SSE. Não implementar com um loop/canal manual:
  usar o suporte nativo do .NET 10,
  `TypedResults.ServerSentEvents(IAsyncEnumerable<SseItem<T>>)`, alimentado
  por um `BackgroundService` que publica no message bus do Wolverine
  (`ocorrencia.created` / `ocorrencia.updated`) sempre que os dados mudam.

Fora de escopo por agora: mapear o FeatureServer real da Proteção Civil
(ver README do handoff de design, secção "Data") — a origem dos dados reais
ainda não foi investigada.
