# Arquitectura de MIS-FUENTE (stg-app-mis-r22)

> Estado analizado: rama `main`, commit `3c7f132` (2026-07-30). Generado con ayuda de CodeGraph
> sobre el árbol de trabajo actual, no sobre documentación previa (ver nota al final sobre la
> rama huérfana `recovered/fase-1-higiene`, que describe un estado distinto de este mismo repo).

## 1. Qué es

Aplicación Angular 14 (MIS — Management Information System) para Financiera Confianza. Consume
un backend propio vía un protocolo custom llamado **Winder**, envuelto en cifrado AES simétrico
con claves hardcodeadas por módulo. Es un panel administrativo con decenas de reportes de
negocio (comercial, cartera, incentivos, presupuesto, RRHH) organizados como módulos Angular
independientes, en su mayoría cargados con lazy-loading.

## 2. Escala

| Métrica | Valor |
|---|---|
| Archivos `.ts` en `src/app` | 934 |
| Archivos `*.module.ts` | 337 |
| Archivos `*.spec.ts` (tests) | 28 |
| Archivos `*.util.ts` sueltos | 119 |
| Dependencias de producción / dev | 45 / 18 |
| Angular / CLI | 14.2.5 / 14.2.9 |

## 3. Capas de primer nivel (`src/app/*`)

```
core/       infraestructura transversal (parcialmente poblada, ver §6)
material/   un solo archivo: material.module.ts (reexport de Angular Material)
modules/    los módulos de negocio (49% del código vive bajo modules/reportes)
shared/     componentes, servicios, pipes y utilidades reutilizables entre módulos
system/     shell de la aplicación: sesión, autenticación, administración, layout
```

### 3.1 `core/`

```
core/data/remote/winder/    WinderService, Strand, contratos del protocolo Winder
core/data/remote/rest/      RESTService (wrapper delgado de HttpClient)
core/data/remote/ant/       AntService (clase base que heredan ~15 Mod*Service de dominio)
core/data/remote/instances/ ModSysAdminService, ModSysLoginService, ModAppService
core/data/local/            LocalStoreService
core/services/              TokenService, CypherService, RoutePartsService, MatchMediaService, UILibIconService
core/helpers/               functions.util.ts, debug.util.ts
core/guards/                vacío
core/interceptors/          vacío
core/interfaces/            vacío
```

`core/services` y `core/helpers` se poblaron recién (sesión actual) moviendo ahí los servicios
de `shared/services` que eran infraestructura transversal en vez de features de UI. `core/guards`,
`core/interceptors` e `core/interfaces` siguen vacíos — ver hallazgo en el informe de falencias.

### 3.2 `system/`

```
system/session/authentication/   AuthService, auth.guard.ts
system/session/guards/           login.guard.ts
system/session/views/            login, signin
system/admin/guards/             admin-guard, dummy-guard, route-guard
system/admin/interceptors/       TokenInterceptor (repository/)
system/admin/services/           UserService, AdminService, RouteTrackerService
system/admin/components/         header-top, start-menu, session-end-dialog, notifications...
system/admin/views/              layout de la shell autenticada
```

Los guards e interceptors **reales** de la aplicación viven acá, no en `core/guards`/
`core/interceptors` (que están vacíos). Es la implementación de facto del layer que `core/`
sugiere por nombre pero no contiene.

### 3.3 `shared/`

```
shared/components/   26 subcarpetas (stg-table, stg-table2, stg-table3, stg-table4, stg-alert,
                      stg-window, stg-binput, stg-app-loader, stg-app-confirm, ...)
shared/ui/            9 subcarpetas (in-form-dialog, tbl-picker-dialog, sec-picker-dialog, ...)
shared/services/      servicios de UI/negocio puntual (client-summary, in-form-dialog,
                      tbl-picker-dialog, sec-picker-dialog2) — ya no incluye infraestructura
shared/pipes/         DynamicFormatPipe (formateo condicional de columnas de tabla) y otros
shared/directives/    DropdownLinkDirective, AppDropdownDirective, admin-sidenav-helper...
shared/animations/, shared/base/, shared/constants/, shared/interfaces/
```

### 3.4 `modules/` (negocio)

