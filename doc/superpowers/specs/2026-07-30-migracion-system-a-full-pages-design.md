# Migración de `src/app/system/` a `src/app/pages/full-pages/{auth,layout}/`

## Contexto

`src/app/system/` es el shell de la aplicación: `system/session/` (autenticación: login,
signin, guards de sesión) y `system/admin/` (layout de la app ya autenticada: header, sidebar,
desktop, guards de admin, interceptor de token). El usuario pidió reorganizarlo en
`src/app/pages/full-pages/`, separado en módulos (`auth/`, `layout/`) donde cada uno tenga sus
propios `components/`, `services/`, `interfaces/` (y, según se acordó en el diseño,
`guards/`/`interceptors/`/`directives/` propios también), sin romper nada del comportamiento
actual. `src/app/pages/full-pages/` no existe hoy (carpeta nueva).

Se investigó con un agente Explore el contenido completo de `system/session/` y `system/admin/`
(33 archivos .ts) más los 3 archivos "pegamento" a nivel de `system/`
(`system.module.ts`, `system-components.ts`, `system-keys.config.ts`). Un grep aparte confirmó
**156 archivos en el resto del repo** que importan algo desde `system/` — el shell es consumido
transversalmente por casi todos los módulos de negocio (a través de guards de ruta, `AuthGuard`,
servicios de usuario, etc.), así que esta migración tiene blast radius alto y debe verificarse con
build completo, no solo grep.

## Estructura destino

```
src/app/pages/full-pages/
├── system-keys.config.ts          (copia literal, compartido por ambos módulos)
├── auth/
│   ├── auth.module.ts
│   ├── components/
│   │   ├── auth-layout/auth-layout.component.ts
│   │   ├── login/login.component.ts
│   │   └── signin/signin.component.ts
│   ├── services/
│   │   └── login.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── login.guard.ts
│   ├── interceptors/               (vacía — session/ no tenía interceptors propios)
│   └── interfaces/                 (vacía — session/ no declara tipos propios, todo `any`)
└── layout/
    ├── layout.module.ts
    ├── components/
    │   ├── admin-layout/admin-layout.component.ts
    │   ├── desktop/desktop.component.ts
    │   ├── header-top/header-top.component.ts
    │   ├── sidebar-top/sidebar-top.component.ts
    │   ├── sidenav/sidenav.component.ts
    │   ├── start-menu/start-menu.component.ts
    │   ├── notifications/notifications.component.ts
    │   ├── ad-dialog/ad-dialog.component.ts
    │   ├── alt-user-dialog/alt-user-dialog.component.ts
    │   └── session-end-dialog/session-end-dialog.component.ts
    ├── services/
    │   ├── admin.service.ts
    │   ├── layout.service.ts
    │   ├── theme.service.ts
    │   ├── navigation.service.ts
    │   ├── route-tracker.service.ts
    │   ├── user.service.ts
    │   └── admin-sidenav-helper.service.ts
    ├── guards/
    │   ├── admin-guard.guard.ts
    │   ├── dummy-guard.guard.ts
    │   └── route-guard.guard.ts
    ├── interceptors/
    │   └── token.interceptor.ts    (renombrado desde TokenInterceptor.ts, misma clase/lógica)
    ├── directives/
    │   ├── admin-directives.module.ts
    │   ├── admin-side-nav-toggle.directive.ts
    │   ├── admin-sidenav-helper.directive.ts
    │   └── admin-highlight.directive.ts   (se migra tal cual: sigue 100% comentado, no se reactiva ni se borra)
    └── interfaces/
        ├── layout-conf.interface.ts       (ILayoutConf, ILayoutChangeOptions, IAdjustScreenOptions)
        ├── menu-item.interface.ts         (IMenuItem, IChildItem)
        ├── shortcut.interface.ts          (IShortcut, IBadge)
        └── theme.interface.ts             (ITheme)
```

## Mapeo completo de archivos (origen → destino)

### → `auth/`

| Origen (`src/app/system/...`) | Destino (`src/app/pages/full-pages/auth/...`) |
|---|---|
| `session/authentication/auth.guard.ts` | `guards/auth.guard.ts` |
| `session/authentication/auth.service.ts` | `services/auth.service.ts` — nota: no estaba en la lista original de "services" del árbol de arriba porque providedIn:'root'; igual vive en `services/` |
| `session/authentication/gmail.config.ts` | `services/gmail.config.ts` (config de OAuth, vive junto a auth.service que la consume) |
| `session/guards/login.guard.ts` | `guards/login.guard.ts` |
| `session/session-routing.module.ts` | `auth-routing.module.ts` (se mantiene como archivo de rutas propio, mismo patrón que hoy, solo renombrado de `SessionRoutes` a `AuthRoutes`) |
| `session/session.module.ts` | se disuelve en `auth.module.ts` |
| `session/views/auth-layout/auth-layout.component.ts(.html)` | `components/auth-layout/` |
| `session/views/login/login.component.ts(.html/.scss)` | `components/login/` |
| `session/views/login/login.service.ts` | `services/login.service.ts` |
| `session/views/signin/signin.component.ts(.html/.scss)` | `components/signin/` |

