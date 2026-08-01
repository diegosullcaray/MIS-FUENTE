# Arquitectura de MIS-FUENTE (stg-app-mis-r22)

> Estado analizado: rama `main`, commit `f0ca213` (2026-07-30). Actualizado sobre la versión
> anterior de este documento (commit `3c7f132`) tras verificar con CodeGraph los cambios de
> commits posteriores: consolidación de módulos huérfanos en `backups/` y migración de
> `system/` a `pages/full-pages/{auth,layout}`. Ver nota al final sobre la rama huérfana
> `recovered/fase-1-higiene`, que describe un estado distinto de este mismo repo.
>
> **Actualización 2026-07-31 (commit `f707bbc`):** §5 (sesión y autenticación) reescrita tras
> trazar con CodeGraph el flujo real de login (Google OAuth → backend Winder) — la versión
> anterior de esta sección era correcta pero incompleta. Se agregó §8 (rendimiento y patrones
> Angular). El detalle de cada hallazgo de seguridad/rendimiento vive en
> `doc/informe-falencias-mejoras.md` puntos 16-26; este documento solo describe cómo funciona
> el sistema hoy, no evalúa si está bien o mal.

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
| Dependencias de producción / dev | 45 / 18 (102 / 1089 con transitivas, según `npm ls`) |
| Angular / CLI | 14.2.5 / 14.2.9 |
| Vulnerabilidades conocidas (`npm audit --omit=dev`, 2026-07-31) | 16 (1 crítica, 14 altas, 1 moderada) — ver informe de falencias punto 19 |

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
core/services/              TokenService, CypherService, RoutePartsService, MatchMediaService,
                             UILibIconService, HttpErrorService
core/interceptors/          TokenInterceptor, HttpErrorInterceptor, http-interceptors.ts (barrel)
core/helpers/               functions.util.ts, debug.util.ts
core/guards/                vacío
core/interfaces/            vacío
```

`core/services` y `core/helpers` se poblaron en una sesión previa moviendo ahí los servicios de
`shared/services` que eran infraestructura transversal en vez de features de UI. `core/guards` e
`core/interfaces` siguen vacíos. `core/interceptors` (2026-07-31) sí se pobló: se migraron ahí
`TokenInterceptor` y el módulo `HttpErrorInterceptor`/`HttpErrorService` (interceptor central de
timeout + manejo de errores HTTP, ver informe de falencias punto 24) desde
`pages/full-pages/layout/{interceptors,errors}/`, porque ninguno de los dos depende de servicios
específicos del shell de auth/layout — son genuinamente transversales. Al mover
`TokenInterceptor` se sacó además una dependencia a `AdminService` que ya estaba muerta (solo
la usaba un bloque comentado) y que hubiera obligado a `core/` a importar de `pages/`.

**Por qué los guards y las directivas del sidenav NO se movieron junto con los interceptors**
(decisión explícita, 2026-07-31): `AuthGuard`, `AdminGuard`, `DummyGuard`, `RouteGuard` y
`LoginGuard` dependen directamente de `AuthService`, `UserService`, `AdminService` y
`NavigationService` — todos servicios de feature que viven en
`pages/full-pages/{auth,layout}/services/`, no infraestructura transversal. Moverlos a
`core/guards/` dejando esos servicios donde están invertiría la dirección de dependencia que
`core/` debería tener (que `pages/` dependa de `core/`, nunca al revés) — sería mover el archivo
sin arreglar el problema de fondo. Lo mismo aplica a `AdminSidenavHelperDirective`/
`AdminSidenavTogglerDirective`, atadas a `AdminSidenavHelperService` del layout admin. Migrarlos
de verdad requeriría mover también esos servicios de feature a `core/`, un cambio mucho más
grande que toca toda la feature de auth/layout — evaluado y descartado por ahora, ver informe de
falencias punto 9.

### 3.2 `pages/full-pages/` (ex `system/`)

```
pages/full-pages/system-keys.config.ts   config compartido entre auth y layout
pages/full-pages/auth/services/          AuthService, LoginService
pages/full-pages/auth/guards/            auth.guard.ts, login.guard.ts
pages/full-pages/auth/components/        auth-layout, login, signin
pages/full-pages/layout/guards/          admin-guard, dummy-guard, route-guard
pages/full-pages/layout/services/        UserService, AdminService (ex admin.service),
                                          RouteTrackerService, NavigationService, ThemeService,
                                          LayoutService, AdminSidenavHelperService
