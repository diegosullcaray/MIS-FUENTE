# Informe de falencias y oportunidades de mejora — MIS-FUENTE

> Basado en el estado real de `main` (commit `f0ca213`, 2026-07-30), actualizado sobre la
> versión anterior de este informe (commit `3c7f132`) tras verificar con CodeGraph los commits
> posteriores. Complementa `doc/arquitectura.md`.

## Seguridad

1. **`eval()` sobre datos que vienen del backend, en 6 archivos activos.**
   - `modules/corresponsales/prospecto/prospecto.component.ts:343,408`
   - `modules/Kaypacha3/kaypacha3.component.ts:73,74,76,77`
   - `modules/ranking-k/detallek/detallek.component.ts:58`
   - `modules/ranking-k/principal/principal.component.ts:47`
   - `modules/reasignacion-cart-cap/detalle/detalle.component.ts:58`
   - `modules/reportes/repositorio/seguro-pasivos-graf/seguro-pasivo-graf.component.ts:270,278,336,344`

   Todos ejecutan `eval()` sobre strings JSON devueltos por el backend (`r.list[0].JSONLIST`,
   `r.cab1[0].JSONNHEAD1`, etc.) en vez de `JSON.parse`. Si el backend o cualquier capa
   intermedia queda comprometida, es ejecución de código arbitrario en el cliente. Reemplazo
   directo por `JSON.parse` — no hay razón funcional visible para usar `eval` en vez de parse
   de JSON. Bajo esfuerzo, alto impacto.
   - Nota: hay 2 usos más de `eval()` en el repo (`reasignacion-cart-cap/principal.component.ts`
     y `shared/pipes/dynamic-format-pipe.ts`) pero están comentados (código muerto), no
     ejecutan hoy.

2. **Secretos de cifrado hardcodeados y commiteados en texto plano.**
   `src/environments/environment.ts` (y `environment.prod.ts`) tienen `cypherSecret` y 7 claves
   más en `moduleSecrets` como strings hex literales, trackeados en git (no hay excepción en
   `.gitignore`). Cualquiera con acceso al repo (o su historial) tiene las claves de cifrado de
   producción. Un commit previo ("corrección de llaves secretas") sugiere que ya se intentó
   atender esto parcialmente, pero las claves siguen en el archivo. Recomendado: mover a
   variables de entorno de build / vault, y rotar las claves actuales (ya están expuestas en el
   historial de git aunque se borren del archivo actual).

3. **Adjunto del header `Authorization` deshabilitado (código muerto) en dos lugares clave.**
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

## Duplicación estructural (deuda técnica)

4. **Cuatro generaciones de `stg-table` coexistiendo:** `stg-table`, `stg-table2`, `stg-table3`,
   `stg-table4` en `shared/components/`, todas presentes y (presumiblemente) todas con
   consumidores reales activos. Mantener 4 versions del mismo componente de tabla multiplica el
   costo de cualquier cambio transversal (formato, paginación, accesibilidad). Consolidar en una
   sola versión es la limpieza de mayor payback en `shared/`, pero requiere inventariar
   consumidores de cada una antes de tocar nada (no es un rename mecánico).

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

9. **`core/guards/`, `core/interceptors/`, `core/interfaces/` siguen vacías tras la migración de
   `system/` a `pages/full-pages/`.** El nombre de la carpeta promete una capa que no existe —
   los guards e interceptors reales viven ahora en `pages/full-pages/layout/guards|interceptors`
   y `pages/full-pages/auth/guards`. La migración fue una oportunidad natural para resolver esto
   (mover a `core/` en vez de a otra carpeta de features) y no se aprovechó. O se puebla `core/`
   con lo que ya existe en `pages/full-pages/layout` (consolidando la capa transversal real en un
   solo lugar), o se borran esas 3 carpetas vacías para no confundir a quien llegue nuevo al repo.