### → `layout/`

| Origen (`src/app/system/admin/...`) | Destino (`src/app/pages/full-pages/layout/...`) |
|---|---|
| `components/ad-dialog/*` | `components/ad-dialog/` |
| `components/alt-user-dialog/*` | `components/alt-user-dialog/` |
| `components/header-top/*` | `components/header-top/` |
| `components/notifications/*` | `components/notifications/` |
| `components/session-end-dialog/*` | `components/session-end-dialog/` |
| `components/sidebar-top/*` | `components/sidebar-top/` |
| `components/sidenav/*` | `components/sidenav/` |
| `components/start-menu/*` | `components/start-menu/` |
| `directives/admin-directives.module.ts` | `directives/admin-directives.module.ts` |
| `directives/admin-highlight.directive.ts` | `directives/admin-highlight.directive.ts` |
| `directives/admin-side-nav-toggle.directive.ts` | `directives/admin-side-nav-toggle.directive.ts` |
| `directives/admin-sidenav-helper/admin-sidenav-helper.directive.ts` | `directives/admin-sidenav-helper.directive.ts` |
| `directives/admin-sidenav-helper/admin-sidenav-helper.service.ts` | `services/admin-sidenav-helper.service.ts` |
| `guards/admin-guard.guard.ts` | `guards/admin-guard.guard.ts` |
| `guards/dummy-guard.guard.ts` | `guards/dummy-guard.guard.ts` |
| `guards/route-guard.guard.ts` | `guards/route-guard.guard.ts` |
| `interceptors/http-interceptors.ts` | `interceptors/http-interceptors.ts` (barrel) |
| `interceptors/repository/TokenInterceptor.ts` | `interceptors/token.interceptor.ts` |
| `services/admin.service.ts` | `services/admin.service.ts` |
| `services/layout.service.ts` | `services/layout.service.ts` (+ extrae `ILayoutConf`/`ILayoutChangeOptions`/`IAdjustScreenOptions` a `interfaces/layout-conf.interface.ts`) |
| `services/navigation.service.ts` | `services/navigation.service.ts` (+ extrae `IMenuItem`/`IChildItem` a `interfaces/menu-item.interface.ts`, `IShortcut`/`IBadge` a `interfaces/shortcut.interface.ts`) |
| `services/route-tracker.service.ts` | `services/route-tracker.service.ts` |
| `services/theme.service.ts` | `services/theme.service.ts` (+ extrae `ITheme` a `interfaces/theme.interface.ts`) |
| `services/user.service.ts` | `services/user.service.ts` |
| `views/admin-layout/*` | `components/admin-layout/` |
| `views/desktop/*` | `components/desktop/` |

### Archivos "pegamento" a nivel `system/`

| Origen | Destino |
|---|---|
| `system-keys.config.ts` | `pages/full-pages/system-keys.config.ts` (copia literal, sin cambios de contenido) |
| `system.module.ts` | se disuelve: providers de sesión → `auth.module.ts`; providers de admin → `layout.module.ts` |
| `system-components.ts` | se disuelve: `LoginComponent`/`AuthLayoutComponent`/`LoginService` → `auth.module.ts`; el resto → `layout.module.ts` |

## Decisiones de diseño (ya validadas con el usuario)