pages/full-pages/layout/components/      header-top, sidebar-top, sidenav, start-menu,
                                          session-end-dialog, notifications, admin-layout, desktop,
                                          alt-user-dialog (cambiar de usuario a una cuenta
                                          "alterna" que el propio backend asocia al usuario)
pages/full-pages/layout/interfaces/      layout-conf, menu-item, shortcut, theme
pages/full-pages/errors/                 ErrorsModule — página de error de pantalla completa
                                          (404/500/503/genérico), ver §6
```

Los guards **reales** de la aplicación siguen viviendo acá (ex `system/admin`, `system/session`),
no en `core/guards` (que sigue vacío) — ver arriba (§3.1) por qué no se movieron. Los
interceptors sí se migraron a `core/interceptors/` (2026-07-31, ver §3.1).

De los tres guards en `layout/guards/`, solo `AuthGuard` (en `auth/guards/`) está efectivamente
conectado a rutas hoy — `AdminGuard` y `DummyGuard` existen como clases y están registrados como
`providers` en `layout.module.ts`, pero ningún routing module los usa en `canActivate` (ver
informe de falencias, punto 20).

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

`SharedModule` (`shared.module.ts`) se importa desde 112 módulos de negocio distintos, la
mayoría lazy-loaded. Los servicios que declara en `providers` (`TblPickerDialogService`,
`SecPickerDialog2Service`, `InFormDialogService`, `ClientSummaryService`) no usan
`providedIn: 'root'`, así que cada módulo lazy que importa `SharedModule` obtiene su propia
instancia de cada uno — no son singletons a nivel aplicación aunque puedan parecerlo por el
nombre (ver informe de falencias, punto 26).

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
| `basenegativa/` | 6 | único módulo con un componente en `ChangeDetectionStrategy.OnPush` |
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
es simétrico (AES-CBC vía `CypherService`, con un IV fijo — no aleatorio por mensaje — para todo
el proyecto), no HTTPS-only con token bearer estándar. Ese mismo secreto de módulo, por ser usado
para cifrar desde el propio navegador, viaja necesariamente dentro del bundle JS servido a
cualquier visitante (ver informe de falencias, puntos 2, 16 y 17, para el análisis de las
implicancias de seguridad de este diseño).

`RESTService`/`WinderService` no implementan `timeout()`, `retry()` ni un `catchError` central:
cada `Mod*Service` propaga el `Observable` de `HttpClient` tal cual, y la gran mayoría de los
`.subscribe()` en componentes no define un segundo callback de error (ver informe de falencias,
punto 24, para el conteo y el impacto en UX).

## 5. Sesión y autenticación

El login real de la aplicación combina dos mecanismos independientes que no se validan entre sí:

```
1. Identidad de usuario (frontend, contra Google):
   AuthService (pages/full-pages/auth) configura angular-oauth2-oidc contra
   accounts.google.com y dispara OAuth2 Implicit Flow (initImplicitFlow()). Google redirige
   de vuelta con el id_token en el fragmento de la URL; AuthService lo decodifica
   (base64 + JSON.parse del payload, SIN verificar la firma) para obtener el email.

2. Sesión de aplicación (backend Winder, protocolo propio):
   LoginService.onLogin() toma ese email y llama ModSysLoginService.login(email) — que manda
   únicamente {email, alt: 0} cifrado con Winder-Params. El id_token de Google NUNCA se envía
   al backend. Lo único que el backend puede verificar de esa petición es que fue cifrada con
   el secreto correcto del módulo "session" (ver §4) — no hay ninguna prueba criptográfica de
   que el email realmente vino de una sesión de Google válida.

3. AltUserDialogComponent permite "iniciar sesión como" una cuenta de la lista `alternates` que
   el propio backend devuelve asociada al usuario ya logueado (LoginService.onAltLogin() →
   ModSysLoginService.alt_login(email), mismo mecanismo que el paso 2 con alt:1).

4. TokenService (core/services) — mantiene un timer client-side (updateToken()) que dispara el
   diálogo de "sesión expirada" (SessionEndDialogComponent vía AdminService), pero no es un
   token validado por el backend en cada request: el header Authorization que existía para eso
   está comentado (código muerto) tanto en TokenInterceptor como en WinderService.init().

