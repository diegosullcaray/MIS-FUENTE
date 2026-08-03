# Plan de migración Angular 14 → 15

Este documento complementa `doc/informe-falencias-mejoras.md` (puntos 14 y 19, que señalan la
necesidad de actualizar Angular) con un plan concreto para el primer salto de versión
(14.2.5 → 15.x), incluyendo qué dependencias de terceros bloquean o no el salto, y qué parte
del código propio conviene revisar/probar primero por ser la de mayor riesgo de romperse
silenciosamente (sin error de compilación, solo visual).

Todo lo que sigue es **análisis únicamente** — no se tocó código de la app para este reporte,
salvo la verificación de versiones/peer-dependencies contra el registro público de npm (no se
pudo instalar nada ni levantar `ng update` real en este entorno por falta de `node_modules` y
de acceso de escritura a un registro).

## 1. Estado actual

| Paquete | Versión actual |
|---|---|
| `@angular/core` (y el resto de `@angular/*` first-party) | `^14.2.5` |
| `@angular/cdk` | `^14.2.4` |
| `@angular/material` | `^14.2.4` |
| `@angular/material-moment-adapter` | `^14.2.4` |
| `typescript` | `~4.6.4` |
| `zone.js` | `~0.11.4` |
| `rxjs` | `^6.6.7` |

Requisitos de Angular 15: TypeScript `~4.8.2 || ~4.9.3` (obligatorio, la app hoy está en 4.6.4,
por debajo del mínimo), Node.js `^14.20 || ^16.13 || >=18.10`, `zone.js` se actualiza solo con
`ng update`. `rxjs` 6.6.7 sigue siendo válido (Angular 15 acepta `^6.5.3 || ^7.4.0`), no es
obligatorio saltar a RxJS 7 en este paso.

## 2. El riesgo real no es Angular core — es Angular Material (MDC)

Este es, con diferencia, el punto que más esfuerzo de verificación va a pedir, y el motivo por
el que este reporte recomienda no tratar la actualización como un simple `ng update`.

**Angular Material 15 reemplaza la implementación interna de (casi) todos sus componentes por
Angular MDC (Material Design Components for Web).** Esto no es un cambio de API pública (los
selectores `<mat-menu>`, `<mat-list-item>`, `<mat-tab-group>`, etc. seguían llamándose igual),
sino un cambio de **la estructura DOM interna y de las clases CSS** que generan esos
componentes (ej. `.mat-menu-panel` pasa a convivir con/ser reemplazado por
`.mat-mdc-menu-panel`, `.mat-list-item` por `.mat-mdc-list-item`, etc.). Angular Material 15
sí ofrece una vía de transición (`MatLegacyMenuModule`, `MatLegacyListModule`, etc., bajo
`@angular/material/legacy-*`) que conserva el DOM/CSS viejo mientras se migra con calma — pero
hay que **elegirla explícitamente**, porque el import por defecto (`@angular/material/menu`,
`@angular/material/list`, etc.) pasa a ser la versión MDC nueva.

Por qué esto importa especialmente en este repo: durante esta misma sesión de trabajo se
construyó y ajustó bastante UI (header, sidebar, `ModuleSwitcherComponent`, `StgHoverMenuComponent`)
apoyándose en overrides CSS directos sobre clases internas de Material — exactamente el patrón
que un cambio a MDC puede romper **sin ningún error de build**, solo dejando de aplicarse
(un selector que ya no matchea nada no es un error, es un estilo que desaparece).

Grep exhaustivo de selectores que tocan clases internas de Material (no solo el
`::ng-deep` genérico, sino nombres de clase concretos como `.mat-menu-panel`, `.mat-list-item`,
`.mat-tab-label`, `.mat-icon-button`, `.mat-tab-header`, `.mat-drawer`, `.mat-card`,
`.mat-form-field`, `.mat-select`, `.mat-checkbox`, `.mat-radio`, `.mat-slide-toggle`,
`.mat-button-toggle`, `.mat-chip`, `.mat-tooltip`, `.mat-dialog`): **29 archivos** (más 26
archivos usando `::ng-deep` en general, con solape). Los más relevantes a revisar primero:

**Estilos globales (afectan a toda la app, auditar estos primero):**
- `src/assets/styles/scss/components/_menu.scss` — el override `.mat-menu-panel.full` del que
  depende directamente el panel del `ModuleSwitcherComponent` (agregado esta sesión).
