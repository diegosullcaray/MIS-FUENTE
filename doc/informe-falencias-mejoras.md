# Informe de falencias y oportunidades de mejora — MIS-FUENTE

> Basado en el estado real de `main` (commit `f0ca213`, 2026-07-30), actualizado sobre la
> versión anterior de este informe (commit `3c7f132`) tras verificar con CodeGraph los commits
> posteriores. Complementa `doc/arquitectura.md`.
>
> **Actualización 2026-07-31 (commit `f707bbc`):** segunda pasada de análisis, con foco en
> seguridad y funcionalidad/rendimiento, hecha con CodeGraph (exploración propia + 4 subagentes
> en paralelo, cada uno auditando un dominio distinto) y verificación manual línea por línea de
> los hallazgos antes de documentarlos. Son los puntos 16-26. No se tocó código en esta pasada
> — es solo hallazgos y documentación, igual que el punto 3 de la pasada anterior.

## Seguridad

1. **✅ RESUELTO (2026-07-30).** `eval()` sobre datos que vienen del backend, en 6 archivos activos.
   - `modules/corresponsales/prospecto/prospecto.component.ts:343,408`
   - `modules/Kaypacha3/kaypacha3.component.ts:73,74,76,77`
   - `modules/ranking-k/detallek/detallek.component.ts:58`
   - `modules/ranking-k/principal/principal.component.ts:47`
   - `modules/reasignacion-cart-cap/detalle/detalle.component.ts:58`
   - `modules/reportes/repositorio/seguro-pasivos-graf/seguro-pasivo-graf.component.ts:270,278,336,344`

   Todos ejecutaban `eval()` sobre strings JSON devueltos por el backend (`r.list[0].JSONLIST`,
   `r.cab1[0].JSONNHEAD1`, etc.) en vez de `JSON.parse`. Si el backend o cualquier capa
   intermedia queda comprometida, es ejecución de código arbitrario en el cliente. Se
   reemplazaron los 5 archivos que seguían activos en `src/app/` por `JSON.parse` (verificado con
   `tsc --noEmit`, sin errores nuevos).
   - Nota (verificado con CodeGraph al implementar): el 6to archivo listado originalmente,
     `modules/reasignacion-cart-cap/detalle/detalle.component.ts:58`, ya no vive en
     `src/app/modules/` — está en `backups/modules/reasignacion-cart-cap/` (movido en una
     limpieza previa, ver puntos 5/6) y nada bajo `src/` lo importa, por lo que no compila ni se
     sirve. No se tocó (es código muerto archivado, no "activo").
   - Nota: hay 2 usos más de `eval()` en el repo (`reasignacion-cart-cap/principal.component.ts`
     y `shared/pipes/dynamic-format-pipe.ts`) pero están comentados (código muerto), no
     ejecutan hoy. No se tocaron.

2. **🟡 PARCIALMENTE RESUELTO (2026-07-30).** Secretos de cifrado hardcodeados y commiteados en
   texto plano.
   `src/environments/environment.ts` (y `environment.prod.ts`) tenían `cypherSecret` y 7 claves
   más en `moduleSecrets` como strings hex literales, trackeados en git (no hay excepción en
   `.gitignore`). Cualquiera con acceso al repo (o su historial) tiene las claves de cifrado de
   producción. Un commit previo ("corrección de llaves secretas") sugiere que ya se intentó
   atender esto parcialmente, pero las claves seguían en el archivo.

   Se extrajeron los valores a `src/environments/environment.secrets.ts` (nuevo, agregado a
   `.gitignore`, mismos valores — no se rotó nada) y se dejó `environment.secrets.example.ts`
   commiteado como plantilla. `environment.ts`/`environment.prod.ts` ahora importan de ahí.
   **Pendiente, no hecho en esta sesión (requiere coordinación externa):**
   - No hay pipeline CI/CD en este repo (no se encontró `.github/workflows`, `Jenkinsfile`, etc.)
     — el build/deploy vive en un sistema externo. Ese sistema debe empezar a proveer
     `environment.secrets.ts` (o las env vars equivalentes) antes de cada `ng build`, o el build
     va a fallar por el import faltante. Esto no se puede verificar ni resolver desde el repo.
   - **Rotar las claves actuales sigue pendiente** — ya están expuestas en el historial de git
     aunque se hayan sacado del archivo actual, y rotarlas requiere coordinar con el backend
     (Winder/`ModSysLoginService` y afines usan estos mismos secretos del lado servidor).
   - Nota aparte detectada al revisar esto (no arreglada, fuera de alcance): `CypherService`
     (`src/app/core/services/cypher.service.ts:3`) importa `environments/environment.prod`
     directo en vez de `environments/environment`, así que siempre usa el secreto de prod
     independientemente del build. Vale la pena confirmarlo con quien mantiene ese servicio.
   - **Actualización 2026-07-31, importante — ver también el punto 16:** sacar las claves de git
     no resuelve el problema de fondo. Son secretos *usados por el cliente* (el navegador cifra
     cada request con ellos vía `CypherService`), así que **necesariamente viajan dentro del
     bundle JS servido a cualquier visitante** — cualquiera que abra las DevTools del sitio
     desplegado los puede extraer, tenga o no acceso al repo. La rotación sigue siendo necesaria,
     pero no alcanza: mientras el modelo siga siendo "secreto simétrico embebido en el cliente",
     cualquier nueva rotación queda expuesta de nuevo apenas se compila y despliega. Es un
     problema de diseño del protocolo Winder, no solo de higiene de repositorio.

3. **🟡 ANALIZADO (2026-07-30), sin cambios de código — decisión del usuario.** Adjunto del
   header `Authorization` deshabilitado (código muerto) en dos lugares clave.
   `pages/full-pages/layout/interceptors/token.interceptor.ts` (ex
   `system/admin/interceptors/repository/TokenInterceptor.ts`, movido en la migración a
   `pages/full-pages/`) y `core/data/remote/winder/winder.service.ts:64-68` tienen comentado el
   bloque que setea el
   header `Authorization`/adjunta el token a la request saliente. Hoy el interceptor solo llama
   `tokenService.updateToken()` como efecto secundario, sin adjuntar nada a la petición. Esto
   puede ser intencional (el backend valida por otra vía, p. ej. cookie de sesión) o puede ser
   una feature de seguridad a medio implementar y olvidada. Vale la pena confirmarlo con quien
   diseñó el protocolo Winder antes de tocarlo — no es un fix mecánico, es una pregunta de
   arquitectura de seguridad.

   **Análisis con CodeGraph (2026-07-30):** el mecanismo de autenticación real hoy no es un
   `Authorization` header sino el header `Winder-Params`, generado en
   `WinderService.winderConfig()` (`winder.service.ts:119-122`) cifrando con AES un payload que
   incluye `key: conn.secret` (el secreto por-módulo de `environment.moduleSecrets`, ver punto
   2). `TokenService`/`updateToken()` no es validado por el backend — es un temporizador
   client-side que solo dispara el diálogo de "sesión expirada" (`SessionEndDialogComponent`) vía
   `AdminService.openSessionEndDialog()`. Todo indica que el `Authorization` header comentado es
   un diseño anterior o alternativo, superado por el esquema de `Winder-Params` cifrado por
   módulo — no parece un bug de seguridad activo. El usuario decidió, con esta lectura, no tocar
   el código y dejarlo documentado (sigue sin confirmarse formalmente con quien diseñó el
   protocolo Winder si se necesita certeza total).

   **Actualización 2026-07-31:** el punto 16 (abajo) profundiza esto — no solo el header
   `Authorization` está muerto, sino que **nada** en el flujo real de login (Google OAuth →
   `ModSysLoginService.login()`) le prueba al backend que el usuario efectivamente pasó por
   Google. El único "candado" que ve el backend es el mismo secreto de módulo del punto 2.