5. Guards de ruta: auth.guard / login.guard (pages/full-pages/auth/guards) protegen la shell
   autenticada / la pantalla de login comprobando solo authService.isLoged (si hay algo en
   localStorage bajo la key de auth response), sin re-validar contra el backend en cada
   navegación. AdminGuard y DummyGuard (pages/full-pages/layout/guards) existen pero no están
   conectados a ninguna ruta (ver §3.2).
```

Ver `doc/informe-falencias-mejoras.md` punto 16 para el análisis completo de las implicancias de
seguridad de este diseño (en resumen: la única barrera real contra un cliente hostil es la
posesión del secreto del módulo `session`, que por diseño está expuesto en el bundle JS de
cualquier usuario).

## 6. Enrutamiento

63 archivos usan `loadChildren` (lazy loading) sobre 337 módulos totales — la mayoría del árbol
de reportes se carga bajo demanda por dominio. `rda-administracion-routing.module.ts` es, por
lejos, el routing module más grande del repo.

**Página de error (2026-07-31):** `app-routing.module.ts` agrega `path: 'error'` (lazy, apunta a
`ErrorsModule`) y un wildcard `path: '**'` al final de la tabla de rutas (redirige a
`error/404`) — antes no existía ningún catch-all, así que una URL sin match simplemente no
renderizaba nada. `ErrorsModule` declara su propia ruta `:code` →
`ErrorPageComponent`, que resuelve el contenido (ícono/título/mensaje) según el código —
`404`, `503` y cualquier `5xx` tienen mensaje propio, cualquier otro código cae en un mensaje
genérico (`ErrorContentService` en `errors/services/`, interfaz `ErrorContent` en
`errors/interfaces/` — siguiendo la misma convención de `layout/interfaces` y `layout/services`).
Ninguna de las dos rutas (`error`, `**`) está detrás de
`AuthGuard`, a propósito: tienen que poder mostrarse aunque el usuario no esté logueado (ej. un
500 durante el login mismo). Visualmente usa la mascota de marca (`assets/images/fc/avatars/mis_error.png`,
la misma familia de avatares que `stg-app-loader`/`session-loader`) dentro de una tarjeta
centrada, con degradé de fondo `$blue-base` (`#1d396e`, el mismo azul del login/loader) hacia
el primary del tema Material activo (`#0064ff`) — así la página de error queda dentro de la
misma identidad visual en vez de un genérico gris. `HttpErrorService` (`core/services/`, ver §4) navega ahí para
errores "severos" (404 o cualquier 5xx del backend Ant) en vez de mostrar el diálogo liviano —
ver informe de falencias punto 24.

## 7. Testing y tooling

- Test runner: Karma + Jasmine, con `karma-coverage` configurado pero 28 archivos `.spec.ts`
  contra 934 `.ts` de producción.
- Lint: `tslint.json` (TSLint, deprecado por el equipo de Angular desde fines de 2020).
- `tsconfig.json` no tiene `"strict": true`.
- E2E: `protractor` está en `devDependencies` pero deprecado desde 2023 y sin usos de e2e
  detectados en el repo.

## 8. Rendimiento y patrones Angular

- **Change detection:** de 247 `@Component` detectados, solo 1
  (`modules/basenegativa/buscador/buscador.component.ts`) usa
  `ChangeDetectionStrategy.OnPush` — el resto corre con la estrategia por defecto (chequeo
  completo del árbol en cada evento de zone.js).
- **Listas:** 288 `*ngFor` en 110 templates; `trackBy` se usa una sola vez en todo el repo. Los
  4 componentes de tabla compartidos (`stg-table`, `stg-table2/3/4`, ver §3.3) no lo usan, así
  que cada refresh de una tabla de reporte recrea el DOM completo de sus filas.
- **RxJS:** 631 llamadas `.subscribe()` en 180 archivos; 92 componentes implementan
  `ngOnDestroy` y 52 usan `takeUntil`. Los componentes core de layout (sidebar, header,
  admin-layout) limpian sus suscripciones correctamente; la disciplina es más despareja en la
  familia de componentes de reportes (`report-cra-v*`/`report-crs-v*`) y en los servicios de
  `SharedModule` (ver §3.3) — ningún `Subject`/`BehaviorSubject` de la app se completa
  explícitamente en ningún lado.

Ver `doc/informe-falencias-mejoras.md` puntos 24-26 para el detalle y las rutas de fix
sugeridas.

## 9. Nota sobre el historial de git

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