- `src/assets/styles/scss/components/_stg-mat.scss`, `_stg-cwc.scss`, `_others.scss`, `_card.scss`
- `src/assets/styles/scss/main/_header.scss`, `_typography.scss`, `_scaffolding.scss`
- `src/assets/styles/scss/_legacy.scss`, `_page-layouts.scss`
- `src/assets/styles/scss/views/sessions/_sessions.scss`

**Componentes propios con override directo (scoped, pero igual de frágil):**
- `shared/components/module-switcher/module-switcher.component.scss`,
  `shared/components/stg-hover-menu/` (vía su selector `.fa-adj` + estructura `mat-menu`
  anidada) — construidos/tocados en esta misma sesión, sin haber sido probados contra MDC.
- `shared/components/stg-app-loader/`, `stg-basic-tree-sidenav/`, `stg-menu-filter/`,
  `stg-alert/`
- `pages/modules/analista/principal/principal.component.scss`
- `pages/modules/reportes/components/rep-sidenav/rep-sidenav.component.scss`
- `pages/full-pages/layout/components/session-end-dialog/session-end-dialog.component.scss`
- Familia de diálogos de detalle casi duplicados: `usabilidad_comercial/detalle/`,
  `usabilidad-comercial-m/detalle/`, `agro-mix/detalle/`, `agro-mix-d/detalle/` — como ya son
  casi copias exactas entre sí (ver punto 4 del informe de falencias), conviene revisarlos
  juntos y evaluar si de paso se consolidan.
- `pages/modules/reportes/repositorio/{ranking-comercial,cmg-cartera,cmg-cartera-m,det-mora}/`
- `pages/modules/corresponsales/{corresponsal,prospecto}/`
- `pages/modules/reportes/legacy/comercial/rda/sectorista/reva/`

**Recomendación concreta:** al correr `ng update @angular/material@15`, el propio schematic de
Angular pregunta/aplica automáticamente el cambio a los módulos "legacy" en el código que use
imports de Material — dejar que lo haga (usar `@angular/material/legacy-menu`,
`legacy-list`, `legacy-tabs`, etc. donde el schematic los detecte) para no romper nada de golpe,
y planificar la migración fuera de "legacy" como un trabajo aparte, módulo por módulo, empezando
por el header/sidebar (más nuevo y más frágil) y dejando para el final los ~50 archivos de
`reportes/legacy/` (que son deuda técnica de todos modos, punto 7 del informe).

## 3. `@angular/flex-layout`: cruza a Angular 15, pero es el final del camino

`@angular/flex-layout` está en `^14.0.0-beta.40` hoy. Es una librería que Angular deprecó y
archivó oficialmente en 2022 — **su última versión publicada jamás es
`15.0.0-beta.42`** (sigue en beta, y no hay ni habrá una versión para Angular 16 en adelante).
Peer dependencies de esa 15.0.0-beta.42: `@angular/core >=15.0.2`, `@angular/cdk >=15.0.0`,
`rxjs ^6.5.3 || ^7.4.0` — es decir, **sí es instalable y funcional para este salto puntual a
Angular 15**, pero es un callejón sin salida: cualquier salto posterior (15 → 16+) obliga a
haber reemplazado ya todo `fxLayout`/`fxFlex`/`fxLayoutAlign`/`fxLayoutGap`/`fxFill` por CSS
Grid/Flexbox planos (o Tailwind, si se adopta). Dado que `fxLayout`/`fxFlex` se usa de forma
extensiva en toda la app (todos los sidebars de módulo construidos esta sesión, por ejemplo),
esa migración de CSS es un esfuerzo considerable que conviene **empezar a presupuestar ahora**,
aunque no bloquee este salto puntual a Angular 15.

## 4. Compatibilidad verificada del resto de dependencias directas

Verificado contra `registry.npmjs.org` (peerDependencies reales de cada paquete, no solo el
`package.json` de este repo):