10. **`modules/shared/` (1 archivo: `modules-key.config.ts`) vs. `app/shared/` (26+9
    subcarpetas).** El nombre `modules/shared/` sugiere lo mismo que `app/shared/` pero es un
    config de rutas sin relación. Renombrar (p. ej. `modules/modules-routing-keys/` o mover el
    archivo directo a `system/`) evita el choque cognitivo.

## Calidad de código y consistencia

11. **165 archivos llaman `console.log` directamente**, sin pasar por el wrapper
    `printLog`/`debug.util.ts` que sí respeta `environment.production`. El wrapper existe
    precisamente para que no se filtren logs en build de producción, pero se usa de forma
    inconsistente — la mayoría del código lo evita. Barrido mecánico de bajo riesgo: reemplazar
    `console.log` → `printLog` (y `console.warn/error` → `printWarn/printError`) donde no haya
    razón específica para el `console.*` directo.

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
    tests como red de seguridad — lo cual lleva al punto siguiente.

## Testing

15. **28 archivos `.spec.ts` contra 934 archivos de producción (~3%).** `karma-coverage` está
    configurado pero prácticamente no hay nada que medir. CodeGraph marca sistemáticamente
    servicios centrales (`WinderService`, `AuthService`, `TokenService`, `RESTService`,
    `StgAppConfirmService`, y en general todo lo tocado en este informe) como
    "⚠️ no covering tests found". Cualquier refactor de los puntos 4-8 (duplicación
    estructural) hoy se hace sin red de seguridad automatizada — hay que escribir tests de
    caracterización antes de tocar código compartido, no después.

## Resumen priorizado

| # | Hallazgo | Esfuerzo | Impacto | Bloqueado por negocio |
|---|---|---|---|---|
| 1 | `eval()` → `JSON.parse` (6 archivos) | Bajo | Alto (seguridad) | No |
| 11 | `console.log` → `printLog` (165 archivos) | Bajo (mecánico) | Medio (higiene) | No |
| 2 | Secretos hardcodeados → env/vault + rotación | Medio | Alto (seguridad) | No |
| 9 | Poblar o borrar `core/guards|interceptors|interfaces` | Bajo | Medio (claridad) | No |
| 10 | Renombrar `modules/shared/` | Bajo | Bajo (claridad) | No |
| 3 | Decidir sobre `Authorization` header comentado | Bajo (código) | Alto (si es bug real) | Sí — arquitectura de seguridad |
| 4 | Consolidar `stg-table` v1-v4 | Alto | Alto (mantenibilidad) | No, pero requiere inventario cuidadoso |
| 15 | Elevar cobertura de tests en capa `core`/`pages` | Alto | Alto (habilita todo lo demás) | No |
| 5, 6 | Confirmar con negocio que `incentivos3`/`Kaypacha3` son la única versión vigente (ya se archivaron las otras) | Medio | Alto | Sí — vigencia de cada versión |
| 7 | Retirar/migrar `reportes/legacy/` | Muy alto | Alto | Parcial |
| 13, 14 | Migrar a ESLint / actualizar Angular | Alto | Medio-alto (largo plazo) | No |

## Nota

Ya existe un intento previo y más avanzado de abordar el punto 4 (consolidación de `stg-table`
v1-v4 en una sola versión) y parte del punto 15 (limpieza de imports muertos en NgModules, H-16)
en una rama hoy huérfana — ver la nota final de `doc/arquitectura.md` (§8) para cómo recuperarla
(`git branch <nombre> 3631e60`, mientras el reflog no la purgue). Los puntos 5 y 6 (familias
`incentivos*`/`kaypacha*`) ya se resolvieron parcialmente de forma independiente en esta sesión
(archivado a `backups/`, sin necesidad de recuperar la rama). Antes de arrancar el punto 4 desde
cero, vale la pena revisar si la rama huérfana ya lo resolvió, para no duplicar trabajo.