16. **🔴 NUEVO (2026-07-31) — sin resolver, severidad alta.** El login no le prueba al backend
    que el usuario pasó por Google OAuth; el respaldo es solo posesión del secreto del módulo.

    Trazado con CodeGraph (`AuthService` → `LoginService` → `ModSysLoginService`,
    `src/app/pages/full-pages/auth/services/{auth,login}.service.ts` y
    `src/app/core/data/remote/instances/mod-sys-login.service.ts:22-38`): tras el login
    implícito contra Google (ver punto 21), el frontend decodifica el `id_token` **sin verificar
    su firma** (`auth.service.ts:78-82`, solo `base64` + `JSON.parse` del payload) y llama
    `ModSysLoginService.login(email)`, que arma un `Strand` con `{email, alt: 0}` y lo manda
    cifrado con `Winder-Params` — **el `id_token` nunca se envía al backend**, solo el string de
    email. `alt_login(email)` (usado por "iniciar sesión como otro usuario", gatillado desde
    `AltUserDialogComponent.actionPerformed()` sobre una lista `alternates` que sí viene del
    propio backend) tiene el mismo problema de fondo: solo manda `{email, alt: 1}`.

    El único elemento que el backend puede verificar en esa petición es que el payload
    `Winder-Params` haya sido cifrado con el secreto correcto (`environment.moduleSecrets.session`,
    ver punto 2). Como ese secreto **tiene que viajar en el bundle JS de cualquier usuario** para
    que el propio cliente pueda cifrar sus requests, no puede funcionar como prueba de identidad
    frente a un cliente hostil — cualquiera que lo extraiga de las DevTools (no hace falta acceso
    al repo) puede replicar el formato `Winder-Params` (visible en este mismo código fuente) y
    llamar a `login` con el `email` que quiera, sin pasar nunca por Google. Si el backend no hace
    ninguna validación adicional que no sea visible desde el frontend (no tenemos visibilidad del
    código del backend, así que esto no se puede confirmar al 100% desde el repo), esto es
    suplantación de identidad completa para cualquier email del sistema.

    Esto no es un hallazgo aislado: conecta directamente los puntos 2 y 3 ya documentados — la
    "solución" de sacar los secretos de git (punto 2) no cierra este vector porque el secreto
    siempre estuvo expuesto al cliente por diseño, y el `Authorization` header muerto (punto 3)
    nunca fue reemplazado por nada que pruebe identidad server-side. Esfuerzo de fix: alto (el
    backend tendría que empezar a verificar el `id_token` de Google — firma, `aud`, `exp` — en
    el endpoint `login`, lo cual es un cambio de protocolo, no solo de frontend). Bloqueado por
    negocio/backend: sí.

17. **🔴 NUEVO (2026-07-31) — sin resolver, severidad alta.** `CypherService` cifra con AES-CBC
    usando un IV fijo en cero para *toda* la aplicación.
    `src/app/core/services/cypher.service.ts:28` y `:40` — `CryptoJS.enc.Hex.parse('000...0')`
    como IV, tanto en `encrypt()` como en `decrypt()`, sin excepción y sin aleatoriedad. Este
    mismo método se usa para cifrar el header `Winder-Params` de cada petición al backend Winder
    y cada valor que `LocalStoreService` guarda en `localStorage` en producción (ver punto 22).

    Con CBC + IV fijo, dos plaintexts iguales (o con el mismo prefijo — como ocurre con params
    JSON que comparten estructura) producen los mismos primeros bloques de ciphertext. Esto
    filtra estructura y repetición a quien pueda observar tráfico o varias entradas guardadas en
    `localStorage` (patrones de longitud/prefijo), y en escenarios con algo de plaintext conocido
    facilita ataques de manipulación de bloques. Es una falla de diseño criptográfico real,
    independiente de si el secreto (punto 2) está o no expuesto — un IV fijo rompe una garantía
    de CBC aunque la clave fuera perfectamente secreta. Fix: usar un IV aleatorio por mensaje
    (prependido al ciphertext, patrón estándar de CryptoJS) — cambio acotado a `cypher.service.ts`
    pero requiere coordinar el mismo cambio en el backend que descifra estos payloads. Esfuerzo:
    medio. Bloqueado por negocio/backend: sí.

