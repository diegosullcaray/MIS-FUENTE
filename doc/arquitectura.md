# Arquitectura de MIS-FUENTE (stg-app-mis-r22)

> Estado analizado: rama `main`, commit `f0ca213` (2026-07-30). Actualizado sobre la versión
> anterior de este documento (commit `3c7f132`) tras verificar con CodeGraph los cambios de
> commits posteriores: consolidación de módulos huérfanos en `backups/` y migración de
> `system/` a `pages/full-pages/{auth,layout}`. Ver nota al final sobre la rama huérfana
> `recovered/fase-1-higiene`, que describe un estado distinto de este mismo repo.

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
pages/      full-pages/{auth,layout}: shell de la app (ex `system/`, migrado 2026-07-30)
shared/     componentes, servicios, pipes y utilidades reutilizables entre módulos
```

`system/` ya no existe como carpeta de primer nivel — se migró completa a
`pages/full-pages/` (commits `896a664`, `4e7116c`, `f0ca213`), ver §3.2.

Además, 8 módulos de negocio sin ruta activa o sin consumidores cruzados se movieron de
`modules/` a `backups/modules/` en esta misma sesión de trabajo: `administracion`,
`incentivos-a`, `incentivos2`, `incentivos4`, `kaypacha`, `Kaypacha2`, `reasignacion-cart-cap`,
`sistematica` (commits `610ff29`, `f381402`, `25623fd`, `7a1cd64`). De la familia `incentivos*`
y `kaypacha*` solo quedan **vivos en `modules/`**: `incentivos3` y `Kaypacha3`.

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

### 3.2 `pages/full-pages/` (ex `system/`)

```
pages/full-pages/system-keys.config.ts   config compartido entre auth y layout
pages/full-pages/auth/services/          AuthService, LoginService
pages/full-pages/auth/guards/            auth.guard.ts, login.guard.ts
pages/full-pages/auth/components/        auth-layout, login, signin
pages/full-pages/layout/guards/          admin-guard, dummy-guard, route-guard
pages/full-pages/layout/interceptors/    token.interceptor.ts, http-interceptors.ts
pages/full-pages/layout/services/        UserService, AdminService (ex admin.service),
                                          RouteTrackerService, NavigationService, ThemeService,
                                          LayoutService, AdminSidenavHelperService
pages/full-pages/layout/components/      header-top, sidebar-top, sidenav, start-menu,
                                          session-end-dialog, notifications, admin-layout, desktop
pages/full-pages/layout/interfaces/      layout-conf, menu-item, shortcut, theme
```

Los guards e interceptors **reales** de la aplicación siguen viviendo acá (ex `system/admin`,
`system/session`), no en `core/guards`/`core/interceptors` (que siguen vacíos tras la
migración). Es la implementación de facto del layer que `core/` sugiere por nombre pero no
contiene — la migración a `pages/full-pages/` reorganizó y renombró, pero no resolvió este
hallazgo (ver informe de falencias, punto 9).

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
| `incentivos3/` | 38 | único módulo vivo de la familia `incentivos*` |
| `actividades/` | 23 | |
| `framework-esg/` | 17 | |
| `corresponsales/` | 16 | |
| `reportes-e/` | 13 | ruta activa `/app/dashboards`, sin uso cruzado — candidato a mover, sin confirmar |
| `ranking-k/` | 10 | usa `eval()` sobre respuesta del backend |
| `basenegativa/` | 6 | |
| `Kaypacha3/` | 5 | único módulo vivo de la familia `kaypacha*` |
| `shared/` | 1 | solo `modules-key.config.ts` — nombre choca con `app/shared/` real |

`administracion`, `incentivos-a`, `incentivos2`, `incentivos4`, `kaypacha`, `Kaypacha2`,
`reasignacion-cart-cap` y `sistematica` ya no están en esta tabla — se movieron a
`backups/modules/` (ver §3, arriba).

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
TokenService (core/services)          — genera/valida un token cifrado guardado vía UserService
AuthService (pages/full-pages/auth)  — login/logout, estado de sesión
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

Hubo una rama de un esfuerzo de refactorización previo, `refactor/fase-1-higiene`, que llegó a
~57 commits (limpieza de código muerto, consolidación de `stg-table` v1-v4 en una sola versión,
cierre de duplicados `ModReportesEService`, inventario completo de los 337 `*.module.ts`, y una
carpeta `doc/` propia con arquitectura y hallazgos H-01..H-24). Esa rama diverge de `main` en el
commit `f34f81f`; **hoy no existe como rama** (`git branch -a` solo muestra `main`) — su último
commit (`3631e60`) sigue vivo únicamente en el reflog local y no es ancestro de `main`, por lo
que se perderá si el reflog expira sin que alguien lo referencie de nuevo
(`git branch <nombre> 3631e60` lo recupera mientras siga en el reflog).

Parte de ese trabajo se re-hizo de forma independiente sobre `main` en esta sesión (mover
`administracion`/`incentivos-a`/`incentivos2`/`incentivos4`/`kaypacha`/`Kaypacha2`/
`reasignacion-cart-cap`/`sistematica` a `backups/`, exactamente el mismo conjunto que aquella
rama había movido). **Lo que NO se re-hizo todavía en `main`:** la consolidación de `stg-table`
v1-v4 en una sola versión y la limpieza de imports muertos en NgModules (H-16) — ambas siguen
resueltas solo en la rama huérfana. Antes de repetir ese trabajo desde cero, vale la pena
recuperar `3631e60` y revisar si conviene reaplicarlo (cherry-pick) en vez de rehacerlo.
Decisión de qué hacer con esa rama: pendiente, del usuario (ver memoria de sesión — confirmó
"ignorarla, seguir en main" el 2026-07-30, sin descartar retomarla más adelante).