| Módulo | Archivos .ts | Nota |
|---|---:|---|
| `reportes/` | 462 | dominante — ver desglose abajo |
| `analista/` | 51 | |
| `presupuesto/` | 44 | |
| `incentivos3/` | 38 | |
| `actividades/` | 23 | |
| `reasignacion-cart-cap/` | 20 | |
| `incentivos4/` | 19 | |
| `incentivos-a/` | 18 | |
| `framework-esg/` | 17 | |
| `incentivos2/` | 16 | |
| `corresponsales/` | 16 | |
| `administracion/` | 15 | |
| `reportes-e/` | 13 | |
| `sistematica/`, `kaypacha/` | 11 c/u | |
| `ranking-k/` | 10 | usa `eval()` sobre respuesta del backend |
| `Kaypacha2/` | 8 | |
| `basenegativa/` | 6 | |
| `Kaypacha3/` | 5 | |
| `shared/` | 1 | solo `modules-key.config.ts` — nombre choca con `app/shared/` real |

Desglose de `modules/reportes/` (462 archivos):

```
reportes/repositorio/   223  reportes "nuevos", organizados por dominio
reportes/legacy/        157  código explícitamente marcado como legacy, aún activo
reportes/organizacion/   76  reportes de actividad diaria/mensual (rep01-*)
reportes/components/      2
reportes/compartido/      1
```

## 4. Flujo de datos (backend)

```
Componente de negocio
   → Mod<Dominio>Service (extiende AntService)   -- uno por dominio: ModSysAdminService,
                                                     ModIncentivos3Service, ModCorresponsalService...
   → AntService.get/post                          -- arma un Strand con el nombre de la operación
   → WinderService.prepare().get()/.post()         -- serializa y cifra la config con CypherService
   → RESTService                                   -- wrapper delgado sobre HttpClient
   → backend (protocolo Winder, puerto+secreto por módulo, ver environment.ts)
```

Cada dominio tiene su propio "puerto" y "secreto" de módulo definidos en
`environment.ts:moduleSecrets` (session, app, sis, admin, secciones, reporting, rep2). El cifrado
es simétrico (AES, `CypherService`), no HTTPS-only con token bearer estándar.

## 5. Sesión y autenticación

```
TokenService (core/services)  — genera/valida un token cifrado guardado vía UserService
AuthService (system/session)  — login/logout, estado de sesión
TokenInterceptor              — intercepta requests al dominio Ant y llama a
                                 tokenService.updateToken() en cada request
auth.guard / login.guard      — protegen rutas de la shell autenticada / de login
```

Dato relevante para el informe de falencias: la porción del interceptor que efectivamente
adjunta el header `Authorization` a la request está comentada (código muerto), igual que un
bloque equivalente en `WinderService.init()`. Ver informe.

## 6. Enrutamiento

63 archivos usan `loadChildren` (lazy loading) sobre 337 módulos totales — la mayoría del árbol
de reportes se carga bajo demanda por dominio. `rda-administracion-routing.module.ts` es, por
lejos, el routing module más grande del repo.

## 7. Testing y tooling

- Test runner: Karma + Jasmine, con `karma-coverage` configurado pero 28 archivos `.spec.ts`
  contra 934 `.ts` de producción.
- Lint: `tslint.json` (TSLint, deprecado por el equipo de Angular desde fines de 2020).
- `tsconfig.json` no tiene `"strict": true`.

## 8. Nota sobre el historial de git

Existe una rama recuperada localmente, `recovered/fase-1-higiene` (commit `f1096e5`), que
contiene ~57 commits de un esfuerzo de refactorización previo (limpieza de código muerto,
consolidación de `stg-table` v1-v4 en una sola versión, cierre de duplicados `ModReportesEService`,
inventario completo de los 337 `*.module.ts`, y una carpeta `doc/` propia con arquitectura y
hallazgos H-01..H-24). Esa rama **diverge de `main`** en el commit `f34f81f` y nunca se fusionó —
`main` siguió un camino distinto (migración de componentes/UI). Este documento describe el
estado real de `main` tal como está hoy, que en varios puntos es *anterior* al trabajo ya hecho
(y perdido de `main`) en esa rama — por ejemplo, `stg-table` v1-v4 siguen duplicados acá aunque
ya se habían consolidado allá. Decisión de qué hacer con esa rama: pendiente, del usuario.