18. **✅ RESUELTO (2026-07-31), hallazgo principal — quedan pendientes los relacionados de menor
    severidad (ver abajo).** XSS almacenado vía `bypassSecurityTrustHtml` sobre datos del
    backend, usado en decenas de tablas de reportes.
    `src/app/shared/pipes/dynamic-format-pipe.ts` — los formatters `link`, `chip`, `icon`
    (2 variantes), `integer`/`decimal`/`percent` (con `link`/`link2`, 2 variantes en `percent`),
    `trafficlight` y `truncate` (con `link`) armaban el HTML por concatenación de strings con el
    valor de la celda y lo envolvían en `DomSanitizer.bypassSecurityTrustHtml(...)`,
    **desactivando el sanitizador de Angular**. Se consume vía
    `[innerHTML]="tr[td.key] | dynamicFormatPipe: ..."` en `stg-table2.component.html:32` (mismo
    patrón en `stg-table4`), y `tr[td.key]` viene sin escapar directo del backend.

    **Fix aplicado:** se sacaron los 8 `bypassSecurityTrustHtml(...)` y ahora cada método
    devuelve el string HTML plano — Angular sanitiza automáticamente cualquier binding
    `[innerHTML]` que no reciba un valor explícitamente marcado como confiable, así que no hace
    falta escapar a mano. Se agregó `dynamic-format-pipe.spec.ts` (20 tests, no existía ningún
    test de este pipe antes) siguiendo TDD: se escribió primero un test por método que pasa un
    payload `"><img src=x onerror=alert(1)>` como valor de celda y verifica, usando
    `DomSanitizer.sanitize(SecurityContext.HTML, ...)` (el mismo mecanismo que Angular corre
    internamente al resolver `[innerHTML]`), que el atributo `onerror` no sobrevive — se
    confirmó que los 3 tests correspondientes a `link`/`icon`/`truncate` fallaban contra el
    código viejo (RED) y pasan contra el fix (GREEN). El resto de tests son de caracterización
    (el formateo numérico/visual no cambió).

    Nota interesante que salió de correr los tests, no solo de leer el código: `chip`,
    `integer`, `decimal` y `percent` pasan el valor por `formatNumber(...)` **antes** de
    interpolarlo en el HTML — un string malicioso no numérico se convierte en `"NaN"` en ese
    paso, así que esos 4 formatters ya estaban protegidos de hecho contra el vector "string con
    HTML" (no por sanitización, sino porque el valor nunca llega a ser un string arbitrario).
    Los realmente explotables de forma directa eran `link`, `icon` y `truncate`, que manejan
    strings crudos sin coerción numérica. Se corrigieron los 8 de todas formas (mismo antipatrón,
    y depender de una coerción numérica incidental como única defensa es frágil).

    Verificación: `ng test` no corre completo en este repo por errores de TypeScript
    preexistentes sin relación con este cambio (`googlemaps` en tipos, un spec con `Title` mal
    tipado, `report-crs-v5` con mayúscula distinta al nombre real de la clase — ver nota al pie).
    Se verificó el spec nuevo de forma aislada (tsconfig y entry point temporales, borrados tras
    la verificación) corriendo Karma/Jasmine de verdad contra Chrome headless — no solo
    compilación. `tsc --noEmit` (sin scope, para ver el panorama completo) no muestra ningún
    error nuevo en `dynamic-format-pipe.ts` ni en sus consumidores (`stg-table2/3/4`,
    `categorizacion`, `mon-imr`, `stg-window-bar`); todos los errores que muestra son
    preexistentes y ajenos a este cambio (código archivado en `backups/`, `@types/ws`, y los
    mismos specs rotos de siempre).

    Hallazgos relacionados, menor severidad — **sin tocar, siguen pendientes** (mismo patrón
    pero fuera del componente central; se dejaron fuera de este fix para no ampliar el alcance
    sin evaluar cada uno por separado):
    - `categorizacion.component.ts:255` (`getCom`) hace lo mismo sobre `b.com`/`b.com2`
      (`categorizacion.component.html:109/111`). Hoy esos campos son constantes hardcodeadas en
      `ngOnInit`, pero `loadData()` (línea 154) mergea otros campos del backend en el mismo
      objeto — si el backend alguna vez agrega `com`/`com2` a la respuesta, se vuelve explotable
      sin cambiar una línea de frontend. Severidad: media, latente.
    - `mon-imr.service.ts:286-590` — mismo patrón con valores numéricos formateados del backend;
      severidad baja/media (no hay escape si el backend devolviera un string no numérico).
    - `stg-window-bar.component.ts:152/155` — mismo mecanismo pero sobre un `@Input` de
      configuración de UI de componentes padre, no fila de tabla. Severidad baja.

19. **🔴 NUEVO (2026-07-31) — sin resolver, severidad alta/crítica.** Dependencias con
    vulnerabilidades conocidas (CVE) — confirmado con `npm audit --omit=dev`, 16 vulnerabilidades
    (1 crítica, 14 altas, 1 moderada) sobre 102 paquetes de producción:
    - **`swiper` 8.4.7 — crítica.** Prototype pollution
      ([GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643)). Se usa en
      `ad-dialog.component.ts` (carrusel de anuncios). Fix disponible pero es breaking change
      (swiper 14).
    - **`@angular/core`/`@angular/compiler` 14.2.5 — altas, múltiples CVE de XSS**, entre ellos
      *"Angular has XSS Vulnerability via Unsanitized SVG Script Attributes"*,
      *"Template and Attribute Namespace Sanitization Bypass (XSS)"* y
      *"Two-Way Property Binding Sanitization Bypass (XSS)"*. Estas son vulnerabilidades en el
      **propio sanitizador de Angular** — relevantes independientemente de si se usa SSR o no
      (a diferencia de otros CVE de este mismo paquete, como los de `HttpTransferCache`, que
      requieren SSR y no aplican a esta app, que es SPA pura client-rendered). Refuerzan la
      necesidad de actualizar Angular (ya señalada en el punto 14) también desde el ángulo de
      seguridad, no solo de mantenibilidad.
    - **`uuid` &lt;11.1.1 — moderada.** Falta de chequeo de límites de buffer.
    - El resto de las 14 altas son paquetes `@angular/*` que dependen transitivamente de
      `@angular/core`/`@angular/compiler` vulnerables (`@angular/forms`, `@angular/material`,
      `@angular/router`, etc.) — no son CVEs independientes, se resuelven junto con la
      actualización de Angular.

    Nota sobre paquetes deprecados que no salieron en el audit pero valen la pena: `moment`
    (58 archivos lo importan, en modo mantenimiento desde 2020, recomendado migrar a
    `date-fns`/`luxon` a largo plazo), `protractor` (e2e, deprecado y descontinuado desde 2023,
    sin usos de e2e reales encontrados en el repo — candidato a remover directamente del
    `package.json`), `rxjs-compat` (usado en un solo archivo,
    `mon-ran-camp/principal/principal.util.ts`, peso extra en el bundle para un solo caso de
    RxJS 5). Esfuerzo del punto 19: alto para Angular (breaking, incremental por versión — ver
    punto 14), bajo para `uuid`, medio para `swiper` (evaluar si el carrusel de anuncios sigue en
    uso). Impacto: alto (son CVEs con explotación conocida, no hipótesis).

