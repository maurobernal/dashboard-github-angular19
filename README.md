# GitHub PR Dashboard

![resumen project](https://github.com/maurobernal/-dashboard-github/blob/main/githubdashboard.png)

Dashboard de los pull requests **abiertos** de una organización y de un usuario de GitHub, con
filtros dinámicos (origen, repositorio, autor, draft, label, estado de review), estado de las
GitHub Actions/checks y cantidad de comentarios. Los filtros se reflejan en la URL, así que una vista
filtrada se puede guardar o compartir.

Angular 22 · zoneless · signals · `httpResource` · Signal Forms · Tailwind 4 · ng2-charts · Vitest.

## Requisitos

- Node `>= 24.15` o `>= 26` (ver `.nvmrc`)
- [Bun](https://bun.sh)

## Configuración

```bash
bun install
cp src/environments/github.secrets.sample.ts src/environments/github.secrets.ts
```

Completá `token`, `user` y `org` en `src/environments/github.secrets.ts` (está en `.gitignore`).

Permisos del token: fine-grained PAT con lectura de _Metadata_, _Pull requests_, _Commit statuses_
y _Checks_; o classic PAT con `repo` + `read:org`.

> ⚠️ El token queda embebido en el bundle del front. Usalo sólo localmente: no publiques el build.

## Scripts

| Comando          | Descripción                          |
| ---------------- | ------------------------------------ |
| `bun start`      | Dev server en http://localhost:4200  |
| `bun run build`  | Build de producción en `dist/`       |
| `bun run test`   | Tests unitarios (Vitest)             |
| `bun run lint`   | ESLint (angular-eslint, flat config) |
| `bun run format` | Prettier                             |

## Arquitectura

```
src/app/
├── core/github/              # config (InjectionToken), interceptor de auth, query GraphQL + tipos crudos
├── features/pull-requests/
│   ├── open-pull-requests.resource.ts   # httpResource → GraphQL (una sola request para org + usuario)
│   ├── pull-request.mapper.ts           # respuesta GraphQL → modelo de dominio
│   ├── pull-request-filters.ts          # filtrado, opciones dinámicas y sync con query params (funciones puras)
│   ├── pull-requests-page/              # página: estado (signals) y composición
│   ├── filters-panel/                   # Signal Forms
│   ├── kpi-summary/ · kpi-charts/       # indicadores; los gráficos (chart.js) se cargan con @defer
│   └── pull-request-card/
└── shared/                   # chip-select (custom control de Signal Forms), pipe relativeTime
```

Se usa la API **GraphQL** de GitHub porque en una sola consulta trae PRs, reviews, comentarios y el
resultado de los checks (`statusCheckRollup`). La búsqueda devuelve hasta 100 PRs por origen; si hay
más, el dashboard lo avisa.