1. **División en dos módulos**, `auth/` (de `session/`) y `layout/` (de `admin/`), no un único módulo `system/`.
2. **Carpetas propias `guards/` e `interceptors/`** además de `components/services/interfaces` — no se fuerzan guards/interceptors dentro de `services/`.
3. **Carpeta propia `directives/`** en `layout/` (único módulo con directivas) — no se mezclan con `components/`.
4. **Extracción de interfaces inline**: los 8 tipos declarados inline en `layout.service.ts`, `navigation.service.ts` y `theme.service.ts` se extraen a archivos propios en `interfaces/`. `session/` no tiene tipos propios que extraer (todo `any`).
5. **`auth/` queda como un solo módulo eager**, igual que `layout/`. Hoy `session/signin` carga lazy (`loadChildren`) mientras `login`/`auth-layout` cargan eager vía `SystemComponentsModule` — esa inconsistencia se resuelve consolidando todo como eager. Es un cambio menor de bundle-splitting (signin deja de ser su propio chunk), no de funcionalidad.
6. **`system-keys.config.ts` queda como archivo compartido dentro de `pages/full-pages/`** (hermano de `auth/`/`layout/`), no se mueve a `core/`.
7. **El acoplamiento bidireccional auth ⇄ layout se preserva tal cual** (8 imports admin→session, 2 session→admin, todos alrededor de `AuthService`/`UserService`/`NavigationService`/`LoginService`), como imports directos por ruta absoluta entre los dos módulos nuevos. No se resuelve la dependencia circular de módulos — eso sería un refactor de arquitectura fuera de alcance. Ambos módulos son eager e importados directo en `AppModule`, así que no hay riesgo de instancias duplicadas por scoping de lazy-loading.

## Explícitamente fuera de alcance (se preserva tal cual, solo se mueve el archivo)

- Todo el código muerto comentado en los 33 archivos (bloques grandes en `auth.service.ts`,
  `signin.component.ts`, `admin-highlight.directive.ts` completo, etc.) — no se borra ni se
  reactiva, solo viaja con el archivo.
- El allowlist de emails hardcodeados en `dummy-guard.guard.ts`.
- El override de `environment.devUser` en `user.service.ts`.
- El TODO sin resolver en `auth.service.ts` ("Remember current URL").
- La inconsistencia de que `route-guard.guard.ts` inyecta `AuthService` pero no lo usa en el
  método — se mueve tal cual, no se limpia el import.

Ninguna limpieza de código entra en esta tarea — es puramente estructural/de movimiento. Si el
usuario quiere limpiar algo de esto después, es trabajo aparte (ver patrón ya usado en el repo de
separar "mover/reorganizar" de "limpiar código muerto").

## Wiring a actualizar fuera de `system/`

- `src/app/app.module.ts`: reemplazar `SystemModule` por `AuthModule` + `LayoutModule`; mover los
  imports de `httpInterceptorProviders` y `RouteTrackerService` a las rutas nuevas.
- `src/app/app-routing.module.ts`: las rutas que hoy importan de `./system/...` (7 imports: 
  `AdminLayoutComponent`, `AuthGuard`, `LoginGuard`, `AuthLayoutComponent`, `LoginComponent`,
  `DesktopComponent`, `RouteGuard`) pasan a `./pages/full-pages/layout/...` /
  `./pages/full-pages/auth/...`; el `loadChildren` de `session.module` pasa a apuntar (o se
  pliega, según decisión 5) al nuevo `auth.module`.
- **Los 156 archivos restantes** que importan algo de `app/system/...` en todo `src/` (guards de
  ruta en módulos de negocio, `AuthService`/`UserService` importados puntualmente, etc.) se
  actualizan con un barrido de rutas de import. No quedan reexports ni shims en la ruta vieja
  `system/` — la carpeta se borra por completo al final.

## Plan de verificación

1. Migrar `auth/` primero (menos dependido por el resto del repo), correr `npm run build` +
   suite de tests.
2. Migrar `layout/` después (depende más de `auth/` que al revés), correr build + tests de nuevo.
3. Actualizar wiring (`app.module.ts`, `app-routing.module.ts`) y barrer los 156 imports externos
   restantes, en lotes por dominio si hace falta.
4. Build + suite completa una vez más al final.
5. `grep -r "app/system/" src` y `grep -r "from ['\"]\.\./\.\./\.\./system` (o equivalentes con
   rutas relativas) → cero resultados antes de borrar `src/app/system/` completo.
6. Confirmar visualmente (o con el usuario) que login/signin/logout y la navegación del layout
   (sidebar, header, desktop) siguen funcionando — el build en verde no prueba comportamiento en
   runtime, solo compila.

## Riesgos conocidos

- Blast radius alto (156 archivos externos) — un import mal actualizado rompe compilación en un
  módulo de negocio no relacionado con auth/layout.
- El acoplamiento bidireccional auth ⇄ layout significa que un error en el orden de migración
  (mover `layout/` antes que `auth/`) deja imports rotos temporalmente — se sigue el orden
  auth→layout del plan de verificación para minimizar esto.
- `LoginService`/`ThemeService`/`NavigationService` no son `providedIn:'root'` — si por error se
  registran en dos módulos a la vez (o se pierde el registro en el módulo nuevo), Angular no
  lanza error de compilación, falla en runtime con "No provider for X". Verificar explícitamente
  que cada uno de estos tres quede registrado exactamente en el `providers` de su módulo nuevo.