20. **🟠 NUEVO (2026-07-31) — sin resolver, severidad media.** Guards de autorización rotos o no
    conectados a ninguna ruta.
    - `AdminGuard` (`pages/full-pages/layout/guards/admin-guard.guard.ts:16-26`) — pese al
      nombre, no valida ningún rol: el chequeo es idéntico al de `AuthGuard`
      (`this.authService.isLoged`, sin distinción de admin/no-admin).
    - **Ni `AdminGuard` ni `DummyGuard` están enlazados a ninguna ruta.** Confirmado por
      búsqueda global de `canActivate` en todo `src/app`: ambos solo aparecen como `providers`
      en `layout.module.ts:54,56`, nunca en un array `canActivate` de ningún routing module. Toda
      la sección `/app` (`app-routing.module.ts:53`) queda protegida solo por login genérico —
      sin distinción de rol client-side para pantallas pensadas como administrativas. Si el
      backend Winder no re-valida el rol del lado servidor para esas acciones (algo que no
      podemos confirmar desde el frontend), cualquier usuario autenticado podría alcanzarlas
      navegando directo por URL.
    - `DummyGuard` (`dummy-guard.guard.ts:24`) autoriza comparando el email del usuario logueado
      contra dos direcciones de empleados hardcodeadas en el código (`victor.blas@confianza.pe`,
      `giovanni.calderon@confianza.pe`), embebidas en el bundle JS público — expone la identidad
      de personas con privilegios elevados a cualquiera que inspeccione el código compilado
      (riesgo de phishing dirigido), además de ser un antipatrón (autorización por identidad
      hardcodeada en el cliente en vez de rol validado server-side). Como no está enlazado a
      ninguna ruta, hoy es código muerto — pero sigue compilado y expuesto en el bundle.
    - `AuthGuard.obs()` (`auth.guard.ts:44-53`): el único chequeo de expiración de token está
      comentado, y el código comentado llama a un método que ni siquiera existe con ese nombre en
      `TokenService` (el real es `validateToken`, privado) — no compilaría si se descomentara tal
      cual. Evidencia adicional de que este camino quedó a medio hacer.

    Esfuerzo: bajo (son guards ya escritos, o bien conectarlos con roles reales, o borrar el
    código muerto de `DummyGuard`/emails hardcodeados). Impacto: medio-alto si en algún momento
    alguien conecta estos guards asumiendo que ya validan algo, sin revisar que no lo hacen.

21. **🟠 NUEVO (2026-07-31) — sin resolver, severidad media.** Login vía OAuth2 Implicit Flow,
    un flujo deprecado por el estándar de seguridad de OAuth 2.0 (RFC 9700 / OAuth 2.0 Security
    Best Current Practice) en favor de Authorization Code + PKCE.
    `auth.service.ts:182` llama `this.oauthService.initImplicitFlow()` — el `access_token`
    (y el `id_token`) vuelven en el fragmento de la URL (`#access_token=...`) tras el redirect de
    Google, en vez de un código de un solo uso intercambiado server-side. El fragmento de URL
    queda expuesto en el historial del navegador y en cualquier log que capture la URL completa
    (algunos proxies o extensiones de navegador sí lo hacen), y no hay forma de autenticar que la
    request de intercambio de token vino del cliente legítimo. Adicionalmente,
    `gmail.config.ts:21` tiene `strictDiscoveryDocumentValidation: false`, desactivando una
    validación de hardening del documento de descubrimiento OIDC de Google. La librería
    (`angular-oauth2-oidc`) sí soporta Authorization Code + PKCE (`initCodeFlow()`); migrar es un
    cambio contenido a `auth.service.ts` y `gmail.config.ts`, pero requiere registrar el nuevo
    flujo en la consola de Google Cloud del proyecto. Esfuerzo: medio. Bloqueado por negocio: no,
    pero requiere acceso a la configuración OAuth en Google Cloud Console.

22. **🟠 NUEVO (2026-07-31) — sin resolver, severidad media.** Postura de cifrado inconsistente
    en el almacenamiento local del navegador.
    `LocalStoreService` (`core/data/local/local-store.service.ts:10,17-18,20,25,28-29`) cifra
    cada valor que guarda en `localStorage` (token, perfil, menú, respuesta de auth) **solo si
    `environment.production` es true**, usando `CypherService` (con el IV fijo del punto 17). El
    cifrado no aporta defensa real contra un XSS activo en la propia página (un script inyectado
    puede invocar el mismo `CypherService` — está en el mismo bundle — para descifrar lo que
    quiera), pero sí dificulta la lectura manual casual (DevTools → Application → Local Storage)
    y el copy-paste accidental de datos sensibles. Aparte, `StorageService`
    (`modules/reportes/legacy/support/services/storage.service.ts:10,15`, usado por
    `CacheService`) escribe directo a `localStorage` **sin cifrar**, cacheando datos jerárquicos
    internos (`cod_rel`, `tip_cod`, `jerar`) — inconsistente con el resto de la app, aunque el
    dato cacheado ahí parece menos sensible. Esfuerzo: bajo (alinear `StorageService` al mismo
    wrapper que `LocalStoreService`, o documentar por qué no hace falta). Impacto: bajo-medio.