| Paquete | Versión actual | ¿Bloquea Angular 15? | Acción recomendada |
|---|---|---|---|
| `@angular/flex-layout` | `14.0.0-beta.40` | No (ver §3) | Subir a `15.0.0-beta.42` — es la única versión que soporta Angular 15, y no habrá otra |
| `@asymmetrik/ngx-leaflet` | `^14.0.1` | No | Subir a `^15.0.1` (peer exacto: `@angular/core: 15`) |
| `ngx-scrollbar` | `^10.0.1` | Probablemente sí sin bump | Subir a `^12.0.0` (peer: `@angular/core >=15.0.0`) |
| `angular-oauth2-oidc` | `^10.0.3` | No (peer `>=8.0.0`, sin tope) | Ya compatible; opcional subir a `15.0.0` por si trae fixes, sin urgencia |
| `highcharts-angular` | `^2.10.0` | No (peer `>=6.0.0`, sin tope) | Ya compatible; probar visualmente los reportes con gráficos igual |
| `ng2-charts` | `^4.1.1` | No (peer `>=14.0.0`, sin tope) | Ya compatible; no requiere bump para llegar a 15 |
| `ngx-pagination` | `^5.0.0` | No (peer `>=13.0.0`, sin tope) | Ya compatible |
| `@rxweb/reactive-form-validators` | `^13.0.1` | Sin declarar (sin peerDependencies) | Es la versión más reciente que existe (paquete inactivo) — probar los formularios con validadores custom tras el bump, ya que no hay garantía formal de compatibilidad |
| `powerbi-client-angular` | `^3.0.5` | Sin declarar | Wrapper fino sobre el SDK JS de PowerBI, bajo riesgo, probar el/los reportes embebidos igual |

## 5. Orden de ejecución recomendado

1. **TypeScript primero, aislado.** Subir `typescript` de `~4.6.4` a `~4.8.2` (o `~4.9.3`) y
   confirmar que el proyecto sigue compilando en Angular 14 antes de tocar Angular — aísla
   cualquier error de tipos que sea puramente del compilador más estricto, del error que venga
   de Angular/Material en sí.
2. **`ng update @angular/core@15 @angular/cli@15`** — deja que el schematic oficial actualice
   `zone.js`, `tsconfig`, y aplique los `ng update` codemods automáticos (son la parte menos
   riesgosa del salto).
3. **`ng update @angular/cdk@15 @angular/material@15`**, aceptando/usando los imports
   `legacy-*` donde el schematic los proponga (ver §2) — **no** saltar este paso ni asumir que
   "si compila, está bien": la ruptura de MDC es visual/CSS, no de compilación.
4. Con la app arrancando en Angular 15 + Material 15 (modo legacy), **probar visualmente** en
   este orden de prioridad:
   - Header + sidebar + `ModuleSwitcherComponent` + `StgHoverMenuComponent` (lo más nuevo y lo
     más instrumentado con CSS custom de toda la sesión).
   - Los 4 sidebars de módulo (reportes, actividades, corresponsales, presupuesto).
   - Los diálogos de detalle casi-duplicados (`agro-mix*`, `usabilidad*comercial*`).
   - El resto de pantallas con override de Material listadas en §2.
5. Recién ahí, bumps de terceros de bajo riesgo confirmado: `@angular/flex-layout` →
   `15.0.0-beta.42`, `@asymmetrik/ngx-leaflet` → `^15.0.1`, `ngx-scrollbar` → `^12.0.0`.
6. Dejar `angular-oauth2-oidc`, `highcharts-angular`, `ng2-charts`, `ngx-pagination`,
   `@rxweb/reactive-form-validators`, `powerbi-client-angular` en su versión actual (ya
   compatible por peer-range) — solo actualizar si aparece un bug puntual, no por
   obligación de esta migración.
7. `npm install` real (no se pudo ejecutar en este entorno) para regenerar
   `package-lock.json` con el árbol de dependencias final, y correr la suite de tests /
   `ng serve` con QA manual antes de dar el salto por cerrado.

## 6. Lo que este salto **no** resuelve todavía

- Los CVE de `@angular/core`/`@angular/compiler` del punto 19 del informe de falencias sí
  quedan resueltos al llegar a 15 (dejan de aplicar, están parchados en versiones más
  recientes).
- La deuda de `@angular/flex-layout` (§3) sigue ahí, solo pateada un salto más.
- `reportes/legacy/` (157 archivos) sigue siendo el área de mayor riesgo/esfuerzo combinado,
  independientemente de la versión de Angular — conviene tratarlo como su propio proyecto,
  no como parte de este salto.
