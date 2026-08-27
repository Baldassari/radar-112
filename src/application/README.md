# Radar 112 — frontend

Portal público de acompanhamento das ocorrências da Proteção Civil. Vite +
React + TypeScript, TanStack Query, d3-geo/topojson-client para o mapa.

## Desenvolvimento

```bash
npm install
npm run dev
```

Por omissão corre inteiramente sobre **mocks locais** (sem backend): um
gerador de ocorrências fictícias e um simulador de SSE (nova ocorrência a
cada ~14s, heartbeat a cada 1s), atrás da mesma interface `OcorrenciasSource`
que a implementação real usará — ver `src/api/`.

Para apontar ao backend real (`src/api/Radar112.Api`), definir em
`.env.local`:

```
VITE_API_BASE_URL=http://localhost:5080
```

## Contrato da API

`docs/api/openapi.yaml` (na raiz do repo) é a fonte da verdade dos tipos.
Depois de o editar, regenerar `src/api/schema.d.ts`:

```bash
npm run gen:api
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — type-check + build de produção
- `npm run lint` — oxlint
- `npm run gen:api` — gera `src/api/schema.d.ts` a partir do contrato OpenAPI