23. **⚪ NUEVO (2026-07-31) — informativo/bajo.** Otros puntos menores relacionados a HTML/URL sin
    validar, sin evidencia de explotación activa hoy:
    - `desktop.component.ts:46` — `window.open(a.state, "_blank")` donde `a.state` viene del menú
      de shortcuts que devuelve el backend (`navigation.service.ts:56,74`), sin validar
      esquema/dominio — riesgo de open redirect o URI `javascript:` si el backend alguna vez
      devuelve un valor no confiable (ver punto 16 sobre qué tan confiable es "lo que dice el
      backend" si la autenticación de origen es débil).
    - `scroll-to.directive.ts:50,58` — `setTimeout("window.scrollTo(0, " + leapY + ")", ...)` usa
      un string como primer argumento (mismo mecanismo que `eval`), pero `leapY` es un número
      derivado de posiciones DOM, no de backend/usuario — mala práctica, no explotable hoy.
    - `ad-dialog.component.ts:22-24` (`goToLink`) llama `window.open(url)` sin validar, pero el
      template que lo invoca está comentado — código muerto hoy.
    - Sin hallazgos de `new Function(...)`, `document.write`, ni de renderers externos
      (Highcharts, PowerBI, Leaflet) inyectando HTML crudo de datos del backend.

## Duplicación estructural (deuda técnica)

4. **Cuatro generaciones de `stg-table` coexistiendo:** `stg-table`, `stg-table2`, `stg-table3`,
   `stg-table4` en `shared/components/`, todas presentes y (presumiblemente) todas con
   consumidores reales activos. Mantener 4 versions del mismo componente de tabla multiplica el
   costo de cualquier cambio transversal (formato, paginación, accesibilidad). Consolidar en una
   sola versión es la limpieza de mayor payback en `shared/`, pero requiere inventariar
   consumidores de cada una antes de tocar nada (no es un rename mecánico). **Actualización
   2026-07-31:** el punto 18 (XSS en `dynamic-format-pipe`) y el punto 25 (falta de `trackBy`)
   afectan directamente a estas 4 variantes — cualquier plan de consolidación debería resolver
   ambos en la versión final en vez de arrastrarlos.

5. **RESUELTO PARCIALMENTE (esta sesión): de los cuatro módulos `incentivos*`, tres se movieron
   a `backups/modules/`.** `incentivos-a/`, `incentivos2/` e `incentivos4/` ya no están en
   `modules/` — solo queda vivo `incentivos3/` con su `ModIncentivos3Service`. Esto no es lo
   mismo que haber resuelto H-08 con negocio (no se fusionó código, no se decidió cuál es la
   versión "correcta" a futuro): es sacar del árbol activo generaciones que no tenían ruta o
   consumidores cruzados, sin tocar la lógica de cálculo de incentivos. Sigue pendiente
   confirmar con negocio si `incentivos3` (y su campaña 2025/2026) es realmente la única
   vigente antes de dar el tema por cerrado.

6. **RESUELTO PARCIALMENTE (esta sesión): de las tres variantes de `kaypacha`, dos se movieron a
   `backups/modules/`.** `kaypacha/` y `Kaypacha2/` ya no están en `modules/` — solo queda vivo
   `Kaypacha3/`. Mismo comentario que el punto 5: es limpieza de árbol, no una decisión de
   negocio confirmada sobre cuál versión es la vigente a largo plazo.

7. **`modules/reportes/legacy/` con 157 archivos activos** (34% de `reportes/`). El nombre
   "legacy" ya declara la intención, pero sigue siendo 1 de cada 3 archivos de todo el árbol de
   reportes — la mayor bolsa de código a retirar o migrar del proyecto.

8. **119 archivos `*.util.ts` dispersos** por todo `modules/`, sin una capa de utilidades común
   más allá de los 2 recién centralizados en `core/helpers/`. Alta probabilidad de funciones
   equivalentes reimplementadas módulo a módulo (mismo patrón que ya se confirmó al mover
   `functions.util.ts` a core: se usaba en 192 puntos distintos).

## Organización / nombres

9. **✅ RESUELTO (2026-07-30), interceptors revisitado y migrado el 2026-07-31.**
   `core/guards/`, `core/interceptors/`, `core/interfaces/` seguían vacías tras la migración de
   `system/` a `pages/full-pages/`. El nombre de la carpeta prometía una capa que no existía —
   los guards e interceptors reales vivían en `pages/full-pages/layout/guards|interceptors` y
   `pages/full-pages/auth/guards`. Se optó por borrar las 3 carpetas vacías (cero archivos
   afectados, cero imports que actualizar) en vez de mover ahí la capa real: mover los
   guards/interceptors reales hubiera significado actualizar el import path en cada routing
   module que los consume, un esfuerzo bastante mayor al "Bajo" que sugería la tabla original.

   **Actualización 2026-07-31 — se migraron los interceptors, los guards se evaluaron y se
   quedaron donde estaban, con una razón más de fondo que el costo de actualizar imports.**
   Al revisar de nuevo la idea de poblar `core/`, apareció una distinción que la nota original no
   había hecho: no todo lo que vive bajo `guards|interceptors|directives` de `full-pages/` es
   igual de transversal.
   - `TokenInterceptor` y el módulo nuevo `HttpErrorInterceptor`/`HttpErrorService` (interceptor
     central de timeout + manejo de errores HTTP, ver punto 24) **no dependían de ningún
     servicio específico de la feature de auth/layout** — se migraron a `core/interceptors/` y
     `core/services/` sin fricción. De paso, mover `TokenInterceptor` permitió sacarle una
     dependencia a `AdminService` que ya estaba muerta (solo la usaba un bloque comentado) y que
     hubiera obligado a `core/` a importar de `pages/`.
   - `AuthGuard`, `AdminGuard`, `DummyGuard`, `RouteGuard`, `LoginGuard` y las directivas
     `AdminSidenavHelperDirective`/`AdminSidenavTogglerDirective` **sí dependen** de servicios de
     feature (`AuthService`, `UserService`, `AdminService`, `NavigationService`,
     `AdminSidenavHelperService`, todos en `pages/full-pages/{auth,layout}/services/`). Moverlos
     a `core/guards/` dejando esos servicios donde están invertiría la dirección de dependencia
     que `core/` debería tener — `core/` pasaría a importar de `pages/`, exactamente al revés de
     cómo debería ser. Es mover el archivo sin arreglar el problema real. La migración "completa
     y correcta" existe como opción — mover también esos servicios de feature a `core/` — pero es
     un cambio mucho más grande que toca toda la feature de auth/layout, evaluado y descartado
     por ahora (decisión del usuario, 2026-07-31: alcance acotado a lo genuinamente transversal).
   - Detalle técnico de la migración: `token.interceptor.ts` → `core/interceptors/`;
     `http-error.interceptor.ts` + `http-error.service.ts` (y sus specs) →
     `core/interceptors/` / `core/services/` respectivamente; el barrel `http-interceptors.ts`
     también se movió a `core/interceptors/`; `app.module.ts` actualizado al nuevo path.
     `pages/full-pages/layout/interceptors/` y `pages/full-pages/layout/errors/` quedaron vacías
     y se borraron (mismo criterio que la decisión original de este punto). Verificado con
     `tsc --noEmit` (sin errores nuevos) y corriendo los 9 tests de `http-error.*` desde su nueva
     ubicación (Karma/Jasmine real, no solo compilación).

10. **✅ RESUELTO / OBSOLETO — verificado con CodeGraph (2026-07-30), no requirió cambios.**
    `modules/shared/` (que este informe describía con 1 archivo: `modules-key.config.ts`) ya no
    existe en el repo. `modules-key.config.ts` no aparece en ningún lugar del código actual —
    todo indica que quedó resuelto junto con la creación de `system-keys.config.ts` compartido en
    `pages/full-pages/` (commit `896a664`), anterior a la revisión que originó este hallazgo. El
    hallazgo estaba desactualizado al momento de escribirse.

## Calidad de código y consistencia

11. **✅ RESUELTO (2026-07-30).** 165 archivos llamaban `console.log` directamente, sin pasar por
    el wrapper `printLog`/`debug.util.ts` que sí respeta `environment.production`. El wrapper
    existe precisamente para que no se filtren logs en build de producción, pero se usaba de
    forma inconsistente.

    Al recontar al momento de implementar, el número de archivos con al menos una llamada activa
    (no comentada) a `console.log/warn/error` en `src/app/` era 98 (los ~52 archivos restantes de
    los ~150 que matcheaban el grep solo tenían llamadas comentadas — código muerto, no tocado,
    mismo criterio que el punto 1). Se hizo el barrido mecánico con un script (no a mano):
    reemplazo de `console.log/warn/error/table` → `printLog/printWarn/printError/printTable` en
    llamadas activas, dejando intactas las comentadas, con inserción/fusión automática del
    import de `debug.util` en cada archivo. Verificado con `tsc --noEmit` antes y después del
    barrido (mismos 4 errores preexistentes en specs, ninguno nuevo). No se tocó `backups/`
    (código archivado, no compilado).

12. **`tsconfig.json` sin `"strict": true`.** Con TypeScript no estricto, buena parte de los
    934 archivos probablemente usan `any` implícito o explícito sin que el compilador avise.
    Activar `strict` de golpe en un proyecto de este tamaño generaría cientos de errores — si se
    persigue, es un esfuerzo incremental (activar sub-flags como `noImplicitAny` primero, módulo
    por módulo) no un flag-switch.

13. **`tslint.json` en vez de ESLint.** TSLint está deprecado desde 2020 y no recibe reglas
    nuevas; Angular 12+ recomienda `@angular-eslint`. Angular 14 (esta versión) todavía puede
    correr con TSLint, pero es tooling en modo mantenimiento sin roadmap.

14. **Angular 14.2.5 (2022).** Está varias versiones mayores detrás de la línea actual soportada
    por el equipo de Angular, lo que significa sin parches de seguridad ni mejoras de
    rendimiento recientes del framework. Actualizar un proyecto de este tamaño (337 módulos) es
    un esfuerzo mayor, mejor abordado en incrementos de 1 versión mayor a la vez con la suite de
    tests como red de seguridad — lo cual lleva al punto siguiente. **Actualización 2026-07-31:**
    el punto 19 confirma con `npm audit` que esto ya no es solo una preocupación de
    mantenibilidad — hay CVEs de XSS activos en el sanitizador de `@angular/core`/`compiler` de
    esta versión.

## Testing

15. **28 archivos `.spec.ts` contra 934 archivos de producción (~3%).** `karma-coverage` está
    configurado pero prácticamente no hay nada que medir. CodeGraph marca sistemáticamente
    servicios centrales (`WinderService`, `AuthService`, `TokenService`, `RESTService`,
    `StgAppConfirmService`, y en general todo lo tocado en este informe) como
    "⚠️ no covering tests found". Cualquier refactor de los puntos 4-8 (duplicación
    estructural) hoy se hace sin red de seguridad automatizada — hay que escribir tests de
    caracterización antes de tocar código compartido, no después.

## Rendimiento, resiliencia y patrones Angular

24. **🟡 PARCIALMENTE RESUELTO (2026-07-31).** ~91% de las llamadas a `.subscribe()` contra el
    backend no manejan errores, y no había timeout — un fallo o un backend colgado dejaba la UI
    esperando indefinidamente.
    Conteo exhaustivo (previo al fix): **631 llamadas `.subscribe()` en 180 archivos**, de las
    cuales solo **56 (en 11 archivos)** pasaban un callback de error. No había `catchError` en
    `RESTService.get/post` (`rest.service.ts:12-28`, wrapper directo de `HttpClient` sin ningún
    operador), ni `ErrorHandler` custom en `app.module.ts`, ni `timeout()`/`retry()` en ningún
    archivo del repo.

    **Fix aplicado — `core/interceptors/` + `core/services/` (interceptor/servicio) y
    `pages/full-pages/errors/` (página de error visual):**
    - `http-error.interceptor.ts` (`HttpErrorInterceptor`, `core/interceptors/`, exporta
      `HTTP_ERROR_TIMEOUT_MS = 30000`): envuelve toda request al dominio Ant (mismo scoping que
      `TokenInterceptor`, vía `environment.requestConfigRootURL`, para no interferir con las
      llamadas HTTP propias de `angular-oauth2-oidc`/Google) con
      `.pipe(timeout(30000), catchError(...))`. Registrado en `http-interceptors.ts` junto a
      `TokenInterceptor` (ambos migrados a `core/` el 2026-07-31, ver punto 9).
    - `http-error.service.ts` (`HttpErrorService`, `core/services/`, `providedIn: 'root'`): al
      recibir cualquier error (HTTP o timeout) de una request Ant, (1) cierra
      `StgAppLoaderService` — que es singleton a nivel app, así que esto cierra el loader sea
      cual sea el componente/servicio que lo haya abierto, sin necesidad de tocar los ~60 sitios
      que llaman `openLoader()/closeLoader()` (confirmado con grep: todos delegan en el mismo
      `StgAppLoaderService.open()/close()` inyectado como `this.loader`); (2) si el error es
      "severo" (`status === 404` o `status >= 500`), navega a `/error/{status}` — página de
      error de pantalla completa, ver abajo — en vez de mostrar el diálogo; para el resto
      (timeout, error de conexión/status 0, 4xx recuperables) muestra un mensaje genérico y
      seguro vía `StgAlertService` (nunca el detalle crudo del error); (3) en ambos casos sigue
      propagando el error original (`throwError(error)`) para que cualquier
      `.subscribe({ error: ... })` que ya exista en un componente puntual se siga ejecutando
      igual que antes — esto es aditivo, no reemplaza el manejo de error que algunos de los 56
      archivos ya tenían.
    - `pages/full-pages/errors/` (`ErrorsModule`, lazy vía `path: 'error'` en
      `app-routing.module.ts`): `ErrorPageComponent` + `ErrorContentService`
      (`errors/services/error-content.service.ts`, `providedIn: 'root'`) que mapea el código de
      la URL a ícono/título/mensaje (interfaz `ErrorContent` en
      `errors/interfaces/error-content.interface.ts`) — `404` y `503` tienen mensaje propio,
      cualquier otro `5xx` cae en el mensaje de "error del servidor", cualquier otro código en
      uno genérico. Sigue la misma convención de módulo que `layout/` (subcarpetas
      `interfaces/` y `services/` en vez de archivos sueltos junto al componente). No está
      detrás de `AuthGuard` a propósito — tiene que poder mostrarse sin sesión (ej. un 500
      durante el login). `app-routing.module.ts` también agrega un wildcard `path: '**'` (antes
      no existía ninguno — una URL sin match no renderizaba nada) que redirige a `error/404`.
      Verificado además visualmente: se levantó `ng serve` y se screenshoteó `/error/404`,
      `/error/500` y una ruta inexistente (confirma el redirect del wildcard) con Playwright
      headless — no solo tests, la página renderiza de verdad.
    - Tests: `http-error.service.spec.ts` (9), `http-error.interceptor.spec.ts` (4),
      `error-content.service.spec.ts` (7) y `error-page.component.spec.ts` (3) — 23 tests en total,
      hechos con TDD (RED confirmado antes de implementar cada pieza, verificado corriendo
      Karma/Jasmine real contra Chrome headless — `ng test` no corre completo en este repo por
      los errores de TS preexistentes ya documentados en el punto 18). `tsc --noEmit` sin
      errores nuevos en ninguna de las dos rondas.

    **Lo que este fix cubre:** cualquier request al backend Ant que falle o no responda dentro de
    30s ahora da feedback al usuario (diálogo o página completa según severidad) y cierra el
    loader compartido — la mayoría de los sitios listados abajo como "loader huérfano" quedan
    resueltos porque usan ese mismo `StgAppLoaderService`. Los errores 404/5xx ya no dejan al
    usuario mirando un diálogo genérico sobre una pantalla rota — lo sacan a una página que
    explica qué pasó y ofrece volver al inicio.

    **✅ RESUELTO (2026-08-03) — barrido de loaders locales.** Se hizo el barrido manual,
    sitio por sitio, que quedaba pendiente: cada flag de loading/spinner **local** (no el
    `StgAppLoaderService` compartido) que solo se reseteaba en el callback de éxito de un
    `.subscribe()` ahora usa `finalize()` (o un callback `error:` explícito cuando el reset
    necesitaba lógica propia, como en `becas.component.ts`/`priorizacion-leads.component.ts`,
    donde el reset empuja a un `Subject` compartido) para garantizar que el flag se apague
    también si la request falla o hace timeout. ~35 archivos en 11 grupos:
    `usuarios-base.component.ts` (reportes-e, framework-esg); `incentivos3.service.ts`
    (7 flags en `setDs()`); `detalle-base.component.ts`/`detalle2-base.component.ts` de
    incentivos3; 13 componentes de `reportes/repositorio/` con el patrón
    `loading`/`firstload` + `combineLatest([loadN...])` (zplantilla, cmg-cartera-m, imr,
    ranking-mujer, seguro-optativo, seguros-pasivos, tablero-digital-comercial,
    poblacion-misional, agenda-comercial, panel-misionales, panel-supervision,
    seguro-pasivos-graf, reasignado); 8 componentes con `loadingObs` atado a `stg-table`
    (dashboard-clientes, desempeno-social, segui-incentivos-sec, esg, comite,
    captacion-canal-comercial, captacion-canal-operacion, precosechas);
    `Kaypacha3/buscador/buscador.component.ts`; `mon-salidas.service.ts` y
    `mon-ran-camp.service.ts` (mismo patrón que `mon-imr.service.ts`, que ya estaba
    corregido); el modulo `analista` (principal, cliente, becas, priorizacion-leads);
    `reportes-e/principal/principal.component.ts`; `reporte-demo.component.ts`; y
    `presupuesto/gestion/*` (responsables, tablero-verificacion). Verificado contra el
    filesystem con el checker de imports (0 imports rotos nuevos) — no se pudo levantar
    `ng serve`/Karma en este entorno (falta `node_modules`) para probar en navegador.

    **Lo que NO cubre — sigue pendiente:**
    - Loader que no se cierra en el **camino de éxito** por un bug de lógica (no de manejo de
      error) — ej. `mon-salidas.service.ts`, si la respuesta es `null`. Esto no
      es un problema de HTTP error/timeout, así que ni el interceptor ni `finalize()` lo
      arreglan; es un bug de lógica de negocio aparte.
    - El timeout de 30s es un valor por defecto razonable para reportes pesados, pero no se
      ajustó por endpoint — si algún reporte específico legítimamente tarda más, va a cortar esa
      request también. Vale la pena revisarlo si aparece en producción.
    - El mensaje del diálogo (para errores no severos) sigue siendo genérico para todo 4xx
      recuperable (no diferencia 400/401/403/409) — suficiente para no dejar al usuario sin
      feedback, pero no tan específico como podría ser. La página de error completa sí
      diferencia 404 de 5xx.
    - Navegar a `/error/{status}` abandona la pantalla actual — para un 404/5xx eso es
      exactamente lo buscado (la pantalla ya no puede funcionar), pero significa que se pierde
      cualquier estado no guardado del formulario/filtros que el usuario tenía en pantalla. Es
      un trade-off consciente (decisión del usuario, 2026-07-31), no un descuido.

    Ejemplos concretos de "loader huérfano" que sí quedan cubiertos por el fix (mismo
    `StgAppLoaderService` compartido, confirmado):
    - `modules/framework-esg/usuarios/usuarios-base.component.ts:174-177` (`saveUsers`).
    - `modules/reportes-e/usuarios/usuarios-base.component.ts:164-167`, mismo patrón exacto.

25. **🟠 NUEVO (2026-07-31) — sin resolver, severidad media-alta.** Casi cero adopción de
    `ChangeDetectionStrategy.OnPush` y de `trackBy` en listas — cada evento dispara chequeo
    completo del árbol de componentes, y cada refresh de una tabla recrea el DOM entero de sus
    filas.
    - **OnPush:** de 247 `@Component` detectados, solo **1** lo usa
      (`modules/basenegativa/buscador/buscador.component.ts:16`, con comentario explícito del
      autor). &lt;1% de adopción.
    - **`trackBy`:** 288 `*ngFor` en 110 templates; `trackBy` se usa **una sola vez** en todo el
      repo (`crs-cli-act.component.html`). Los 4 componentes de tabla core carecen de `trackBy`
      en sus filas de datos: `stg-table2.component.html:27`, `stg-table3.component.html:17`,
      `stg-table4.component.html:35`, `stg-table.component.html:93` — al reusarse en decenas de
      reportes de `reportes/repositorio`, cada filtrado o refresh recrea el DOM completo de filas
      en vez de reconciliar por identidad.

    Esfuerzo: agregar `trackBy` a los 4 componentes de tabla core es bajo y cubre la mayoría del
    impacto real (la mayoría de reportes usa alguna de las 4 variantes). Migrar a `OnPush` de
    forma amplia es alto (exige disciplina de inmutabilidad transversal) — mejor abordarlo junto
    con la consolidación de `stg-table` del punto 4, no antes.

26. **🟠 NUEVO (2026-07-31) — sin resolver, severidad media.** Servicios de `SharedModule` sin
    `providedIn: 'root'` se reinstancian una vez por cada uno de los 112 módulos lazy que
    importan `SharedModule`, y ningún `Subject`/`BehaviorSubject` de la app se completa nunca.
    `shared.module.ts:95-100` declara `providers: [TblPickerDialogService, SecPickerDialog2Service,
    InFormDialogService, ClientSummaryService]` sin `providedIn: 'root'` en la clase. Como
    `SharedModule` se importa en 112 módulos distintos (la mayoría lazy, cada uno con su propio
    inyector), cada módulo lazy termina con su **propia copia** de estos servicios y de los
    `Subject`/`ReplaySubject` que exponen (`TblPickerDialogService.afterCloseEvent$`,
    `InFormDialogService.onSubmit$/onCancel$/onEvent$`, etc.). No es un memory leak clásico (no
    crecen sin límite dentro de un mismo módulo), pero sí un antipatrón de composición: dos
    partes de la app pueden creer que comparten el mismo diálogo/picker global y en realidad
    tienen instancias independientes, produciendo bugs de estado silenciosos y difíciles de
    reproducir. Grep de `.complete()` sobre `Subject`/`BehaviorSubject` en todo `src/app`: **0
    resultados** — confirma que ningún Subject de la app se cierra explícitamente en ningún lado
    (aceptable solo si todo fuera `providedIn: 'root'`, que no es el caso acá).

    Contraejemplo correcto ya en el repo: `Incentivos3Service`
    (`modules/incentivos3/incentivos3.service.ts:114-116`) sí desuscribe explícitamente en su
    método `clean()`. En componentes core de layout (`admin-layout`, `header-top`,
    `sidebar-top`) las suscripciones sí se limpian bien en `ngOnDestroy` — el problema está
    concentrado en la familia de servicios de `SharedModule` y, de forma más difusa, en la
    familia de componentes `report-cra-v*`/`report-crs-v*` (~50 archivos), donde la
    infraestructura `takeUntil(destroy$)` existe pero no se aplica de forma consistente a todos
    los `.subscribe()` del mismo componente (ver ejemplo en `report-cra-v5.component.ts:63,71`
    vs. `:233-236`). Esfuerzo: bajo (agregar `providedIn: 'root'` a los 4 servicios de
    `SharedModule`, o proveerlos explícitamente solo donde se consumen). Impacto: medio.

## Resumen priorizado

| # | Hallazgo | Esfuerzo | Impacto | Bloqueado por negocio | Estado |
|---|---|---|---|---|---|
| 1 | `eval()` → `JSON.parse` (6 archivos) | Bajo | Alto (seguridad) | No | ✅ Resuelto (2026-07-30) |
| 11 | `console.log` → `printLog` (165 archivos) | Bajo (mecánico) | Medio (higiene) | No | ✅ Resuelto (2026-07-30) |
| 16 | Login no verifica `id_token` de Google server-side (solo posesión del secreto) | Alto | Alto (seguridad) | Sí — cambio de protocolo backend | 🔴 Nuevo (2026-07-31), pendiente |
| 17 | AES-CBC con IV fijo en `CypherService` | Medio | Alto (seguridad) | Sí — coordinar con backend | 🔴 Nuevo (2026-07-31), pendiente |
| 18 | XSS almacenado en `dynamic-format-pipe` (`bypassSecurityTrustHtml`) | Medio | Alto (seguridad, componente muy reusado) | No | ✅ Resuelto (2026-07-31) — hallazgos relacionados menores (`categorizacion`, `mon-imr`, `stg-window-bar`) siguen pendientes |
| 19 | Dependencias con CVE (`npm audit`: swiper crítico, Angular XSS altas, uuid moderado) | Medio-Alto | Alto (seguridad) | No | 🔴 Nuevo (2026-07-31), pendiente |
| 24 | Sin manejo de error/timeout en HTTP (91% subscribe sin error, loader huérfano) | Medio (fix central) | Alto (UX rota a diario) | No | ✅ Resuelto (2026-07-31 + 2026-08-03) — interceptor + timeout + cierre de loader compartido + página de error 404/5xx, y barrido de ~35 loaders locales con `finalize()`; solo quedan pendientes bugs de camino-de-éxito no relacionados a errores HTTP |
| 2 | Secretos hardcodeados → env/vault + rotación | Medio | Alto (seguridad) | Sí — ver punto 16, es más profundo de lo que parecía | 🟡 Extraído a gitignore; rotación, pipeline externo y rediseño del modelo (punto 16) pendientes |
| 25 | `trackBy` en las 4 variantes de `stg-table` + adopción de `OnPush` | Bajo (trackBy) / Alto (OnPush) | Medio-Alto (rendimiento) | No | 🟠 Nuevo (2026-07-31), pendiente |
| 20 | Guards rotos/no conectados (`AdminGuard`, `DummyGuard` con emails hardcodeados) | Bajo | Medio-Alto | No | 🟠 Nuevo (2026-07-31), pendiente |
| 26 | Servicios de `SharedModule` sin `providedIn:'root'` (duplicados por 112 módulos) | Bajo | Medio | No | 🟠 Nuevo (2026-07-31), pendiente |
| 21 | Migrar OAuth Implicit Flow → Authorization Code + PKCE | Medio | Medio (seguridad, hardening) | No, pero requiere acceso a Google Cloud Console | 🟠 Nuevo (2026-07-31), pendiente |
| 22 | Unificar cifrado de `localStorage` (`StorageService` legacy sin cifrar) | Bajo | Bajo-Medio | No | 🟠 Nuevo (2026-07-31), pendiente |
| 9 | Poblar o borrar `core/guards|interceptors|interfaces` | Bajo | Medio (claridad) | No | ✅ Resuelto — `interceptors` poblado (2026-07-31) con lo genuinamente transversal; `guards`/`interfaces` siguen vacíos a propósito |
| 10 | Renombrar `modules/shared/` | Bajo | Bajo (claridad) | No | ✅ Obsoleto — ya no existe `modules/shared/` |
| 3 | Decidir sobre `Authorization` header comentado | Bajo (código) | Alto (si es bug real) | Sí — arquitectura de seguridad | 🟡 Analizado, ver punto 16 para el análisis completo; sin cambios de código |
| 4 | Consolidar `stg-table` v1-v4 | Alto | Alto (mantenibilidad) | No, pero requiere inventario cuidadoso | Pendiente — debería incorporar los puntos 18 y 25 |
| 15 | Elevar cobertura de tests en capa `core`/`pages` | Alto | Alto (habilita todo lo demás) | No | Pendiente |
| 5, 6 | Confirmar con negocio que `incentivos3`/`Kaypacha3` son la única versión vigente (ya se archivaron las otras) | Medio | Alto | Sí — vigencia de cada versión | Pendiente |
| 7 | Retirar/migrar `reportes/legacy/` | Muy alto | Alto | Parcial | Pendiente |
| 13, 14 | Migrar a ESLint / actualizar Angular | Alto | Medio-alto (largo plazo, y ahora también seguridad — ver punto 19) | No | Pendiente |
| 23 | Vectores menores de HTML/URL sin validar (open redirect en `desktop.component`, etc.) | Bajo | Bajo | No | Informativo, sin evidencia de explotación activa |

## Nota

Ya existe un intento previo y más avanzado de abordar el punto 4 (consolidación de `stg-table`
v1-v4 en una sola versión) y parte del punto 15 (limpieza de imports muertos en NgModules, H-16)
en una rama hoy huérfana — ver la nota final de `doc/arquitectura.md` (§8) para cómo recuperarla
(`git branch <nombre> 3631e60`, mientras el reflog no la purgue). Los puntos 5 y 6 (familias
`incentivos*`/`kaypacha*`) ya se resolvieron parcialmente de forma independiente en esta sesión
(archivado a `backups/`, sin necesidad de recuperar la rama). Antes de arrancar el punto 4 desde
cero, vale la pena revisar si la rama huérfana ya lo resolvió, para no duplicar trabajo.

Los puntos 16-26 (pasada 2026-07-31) son hallazgos nuevos, ninguno tiene código escrito todavía
— son candidatos a convertirse en planes de implementación separados. El punto 16 en particular
es una pregunta de arquitectura/protocolo que excede lo que se puede decidir solo desde el
frontend: antes de tocar código ahí, hace falta involucrar a quien mantiene el backend Winder.
