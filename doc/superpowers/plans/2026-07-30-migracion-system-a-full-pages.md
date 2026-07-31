# Migración `system/` → `pages/full-pages/{auth,layout}/` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover `src/app/system/session/` y `src/app/system/admin/` a `src/app/pages/full-pages/auth/` y `src/app/pages/full-pages/layout/` respectivamente, cada uno organizado en `components/services/guards/interceptors/directives/interfaces`, actualizando las ~156 referencias externas y las 4 referencias internas cruzadas, sin cambiar comportamiento.

**Architecture:** Angular 14, NgModules clásicos (no standalone components). Dos módulos nuevos, `AuthModule` y `LayoutModule`, ambos eager (importados directo en `AppModule`, igual que hoy). El archivo compartido `system-keys.config.ts` se copia literal a `pages/full-pages/`. El acoplamiento bidireccional auth⇄layout se preserva vía imports absolutos (`app/pages/full-pages/...`) entre ambos módulos — no se resuelve la dependencia circular.

**Tech Stack:** Angular 14.2.5, TypeScript, Angular Material, Karma+Jasmine (sin specs existentes para este código — no hay tests que romper, la verificación es `npm run build` + suite completa del repo en cada checkpoint).

## Global Constraints

- Ningún archivo cambia de comportamiento — solo de ubicación e imports. Todo el código muerto comentado, naming inconsistente y quirks (allowlist de emails en `dummy-guard.guard.ts`, override de `devUser` en `user.service.ts`, TODO sin resolver en `auth.service.ts`) se preserva tal cual.
- No quedan reexports ni shims en `src/app/system/` al finalizar — la carpeta se borra por completo (Tarea 4).
- Cada tarea termina con `npm run build` en verde antes de pasar a la siguiente.
- No se toca `route-guard.guard.ts`'s import no usado de `AuthService`, ni el import no usado de `AuthService` en `session-end-dialog.component.ts` — se les corrige solo la ruta, no se eliminan aunque estén sin uso (ver hallazgo abajo).
- Correr comandos de shell con el Bash tool (Git Bash), no PowerShell, para los comandos `git mv`/`sed` de este plan.

---

## Hallazgos clave de la investigación previa (contexto para quien ejecute)

1. **Ningún archivo fuera de `system/` importa nada de `session/` directamente** (confirmado con grep exhaustivo). Los ~156 archivos externos que importan de `system/` importan exclusivamente de `system/admin/` (LayoutService, NavigationService, UserService, IMenuItem, IChildItem, IShortcut, guards de ruta). Esto significa que la Tarea 2 (auth) no toca ningún archivo de negocio fuera de `system/`.
2. **Cruce interno admin↔session (9 archivos admin→session, 2 session→admin):**
   - admin→session: `alt-user-dialog.component.ts`, `header-top.component.ts`, `session-end-dialog.component.ts` (import sin usar, hallazgo propio no reportado por el inventario previo), `start-menu.component.ts`, `admin-guard.guard.ts`, `dummy-guard.guard.ts`, `route-guard.guard.ts`, `navigation.service.ts`, `user.service.ts` — todos importan `AuthService`, excepto `alt-user-dialog.component.ts` que importa `LoginService`.
   - session→admin: `auth.guard.ts` (importa `AdminService`), `login.service.ts` (importa `UserService` y `NavigationService`).
3. **Regla de reescritura de imports relativos:** mover `system/` a `pages/full-pages/` añade UN nivel de profundidad extra (antes `system/admin/services/x` = 3 niveles bajo `app/`, ahora `pages/full-pages/layout/services/x` = 4 niveles). Los imports relativos que se quedan DENTRO del mismo módulo nuevo (ej. `components/header-top/` → `../../services/user.service`) siguen funcionando sin cambios porque origen y destino se movieron juntos por el mismo offset. Los imports relativos que **escapan** del árbol viejo (a `core/`, o cruzan session↔admin) SÍ se rompen y se reescriben a forma absoluta (`app/core/...`, `app/pages/full-pages/...`) en vez de recalcular puntos — es más seguro que contar niveles.
4. **8 interfaces inline a extraer** (todas en `admin/services/`, ninguna en `session/`): `ILayoutConf`, `ILayoutChangeOptions` (exportadas, van a `interfaces/layout-conf.interface.ts`), `IAdjustScreenOptions` (NO exportada/privada de `layout.service.ts`, se queda inline — no es un contrato compartido), `IMenuItem`, `IChildItem` (→ `interfaces/menu-item.interface.ts`), `IShortcut`, `IBadge` (→ `interfaces/shortcut.interface.ts`), `ITheme` (→ `interfaces/theme.interface.ts`). Los servicios (`navigation.service.ts`, `theme.service.ts`, `layout.service.ts`) importan estos tipos de `interfaces/` y los re-exportan (`export { X };`) para que los ~7 archivos externos que hacen `import { IMenuItem } from '.../navigation.service'` (en vez de importar el servicio) sigan funcionando sin tocarlos uno por uno — el barrido de imports (Tarea 3) ya apunta esas líneas al nuevo `navigation.service.ts`, y el re-export hace el resto.
5. **`ModSysAdminService`** (de `core/data/remote/instances/`, NO confundir con `AdminService` de `system/admin/services/`) lo usan **26 archivos de negocio** además de `login.service.ts` (auth) y `route-tracker.service.ts` (layout) — es infraestructura genérica, no pertenece a ningún módulo nuevo. `WinderService`, `CypherService`, `RESTService`, `RoutePartsService` tampoco son `providedIn:'root'` y los inyecta código fuera de auth/layout (`AppComponent` inyecta `RoutePartsService` directo; `WinderService`/`CypherService`/`RESTService` los usan ~15 `Mod*Service` de toda la app vía `AntService`). Estos 5 se quedan registrados en `SystemModule` hasta la Tarea 4, donde pasan a `AppModule.providers` directo. `ModSysLoginService` en cambio solo lo usa `login.service.ts` — se mueve a `AuthModule.providers` en la Tarea 2. `TokenService` ya es `providedIn:'root'`, su entrada en `SystemModule.providers` es redundante — se elimina sin reemplazo en la Tarea 4 (no cambia comportamiento, Angular ya lo resuelve por root).

---

## Task 1: Scaffold — `system-keys.config.ts` compartido

**Files:**
- Create: `src/app/pages/full-pages/system-keys.config.ts`

**Interfaces:**
- Produces: `system_keys` (objeto de constantes), importado por Tareas 2 y 3 desde `app/pages/full-pages/system-keys.config`.

- [ ] **Step 1: Crear el archivo compartido**

Contenido idéntico al original (`src/app/system/system-keys.config.ts`):

```ts
export const system_keys = {
    //Authentication
    session_id:'SID',
    auth_resp:'SIK_001',
    act_lp:'SIK_002',
    user_alt:'SIK_003',
    user_bas:'SIK_004',
    user_inst:'SIK_005',
    user_mr:'SIK_006',
    user_bas_ori:'SIK_007',
    user_inst_ori:'SIK_008',
    user_menu_items_ori:'SIK_009',
    user_shortcut_items_ori:'SIK_010'
}
```

- [ ] **Step 2: Verificar que no rompe nada (el archivo viejo sigue existiendo, esto es puramente aditivo)**

Run: `npm run build`
Expected: build en verde, igual que antes de este paso (el archivo nuevo no lo importa nadie todavía).

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/full-pages/system-keys.config.ts
git commit -m "feat: crear system-keys.config.ts compartido en pages/full-pages/"
```

---

## Task 2: Migrar `session/` → `pages/full-pages/auth/`

**Files:**
- Create: `src/app/pages/full-pages/auth/services/auth.service.ts`
- Create: `src/app/pages/full-pages/auth/services/gmail.config.ts`
- Create: `src/app/pages/full-pages/auth/services/login.service.ts`
- Create: `src/app/pages/full-pages/auth/guards/auth.guard.ts`
- Create: `src/app/pages/full-pages/auth/guards/login.guard.ts`
- Create: `src/app/pages/full-pages/auth/components/auth-layout/auth-layout.component.ts` (+ `.html`)
- Create: `src/app/pages/full-pages/auth/components/login/login.component.ts` (+ `.html`, `.scss`)
- Create: `src/app/pages/full-pages/auth/components/signin/signin.component.ts` (+ `.html`, `.scss`)
- Create: `src/app/pages/full-pages/auth/auth.module.ts`
- Modify: `src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.ts` (import de `LoginService`)
- Modify: `src/app/system/admin/components/header-top/header-top.component.ts` (import de `AuthService`)
- Modify: `src/app/system/admin/components/session-end-dialog/session-end-dialog.component.ts` (import de `AuthService`, no usado, se corrige igual)
- Modify: `src/app/system/admin/components/start-menu/start-menu.component.ts` (import de `AuthService`)
- Modify: `src/app/system/admin/guards/admin-guard.guard.ts` (import de `AuthService`)
- Modify: `src/app/system/admin/guards/dummy-guard.guard.ts` (import de `AuthService`)
- Modify: `src/app/system/admin/guards/route-guard.guard.ts` (import de `AuthService`, no usado, se corrige igual)
- Modify: `src/app/system/admin/services/navigation.service.ts` (import de `AuthService` y `system_keys`)
- Modify: `src/app/system/admin/services/user.service.ts` (import de `AuthService`, `system_keys` y `LocalStoreService`)
- Modify: `src/app/system/system.module.ts` (quitar providers/imports de sesión)
- Modify: `src/app/system/system-components.ts` (quitar declarations/providers de sesión)
- Modify: `src/app/app.module.ts` (agregar `AuthModule`)
- Modify: `src/app/app-routing.module.ts` (apuntar a `auth/`, inlinear la ruta de signin)
- Delete: `src/app/system/session/` completo

**Interfaces:**
- Produces: `AuthModule` (importado por `app.module.ts`), `AuthService`/`LoginService`/`AuthGuard`/`LoginGuard` en sus nuevas rutas absolutas `app/pages/full-pages/auth/services/auth.service`, `.../services/login.service`, `.../guards/auth.guard`, `.../guards/login.guard`. `AuthLayoutComponent`, `LoginComponent`, `SigninComponent` en `app/pages/full-pages/auth/components/...`.
- Consumes: `system_keys` de la Tarea 1 (`app/pages/full-pages/system-keys.config`).

### Paso a paso

- [ ] **Step 1: Mover los archivos de vista sin cambios de import (html/scss van con `git mv`, no tienen imports TS)**

```bash
cd "c:/Users/24681/Videos/DD/MIS-FUENTE"
mkdir -p src/app/pages/full-pages/auth/services src/app/pages/full-pages/auth/guards \
         src/app/pages/full-pages/auth/components/auth-layout \
         src/app/pages/full-pages/auth/components/login \
         src/app/pages/full-pages/auth/components/signin

git mv src/app/system/session/views/auth-layout/auth-layout.component.html src/app/pages/full-pages/auth/components/auth-layout/auth-layout.component.html
git mv src/app/system/session/views/login/login.component.html src/app/pages/full-pages/auth/components/login/login.component.html
git mv src/app/system/session/views/login/login.component.scss src/app/pages/full-pages/auth/components/login/login.component.scss
git mv src/app/system/session/views/signin/signin.component.html src/app/pages/full-pages/auth/components/signin/signin.component.html
git mv src/app/system/session/views/signin/signin.component.scss src/app/pages/full-pages/auth/components/signin/signin.component.scss
git mv src/app/system/session/authentication/gmail.config.ts src/app/pages/full-pages/auth/services/gmail.config.ts
```

- [ ] **Step 2: Crear `auth-layout.component.ts` (sin cambios de contenido, solo ubicación)**

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent implements OnInit {

  constructor(
    //public translate: TranslateService,
  ) { 
    // Translator init
    //const browserLang: string = translate.getBrowserLang();
    //translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
  }

}
```

Guardar en `src/app/pages/full-pages/auth/components/auth-layout/auth-layout.component.ts`, luego:
```bash
git rm src/app/system/session/views/auth-layout/auth-layout.component.ts
```

- [ ] **Step 3: Crear `auth.service.ts`** (cambia solo el import de `system_keys`, de relativo a absoluto — ver Hallazgo 3)

```ts
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from "rxjs";
import { filter, map,tap } from "rxjs/operators";
import { OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { gmailAuthConfig } from "./gmail.config";
import { printError, printLog, printTable, printWarn } from "app/core/helpers/debug.util";
import { environment } from "environments/environment";
import { LocalStoreService } from "app/core/data/local/local-store.service";
import { system_keys } from "app/pages/full-pages/system-keys.config";
import { Buffer } from 'buffer';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

    private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);//new ReplaySubject<boolean>();
    public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

    public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([this.isAuthenticated$, this.isDoneLoading$])
        .pipe(map(values => values.every(b => b)));

    public bodyAuthResponse;

    constructor(
        private oauthService: OAuthService,
        private router: Router,
        private storage: LocalStoreService
    ) {
        this.oauthService.configure(gmailAuthConfig);

        // Useful for debugging:
        this.oauthService.events.subscribe(event => {
            if (event instanceof OAuthErrorEvent) {
                printError('OAuthErrorEvent Object:', event);
            } else {
                printLog('OAuthEvent Object:', event);
            }
        });

        window.addEventListener('storage', (event) => {
            // The `key` is `null` if the event was caused by `.clear()`
            if (event.key !== 'access_token' && event.key !== null) {
                return;
            }

            printWarn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
            this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

            if (!this.oauthService.hasValidAccessToken()) {
                this.navigateToLoginPage();
            }
        });

        this.oauthService.events
            .subscribe(_ => {
                this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
            });

        this.oauthService.events
            .pipe(filter(e => ['token_received'].includes(e.type)))
            .subscribe(_ => this.oauthService.loadUserProfile());

        this.oauthService.events
            .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
            .subscribe(e => this.navigateToLoginPage());

        //this.oauthService.setupAutomaticSilentRefresh();
    }

    private navigateToLoginPage() {
        // TODO: Remember current URL
        this.router.navigateByUrl(environment.rootPage);
    }

    private loadAuthResponse(gr) {
        let parts = gr.id_token.split('.');
        let bodyBuf = Buffer.from(parts[1], 'base64');
        this.bodyAuthResponse = JSON.parse(bodyBuf.toString());
    }

    private processHash(hash: String) {
        let gr = {};
        hash.substr(1).split('&').map(kvp => {
            let s = kvp.split('=');
            gr[s[0]] = s[1];
        });
        this.storage.setItem(system_keys.auth_resp, gr);
        return gr;
    }

    public runInitialLoginSequence(): Promise<void> {
        if (location.hash) {
            printLog('Encountered system_keys fragment, plotting as table...');
            let hash = location.hash;
            printTable(hash.substr(1).split('&').map(kvp => kvp.split('=')));
            let gr = this.processHash(hash);
            this.loadAuthResponse(gr);
        }

        // 0. LOAD CONFIG:
        // First we have to check to see how the IdServer is
        // currently configured:
        return this.oauthService.loadDiscoveryDocument()

            // For demo purposes, we pretend the previous call was very slow
            //.then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 1000)))

            // 1. HASH LOGIN:
            // Try to log in via hash fragment after redirect back
            // from IdServer from initImplicitFlow:
            .then(() => this.oauthService.tryLogin())

            /*.then(() => {
                if (this.oauthService.hasValidAccessToken()) {
                    return Promise.resolve();
                }

                // 2. SILENT LOGIN:
                // Try to log in via a refresh because then we can prevent
                // needing to redirect the user:
                return this.oauthService.silentRefresh()
                    .then(() => Promise.resolve())
                    .catch(result => {
                        // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
                        // Only the ones where it's reasonably sure that sending the
                        // user to the IdServer will help.
                        const errorResponsesRequiringUserInteraction = [
                            'interaction_required',
                            'login_required',
                            'account_selection_required',
                            'consent_required',
                        ];

                        if (result
                            && result.reason
                            && errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {

                            // 3. ASK FOR LOGIN:
                            // At this point we know for sure that we have to ask the
                            // user to log in, so we redirect them to the IdServer to
                            // enter credentials.
                            //
                            // Enable this to ALWAYS force a user to login.
                            // this.login();
                            //
                            // Instead, we'll now do this:
                            console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
                            return Promise.resolve();
                        }

                        // We can't handle the truth, just pass on the problem to the
                        // next handler.
                        return Promise.reject(result);
                    });
            })*/

            .then(() => {
                this.isDoneLoadingSubject$.next(true);
                // Check for the strings 'undefined' and 'null' just to be sure. Our current
                // login(...) should never have this, but in case someone ever calls
                // initImplicitFlow(undefined | null) this could happen.
                if (this.oauthService.state && this.oauthService.state !== 'undefined' && this.oauthService.state !== 'null') {
                    let stateUrl = this.oauthService.state;
                    if (stateUrl.startsWith('/') === false) {
                        stateUrl = decodeURIComponent(stateUrl);
                    }
                    printLog(`There was state of ${this.oauthService.state}, so we are sending you to: ${stateUrl}`);
                    this.router.navigateByUrl(stateUrl);
                }
            })
            .catch(() => this.isDoneLoadingSubject$.next(true));
    }

    public login(targetUrl?: string) {
        // Note: before version 9.1.0 of the library you needed to
        // call encodeURIComponent on the argument to the method.
        //console.log("Iniciado en: "+this.router.url)
        //this.oauthService.initLoginFlow(targetUrl || this.router.url);
        this.oauthService.initImplicitFlow();
    }

    public configure() {
        return this.oauthService.loadDiscoveryDocument();
    }

    public logout() { 
        this.oauthService.logOut();
        this.router.navigateByUrl(environment.rootPage);

    }
    public refresh() { this.oauthService.silentRefresh(); }
    public get hasValidToken() { return this.oauthService.hasValidAccessToken(); }
    public get tokenExpired() {
        const expiry = this.bodyAuthResponse.exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
    public get isLoged(){
        let v = this.storage.getItem(system_keys.auth_resp);
        return (v!==null);
    }

    // These normally won't be exposed from a service like this, but
    // for debugging it makes sense.
    public get accessToken() { return this.oauthService.getAccessToken(); }
    public get refreshToken() { return this.oauthService.getRefreshToken(); }
    public get identityClaims() { return this.oauthService.getIdentityClaims(); }
    public get idToken() { return this.oauthService.getIdToken(); }
    public get logoutUrl() { return this.oauthService.logoutUrl; }



}
```

Guardar en `src/app/pages/full-pages/auth/services/auth.service.ts`, luego `git rm src/app/system/session/authentication/auth.service.ts`.

- [ ] **Step 4: Crear `auth.guard.ts`** (cambia `./auth.service` → `../services/auth.service`, y el import de `AdminService` a la ruta nueva de layout)

```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { printWarn } from 'app/core/helpers/debug.util';
import { environment } from 'environments/environment';

import { AuthService } from '../services/auth.service';
import { TokenService } from 'app/core/services/token.service';
import { AdminService } from 'app/pages/full-pages/layout/services/admin.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private adminService: AdminService
  ) { }


  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.obs().pipe(tap(x => {
      printWarn('Estas intentando acceder a ' + state.url + ' y Auth guard responde ' + x);
      if (!x) {
        this.router.navigateByUrl(environment.rootPage);
      }
    }));
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.obs().pipe(tap(x => {
      printWarn('Estas intentando acceder a ' + state.url + ' y Auth guard responde ' + x);
      if (!x) {
        this.router.navigateByUrl(environment.rootPage);
      }
    }));
  }

  private obs() {
    if (this.authService.isLoged) {
      /*let tk = this.tokenService.getAccessToken();
      if (tk) {
        if (!this.tokenService.validateTimeToken()) {
          this.adminService.openSessionEndDialog();
          return of(false);
        }
      }*/
      return of(true);
    }
    return this.authService.canActivateProtectedRoutes$;
  }
}
```

> Nota: `AdminService` todavía vive físicamente en `src/app/system/admin/services/admin.service.ts` en este punto del plan (se mueve recién en la Tarea 3). El import absoluto `app/pages/full-pages/layout/services/admin.service` **no resolverá hasta que la Tarea 3 mueva ese archivo** — por eso el build de este Step 4 en particular quedará roto temporalmente. Se resuelve solo, sin tocar este archivo de nuevo, en cuanto la Tarea 3 mueva `admin.service.ts`. El checkpoint de build verde de esta Tarea 2 (Step 13) usa una ruta intermedia para `AdminService` — ver Step 4b.

- [ ] **Step 4b: Corrección — mantener `AdminService` en su ruta vieja hasta la Tarea 3**

Para que la Tarea 2 termine con build verde de forma independiente (sin depender de que la Tarea 3 ya se haya hecho), el import de `AdminService` en `auth.guard.ts` apunta **temporalmente** a la ubicación vieja:

```ts
import { AdminService } from 'app/system/admin/services/admin.service';
```

en vez de la ruta nueva. La Tarea 3 (Step de barrido de imports) lo corrige a `app/pages/full-pages/layout/services/admin.service` como parte del barrido general — no hace falta tocarlo a mano ahí, el script de la Tarea 3 lo alcanza igual que cualquier otro import con el patrón `system/admin/services/admin.service`.

Luego: `git rm src/app/system/session/authentication/auth.guard.ts`.

- [ ] **Step 5: Crear `login.guard.ts`** (cambia `../../system-keys.config` → `app/pages/full-pages/system-keys.config`, forma absoluta)

```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalStoreService } from 'app/core/data/local/local-store.service';
import { printWarn } from 'app/core/helpers/debug.util';
import { environment } from 'environments/environment';
import { system_keys } from 'app/pages/full-pages/system-keys.config';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private storage: LocalStoreService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    let a = this.storage.getItem(system_keys.act_lp);
    let o: Observable<boolean>;
    o = a ? of(true) : of(false);
    return o.pipe(tap(x => {
      printWarn('You tried to go to ' + state.url + ' and login guard said ' + x);
      if (!x) {
        this.router.navigateByUrl(environment.rootPage);
      }
    }));
  }
}
```

Guardar en `src/app/pages/full-pages/auth/guards/login.guard.ts`, luego `git rm src/app/system/session/guards/login.guard.ts`.

- [ ] **Step 6: Crear `login.component.ts`** (cambia `./login.service` → `../../services/login.service`; `AuthService` queda absoluto, lo alcanza el barrido de la Tarea 3 si hiciera falta, pero como ya apunta a `auth/` que se mueve en ESTA tarea, se corrige directo aquí)

```ts
import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/pages/full-pages/auth/services/auth.service";
import { LoginService } from "../../services/login.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService,private login:LoginService) {}

  ngOnInit() {
    this.authService.runInitialLoginSequence()
      //.then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 150)))
      .then(() => {
        //console.log(this.userService.getEmail());
        this.login.onLogin()
      });
  }

}
```

Guardar en `src/app/pages/full-pages/auth/components/login/login.component.ts`, luego `git rm src/app/system/session/views/login/login.component.ts`.

- [ ] **Step 7: Crear `login.service.ts`** (cambia `../../authentication/auth.service` → `./auth.service` [ahora mismo folder]; `NavigationService`/`UserService`/`system_keys` a rutas absolutas — `UserService`/`NavigationService` quedan temporalmente apuntando a la ruta vieja de `admin/`, igual que Step 4b, hasta que la Tarea 3 los mueva y el barrido los corrija)

```ts
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStoreService } from "app/core/data/local/local-store.service";
import { ModSysAdminService } from "app/core/data/remote/instances/mod-sys-admin.service";
import { ModSysLoginService } from "app/core/data/remote/instances/mod-sys-login.service";
import { IWinderResponse } from "app/core/data/remote/winder/winder.interface";
import { StgAppLoaderService } from "app/shared/components/stg-app-loader/stg-app-loader.service";
import { printLog } from "app/core/helpers/debug.util";
import { NavigationService } from "app/system/admin/services/navigation.service";
import { UserService } from "app/system/admin/services/user.service";
import { system_keys } from "app/pages/full-pages/system-keys.config";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { TokenService } from "app/core/services/token.service";

@Injectable()
export class LoginService {
    constructor(
        private authService: AuthService,
        private loginService: ModSysLoginService,
        private adminService: ModSysAdminService,
        private store: LocalStoreService,
        private router: Router,
        private userService: UserService,
        private navService: NavigationService,
        private loader: StgAppLoaderService,
        private tokenService: TokenService
    ) { }

    private login(br: any, alt: boolean) {
        this.userService.initBasics(br, alt);
        let lcall: Observable<IWinderResponse>;
        if (alt) {
            lcall = this.loginService.alt_login(this.userService.email);
        } else {
            lcall = this.loginService.login(this.userService.email);
        }
        if (alt) {
            this.loader.open();
        }
        if(!alt && environment.production){
            let meta = {
                pic_url: br.picture
            }
            this.loginService.postMeta(br.email,meta).subscribe();
        }
        lcall.subscribe(res_l => {
            var br: any = res_l.body;
            let lr = br.login_response;
            this.processLogin(lr, alt);
            this.adminService.getMenuItems(this.userService.email).subscribe(res_m => {
                var br: any = res_m.body;
                let mr = br.menu_response;
                this.processMenu(mr, alt);
                if (alt) {
                    this.loader.close();
                }
            });
        });

    }

    onOriLogin() {
        this.loader.open();
        setTimeout(() => {
            this.userService.original();
            this.navService.original();
            this.loader.close();
        }, 1000);

    }

    onAltLogin(e: string, n: string) {
        let resp = {
            name: n,
            email: e,
            pictureURL: ''
        }
        this.login(resp, true);
    }

    onLogin() {
        this.login(this.authService.bodyAuthResponse, false);
        this.tokenService.observeToken();
    }

    private processLogin(lr: any, alt: boolean) {
        this.userService.install("profile", lr.profile, alt);
        this.userService.install("alternates", lr.alternates, alt);
        if(!alt){
            this.userService.install("token", lr.token, alt);
            this.userService.install("sid", lr.sid, alt);
            this.store.setItem(system_keys.session_id,lr.sid);
            printLog("Server Session ID: "+lr.sid);
        }
    }

    private processMenu(mr: any, alt: boolean) {
        this.navService.initMenu(mr, alt);
        this.router.navigateByUrl(environment.homePage);
    }


}
```

Guardar en `src/app/pages/full-pages/auth/services/login.service.ts`, luego `git rm src/app/system/session/views/login/login.service.ts`.

- [ ] **Step 8: Crear `signin.component.ts`** (solo cambian los imports absolutos de `auth.service`/`system_keys`, ya movidos en esta misma tarea)

```ts
import { Component, OnInit } from '@angular/core';
import { LocalStoreService } from 'app/core/data/local/local-store.service';
import { baseAnimations } from 'app/shared/animations/animations.util';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { system_keys } from 'app/pages/full-pages/system-keys.config';
import * as uuid from 'uuid';
import { printLog } from 'app/core/helpers/debug.util';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: baseAnimations
})
export class SigninComponent implements OnInit {

  //signupForm: FormGroup;

  constructor(
    //private fb: FormBuilder
    private authService: AuthService,
    private lsService: LocalStoreService
  ) {
    this.authService.configure();
   }

  ngOnInit() {

    /*const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.signupForm = this.fb.group(
      {
        email: ["",[Validators.required,Validators.email]],
        password: password,
        agreed: [false,Validators.required]
      }
    );*/
    this.lsService.clear();
    this.authService.logout();
    const myId = uuid.v4();
    this.lsService.setItem(system_keys.session_id,myId);
    printLog("Generate Local Session ID: "+myId);
  }

  /*onSubmit() {
    if (!this.signupForm.invalid) {
      // do what you wnat with your data
      //console.log(this.signupForm.value);
    }
  }*/

  onSignin(){
    this.lsService.setItem(system_keys.act_lp,true);
    
    this.authService.login();
  }

}
```

Guardar en `src/app/pages/full-pages/auth/components/signin/signin.component.ts`, luego `git rm src/app/system/session/views/signin/signin.component.ts`.

- [ ] **Step 9: Borrar los archivos de módulo/routing viejos de session/ (se disuelven en `auth.module.ts` y en `app-routing.module.ts`)**

```bash
git rm src/app/system/session/session.module.ts src/app/system/session/session-routing.module.ts
```

- [ ] **Step 10: Crear `auth.module.ts`**

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OAuthModule } from 'angular-oauth2-oidc';
import { MaterialModule } from 'app/material/material.module';
import { ModSysLoginService } from 'app/core/data/remote/instances/mod-sys-login.service';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { SigninComponent } from './components/signin/signin.component';

import { LoginService } from './services/login.service';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const components = [
  AuthLayoutComponent,
  LoginComponent,
  SigninComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule,
    OAuthModule.forRoot()
  ],
  declarations: components,
  exports: components,
  providers: [
    AuthGuard,
    LoginGuard,
    LoginService,
    ModSysLoginService
  ]
})
export class AuthModule { }
```

- [ ] **Step 11: Editar `src/app/system/system.module.ts`** — quitar todo lo de sesión (`AuthGuard`, `LoginGuard`, `ModSysLoginService`, `OAuthModule`)

Reemplazar el archivo completo por:

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from 'app/system/admin/services/theme.service';
import { NavigationService } from 'app/system/admin/services/navigation.service';
import { RoutePartsService } from 'app/core/services/route-parts.service';
import { AdminDirectivesModule } from './admin/directives/admin-directives.module';
import { SystemComponentsModule } from './system-components';
import { AdminGuard } from './admin/guards/admin-guard.guard';
import { WinderService } from 'app/core/data/remote/winder/winder.service';
import { CypherService } from 'app/core/services/cypher.service';
import { RESTService } from 'app/core/data/remote/rest/rest.service';
import { ModSysAdminService } from 'app/core/data/remote/instances/mod-sys-admin.service';
import { DummyGuard } from './admin/guards/dummy-guard.guard';
import { RouteGuard } from './admin/guards/route-guard.guard';
import { TokenService } from 'app/core/services/token.service';

@NgModule({
  imports: [
    CommonModule,
    SystemComponentsModule,
    AdminDirectivesModule
  ],
  providers: [
    AdminGuard,
    RouteGuard,

    DummyGuard,

    ThemeService,
    NavigationService,
    RoutePartsService,

    WinderService,
    CypherService,
    TokenService,
    RESTService,
    ModSysAdminService
  ]
})
export class SystemModule { }
```

- [ ] **Step 12: Editar `src/app/system/system-components.ts`** — quitar `LoginComponent`, `AuthLayoutComponent`, `LoginService`, preservando el resto (incluidos los comentarios de código muerto no relacionados con sesión)

Reemplazar el archivo completo por:

```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
//import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { SearchModule } from '../search/search.module';
//import { SharedPipesModule } from '../pipes/shared-pipes.module';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { SharedDirectivesModule } from '../directives/shared-directives.module';

// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
/*import { HeaderSideComponent } from './header-side/header-side.component';
import { SidebarSideComponent } from './sidebar-side/sidebar-side.component';*/

// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './admin/components/header-top/header-top.component';
import { SidebarTopComponent } from './admin/components/sidebar-top/sidebar-top.component';

// ONLY FOR DEMO
//import { CustomizerComponent } from './customizer/customizer.component';

// ALWAYS REQUIRED 

//import { FooterComponent } from './footer/footer.component';
//import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { SidenavComponent } from './admin/components/sidenav/sidenav.component';
import { NotificationsComponent } from './admin/components/notifications/notifications.component';
import { AdminLayoutComponent } from './admin/views/admin-layout/admin-layout.component';
import { AdminDirectivesModule } from './admin/directives/admin-directives.module';
import { StartMenuComponent } from './admin/components/start-menu/start-menu.component';
import { DesktopComponent } from './admin/views/desktop/desktop.component';
import { SharedModule } from 'app/shared/shared.module';
import { AltUserDialogComponent } from './admin/components/alt-user-dialog/alt-user-dialog.component';
import { AdDialogComponent } from './admin/components/ad-dialog/ad-dialog.component';
import { SessionEndDialogComponent } from './admin/components/session-end-dialog/session-end-dialog.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
//import { ButtonLoadingComponent } from './button-loading/button-loading.component';
//import { EgretSidebarComponent, EgretSidebarTogglerDirective } from './egret-sidebar/egret-sidebar.component';
//import { BottomSheetShareComponent } from './bottom-sheet-share/bottom-sheet-share.component';
//import { EgretExampleViewerComponent } from './example-viewer/example-viewer.component';
//import { EgretExampleViewerTemplateComponent } from './example-viewer-template/example-viewer-template.component';
//import { EgretNotifications2Component } from './egret-notifications2/egret-notifications2.component';
//import { SwiperModule } from 'swiper/angular';



const components = [
    HeaderTopComponent,
    SidebarTopComponent,
    SidenavComponent,
    NotificationsComponent,
    StartMenuComponent,

    AltUserDialogComponent,
    AdDialogComponent,
    SessionEndDialogComponent,

    //SidebarSideComponent,
    //HeaderSideComponent,
    AdminLayoutComponent,

    DesktopComponent
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FlexLayoutModule,
        NgScrollbarModule,
        //SharedPipesModule,
        AdminDirectivesModule,
        MaterialModule,
        //SwiperModule,
        SharedModule
    ],
    declarations: components,
    // entryComponents: [AppComfirmComponent, AppLoaderComponent, BottomSheetShareComponent],
    exports: components,
    providers:[]
})
export class SystemComponentsModule { }
```

- [ ] **Step 13: Corregir los 9 archivos de `admin/` con referencias cruzadas a `session/` (cambian solo la línea de import indicada, nada más)**

```bash
cd "c:/Users/24681/Videos/DD/MIS-FUENTE"

sed -i "s#app/system/session/views/login/login.service#app/pages/full-pages/auth/services/login.service#" \
  src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.ts

sed -i "s#app/system/session/authentication/auth.service#app/pages/full-pages/auth/services/auth.service#" \
  src/app/system/admin/components/header-top/header-top.component.ts \
  src/app/system/admin/components/session-end-dialog/session-end-dialog.component.ts \
  src/app/system/admin/components/start-menu/start-menu.component.ts \
  src/app/system/admin/services/navigation.service.ts \
  src/app/system/admin/services/user.service.ts

sed -i "s#\.\./\.\./session/authentication/auth\.service#app/pages/full-pages/auth/services/auth.service#" \
  src/app/system/admin/guards/admin-guard.guard.ts \
  src/app/system/admin/guards/dummy-guard.guard.ts \
  src/app/system/admin/guards/route-guard.guard.ts
```

- [ ] **Step 14: Corregir `system_keys` en `navigation.service.ts` y `user.service.ts` (siguen apuntando al `system/system-keys.config` viejo, que también sigue existiendo hasta la Tarea 4 — pero como ya movimos el archivo compartido en la Tarea 1, actualizamos la referencia ahora para no tener que tocarlos de nuevo)**

```bash
sed -i "s#app/system/system-keys.config#app/pages/full-pages/system-keys.config#" \
  src/app/system/admin/services/navigation.service.ts \
  src/app/system/admin/services/user.service.ts
```

- [ ] **Step 15: Actualizar `src/app/app.module.ts`**

```ts
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { SystemModule } from './system/system.module';
import { AuthModule } from './pages/full-pages/auth/auth.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { httpInterceptorProviders } from './system/admin/interceptors/http-interceptors';
import { RouteTrackerService } from './system/admin/services/route-tracker.service';
import { DatePipe } from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule,
    SystemModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    DatePipe,
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private tracker: RouteTrackerService) {
    tracker.init();
  }
}
```

- [ ] **Step 16: Actualizar `src/app/app-routing.module.ts`** — apuntar los imports de auth a la ruta nueva e inlinear la ruta de `signin` (ya no lazy, ver decisión de diseño #5 del spec)

```ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './system/admin/views/admin-layout/admin-layout.component';
import { AuthGuard } from './pages/full-pages/auth/guards/auth.guard';
import { LoginGuard } from './pages/full-pages/auth/guards/login.guard';
import { AuthLayoutComponent } from './pages/full-pages/auth/components/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/full-pages/auth/components/login/login.component';
import { SigninComponent } from './pages/full-pages/auth/components/signin/signin.component';
import { DesktopComponent } from './system/admin/views/desktop/desktop.component';
import { DummyComponent } from './modules/reportes/components/dummy/dummy.component';
import { RouteGuard } from './system/admin/guards/route-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'session/signin',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'session',
        children: [
          {
            path: '',
            redirectTo: 'signin',
            pathMatch: 'full'
          },
          {
            path: 'signin',
            component: SigninComponent,
            data: { title: 'Inicio Sesion' }
          }
        ],
        data: { title: 'Session' }
      }
    ]
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginComponent
  },
  {
    path: 'app',
    redirectTo: 'app/desktop',
    pathMatch: 'full'
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: AdminLayoutComponent,
    children: [
      {
        path: 'desktop',
        component: DesktopComponent,
        data: { title: 'Desktop' }
      },
      {
        path: 'reportes',
        loadChildren: () => import('app/modules/reportes/rep01.module').then(m => m.Rep01Module),
        data: { title: 'Reportes' }
      },
      {
        path: 'incentivos3',
        loadChildren: () => import('app/modules/incentivos3/incentivos3.module').then(m => m.Incentivos3Module),
        data: { title: 'Incentivos' }
      },
      {
        path: 'ranking-k',
        loadChildren: () => import('app/modules/ranking-k/ranking-k.module').then(m => m.RankingKModule)
      },
      {
        path: 'dashboards',
        loadChildren: () => import('app/modules/reportes-e/reportes-e.module').then(m => m.ReportesEModule)
      },
      {
        path: 'esg',
        loadChildren: () => import('app/modules/framework-esg/framework-esg.module').then(m => m.FrameworkEsgModule)
      },
      {
        path: 'imparables',
        component: DummyComponent
      },
      {
        path: 'analista',
        loadChildren: () => import('app/modules/analista/analista.module').then(m => m.AnalistaModule)
      },
      //categorizacion
      {
        path: 'presupuesto',
        canActivate: [RouteGuard],
        loadChildren: () => import('app/modules/presupuesto/presupuesto.module').then(m => m.PresupuestoModule),
        data: { title: 'Presupuesto' }
      },
      {
        path: 'cons_base_negativa',
        loadChildren: () => import('app/modules/basenegativa/basenegativa.module').then(m => m.BaseNegativaModule),
        data: { title: 'Kaypacha' }
      },
      {
        path: 'actividades',
        canActivate: [RouteGuard],
        loadChildren: () => import('app/modules/actividades/actividades.module').then(m => m.ActividadesModule),
        data: { title: 'Actividades' }
      },
      {
        path: 'Kaypacha__',
        // canActivate:[RouteGuard],
        loadChildren: () => import('app/modules/Kaypacha3/kaypacha3.module').then(m => m.Kaypacha3Module),
        data: { title: 'Kaypacha' }
      },
      {
        path: 'corresponsales',
        //canActivate: [AuthGuard],
        //loadChildren: () => import('app/modules/reportes/legacy/banca-electronica/banca-electronica.module').then(m => m.BancaElectronicaModule),
        loadChildren: () => import('app/modules/corresponsales/corresponsales.module').then(m => m.CorresponsalesModule),
        data: { title: 'Corresponsales' }
      },
      {
        path: 'prospecto',
        loadChildren: () => import('app/modules/analista/prospecto/prospecto-cor.module').then(m => m.ProspectoCorModule)
      },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

- [ ] **Step 17: Verificar que `src/app/system/session/` quedó vacía y borrarla**

```bash
find src/app/system/session -type f
# Expected: sin salida (ningún archivo restante)
rmdir src/app/system/session 2>/dev/null || true
```

- [ ] **Step 18: Build y verificación**

Run: `npm run build`

Expected: puede fallar SOLO en la línea del `AdminService` importado por `app.guard.ts` si el Step 4b no se aplicó correctamente (debe apuntar a `app/system/admin/services/admin.service`, la ruta VIEJA, no la nueva, en este punto del plan). Si build falla en otra cosa, revisar contra la lista de 9 archivos del Step 13.

Run: `npx ng test --watch=false` (o el comando de test del repo — confirmar en `package.json` con `grep '"test"' package.json` si hay dudas)

Expected: misma cantidad de tests pasando que antes de empezar (no había specs para este código, así que no debería cambiar el conteo).

- [ ] **Step 19: Commit**

```bash
git add -A -- src/app/pages/full-pages/auth src/app/pages/full-pages/system-keys.config.ts \
  src/app/system/session src/app/system/system.module.ts src/app/system/system-components.ts \
  src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.ts \
  src/app/system/admin/components/header-top/header-top.component.ts \
  src/app/system/admin/components/session-end-dialog/session-end-dialog.component.ts \
  src/app/system/admin/components/start-menu/start-menu.component.ts \
  src/app/system/admin/guards/admin-guard.guard.ts \
  src/app/system/admin/guards/dummy-guard.guard.ts \
  src/app/system/admin/guards/route-guard.guard.ts \
  src/app/system/admin/services/navigation.service.ts \
  src/app/system/admin/services/user.service.ts \
  src/app/app.module.ts src/app/app-routing.module.ts
git status --short
# Confirmar que no queda nada con prefijo " M" fuera de esta lista antes de commitear
git commit -m "$(cat <<'EOF'
refactor: migrar system/session a pages/full-pages/auth

Consolida auth.service/login.service/guards/componentes de sesion en un
solo modulo AuthModule (eager), separado en components/services/guards.
Actualiza las 9 referencias cruzadas desde admin/ y el wiring de
app.module/app-routing. admin/ todavia vive en system/, se migra en la
siguiente tarea.
EOF
)"
```

---

## Task 3: Migrar `admin/` → `pages/full-pages/layout/`

**Files:**
- Create: `src/app/pages/full-pages/layout/interfaces/layout-conf.interface.ts`
- Create: `src/app/pages/full-pages/layout/interfaces/menu-item.interface.ts`
- Create: `src/app/pages/full-pages/layout/interfaces/shortcut.interface.ts`
- Create: `src/app/pages/full-pages/layout/interfaces/theme.interface.ts`
- Create: `src/app/pages/full-pages/layout/services/{admin,layout,navigation,theme,route-tracker,user,admin-sidenav-helper}.service.ts`
- Create: `src/app/pages/full-pages/layout/guards/{admin-guard,dummy-guard,route-guard}.guard.ts`
- Create: `src/app/pages/full-pages/layout/interceptors/{http-interceptors,token.interceptor}.ts`
- Create: `src/app/pages/full-pages/layout/directives/{admin-directives.module,admin-side-nav-toggle.directive,admin-sidenav-helper.directive,admin-highlight.directive}.ts`
- Create: `src/app/pages/full-pages/layout/components/{ad-dialog,alt-user-dialog,header-top,notifications,session-end-dialog,sidebar-top,sidenav,start-menu,admin-layout,desktop}/*.ts(+.html/.scss)`
- Create: `src/app/pages/full-pages/layout/layout.module.ts`
- Modify: `src/app/pages/full-pages/auth/guards/auth.guard.ts` (corregir el import temporal de `AdminService` del Step 4b de la Tarea 2)
- Modify: `src/app/pages/full-pages/auth/services/login.service.ts` (corregir imports temporales de `UserService`/`NavigationService` del Step 7 de la Tarea 2)
- Modify: ~143 archivos externos (`modules/`, `shared/`) — barrido automático de imports
- Modify: `src/app/app.module.ts`, `src/app/app-routing.module.ts`, `src/app/app.component.ts`
- Delete: `src/app/system/admin/` completo

**Interfaces:**
- Consumes: `system_keys` de `app/pages/full-pages/system-keys.config` (Tarea 1). `AuthService` de `app/pages/full-pages/auth/services/auth.service`, `LoginService` de `.../auth/services/login.service` (Tarea 2, cruce layout→auth).
- Produces: `LayoutModule`, y todos los servicios/guards/componentes de layout en sus rutas nuevas bajo `app/pages/full-pages/layout/...`. `IMenuItem`, `IChildItem`, `IShortcut`, `IBadge`, `ITheme`, `ILayoutConf`, `ILayoutChangeOptions` re-exportados desde sus respectivos servicios para no romper a los ~7 consumidores externos que importan el tipo directo del archivo del servicio.

### Paso a paso

- [ ] **Step 1: Crear las 4 interfaces extraídas**

`src/app/pages/full-pages/layout/interfaces/layout-conf.interface.ts`:
```ts
export interface ILayoutConf {
  navigationPos?: string; // side, top
  sidebarStyle?: string; // full, compact, closed
  sidebarCompactToggle?: boolean; // sidebar expandable on hover
  sidebarColor?: string; // Sidebar background color http://demos.ui-lib.com/egret-doc/#egret-colors
  dir?: string; // ltr, rtl
  isMobile?: boolean; // updated automatically
  //useBreadcrumb?: boolean; // Breadcrumb enabled/disabled
  breadcrumb?: string; // simple, title
  topbarFixed?: boolean; // Fixed header
  footerFixed?: boolean; // Fixed Footer
  topbarColor?: string; // Header background color http://demos.ui-lib.com/egret-doc/#egret-colors
  //footerColor?: string; // Header background color http://demos.ui-lib.com/egret-doc/#egret-colors
  matTheme?: string; // material theme. egret-blue, egret-navy, egret-dark-purple, egret-dark-pink
  cScrollbar?: boolean;
}

export interface ILayoutChangeOptions {
  duration?: number;
  transitionClass?: boolean;
}
```

`src/app/pages/full-pages/layout/interfaces/menu-item.interface.ts`:
```ts
import { IBadge } from './shortcut.interface';

export interface IMenuItem {
  type: string; // Possible values: link/dropDown/icon/separator/extLink
  name?: string; // Used as display text for item and title for separator type
  state?: string; // Router state
  icon?: string; // Material icon name
  svgIcon?: string; // UI Lib icon name
  tooltip?: string; // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
  badges?: IBadge[];
  cod?: string;
  info?:string;
}
export interface IChildItem {
  type?: string;
  name: string; // Display text
  state?: string; // Router state
  icon?: string;  // Material icon name
  svgIcon?: string; // UI Lib icon name
  sub?: IChildItem[];
  cod?: string;
  info?:string;
}
```

`src/app/pages/full-pages/layout/interfaces/shortcut.interface.ts`:
```ts
export interface IShortcut{
  name: string;
  state?: string;
  icon?: string;
  type?: number;
  info?:string;
}

export interface IBadge {
  color: string; // primary/accent/warn/hex color codes(#fff000)
  value: string; // Display text
}
```

`src/app/pages/full-pages/layout/interfaces/theme.interface.ts`:
```ts
export interface ITheme {
  name: string,
  baseColor?: string,
  isActive?: boolean
}
```

- [ ] **Step 2: Mover los archivos de vista/plantilla sin imports TS (git mv directo)**

```bash
cd "c:/Users/24681/Videos/DD/MIS-FUENTE"
mkdir -p src/app/pages/full-pages/layout/interfaces src/app/pages/full-pages/layout/services \
         src/app/pages/full-pages/layout/guards src/app/pages/full-pages/layout/interceptors \
         src/app/pages/full-pages/layout/directives \
         src/app/pages/full-pages/layout/components/ad-dialog \
         src/app/pages/full-pages/layout/components/alt-user-dialog \
         src/app/pages/full-pages/layout/components/header-top \
         src/app/pages/full-pages/layout/components/notifications \
         src/app/pages/full-pages/layout/components/session-end-dialog \
         src/app/pages/full-pages/layout/components/sidebar-top \
         src/app/pages/full-pages/layout/components/sidenav \
         src/app/pages/full-pages/layout/components/start-menu \
         src/app/pages/full-pages/layout/components/admin-layout \
         src/app/pages/full-pages/layout/components/desktop

git mv src/app/system/admin/components/ad-dialog/ad-dialog.component.html src/app/pages/full-pages/layout/components/ad-dialog/
git mv src/app/system/admin/components/ad-dialog/ad-dialog.component.scss src/app/pages/full-pages/layout/components/ad-dialog/
git mv src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.html src/app/pages/full-pages/layout/components/alt-user-dialog/
git mv src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.scss src/app/pages/full-pages/layout/components/alt-user-dialog/
git mv src/app/system/admin/components/header-top/header-top.component.html src/app/pages/full-pages/layout/components/header-top/
git mv src/app/system/admin/components/header-top/header-top.component.scss src/app/pages/full-pages/layout/components/header-top/
git mv src/app/system/admin/components/notifications/notifications.component.html src/app/pages/full-pages/layout/components/notifications/
git mv src/app/system/admin/components/session-end-dialog/session-end-dialog.component.html src/app/pages/full-pages/layout/components/session-end-dialog/
git mv src/app/system/admin/components/session-end-dialog/session-end-dialog.component.scss src/app/pages/full-pages/layout/components/session-end-dialog/
git mv src/app/system/admin/components/sidebar-top/sidebar-top.component.html src/app/pages/full-pages/layout/components/sidebar-top/
git mv src/app/system/admin/components/sidenav/sidenav.template.html src/app/pages/full-pages/layout/components/sidenav/
git mv src/app/system/admin/components/start-menu/start-menu.component.html src/app/pages/full-pages/layout/components/start-menu/
git mv src/app/system/admin/components/start-menu/start-menu.component.scss src/app/pages/full-pages/layout/components/start-menu/
git mv src/app/system/admin/views/admin-layout/admin-layout.component.html src/app/pages/full-pages/layout/components/admin-layout/
git mv src/app/system/admin/views/admin-layout/admin-layout.component.scss src/app/pages/full-pages/layout/components/admin-layout/
git mv src/app/system/admin/views/desktop/desktop.component.html src/app/pages/full-pages/layout/components/desktop/
git mv src/app/system/admin/views/desktop/desktop.component.scss src/app/pages/full-pages/layout/components/desktop/
```

- [ ] **Step 3: Crear `theme.service.ts`** (extrae `ITheme`, re-exporta)

```ts
import { Injectable, Inject, Renderer2, RendererFactory2, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ITheme } from '../interfaces/theme.interface';

export { ITheme };

@Injectable()
export class ThemeService {
  public onThemeChange: EventEmitter<ITheme> = new EventEmitter();

  public themes: ITheme[]  = [
  {
    'name': 'egret-navy',
    'baseColor': '#10174c',
    'isActive': false
  },
  {
    'name': 'egret-navy-dark',
    'baseColor': '#0081ff',
    'isActive': false
  }];

  public activatedTheme: ITheme;
  private renderer: Renderer2;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Invoked in AppComponent and apply 'activatedTheme' on startup
  applyMatTheme( themeName: string) {

    this.activatedTheme = this.themes.find(t => t.name === themeName)||this.themes[0];
    this.flipActiveFlag(themeName);

    // this.changeTheme(themeName);
    this.renderer.addClass(this.document.body, themeName);

  }

  changeTheme(prevTheme:any, themeName: string) {
    this.renderer.removeClass(this.document.body, prevTheme);
    this.renderer.addClass(this.document.body, themeName);
    this.flipActiveFlag(themeName);
    this.onThemeChange.emit(this.activatedTheme);
  }

  flipActiveFlag(themeName: string) {
    this.themes.forEach((t) => {
      t.isActive = false;
      if (t.name === themeName) {
        t.isActive = true;
        this.activatedTheme = t;
      }
    });
  }
}
```

Guardar en `src/app/pages/full-pages/layout/services/theme.service.ts`, luego `git rm src/app/system/admin/services/theme.service.ts`.

- [ ] **Step 4: Crear `layout.service.ts`** (extrae `ILayoutConf`/`ILayoutChangeOptions`, deja `IAdjustScreenOptions` inline por ser privada/no exportada)

```ts
import { Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//import { getQueryParam } from '../helpers/url.helper';
import { ThemeService } from './theme.service';
import { ILayoutConf, ILayoutChangeOptions } from '../interfaces/layout-conf.interface';

export { ILayoutConf, ILayoutChangeOptions };

interface IAdjustScreenOptions {
  browserEvent?: any;
  route?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  public layoutConf: ILayoutConf = {};
  layoutConfSubject = new BehaviorSubject<ILayoutConf>(this.layoutConf);
  layoutConf$ = this.layoutConfSubject.asObservable();
  public isMobile: boolean;
  public currentRoute: string;
  public fullWidthRoutes = ['shop'];

  constructor(private themeService: ThemeService) {
    this.setAppLayout(
      // ******** SET YOUR LAYOUT OPTIONS HERE *********
      {
        navigationPos: 'top', // side, top
        sidebarStyle: 'full', // full, compact, closed
        sidebarColor: 'slate', // http://demos.ui-lib.com/egret-doc/#egret-colors
        sidebarCompactToggle: false, // applied when "sidebarStyle" is "compact"
        dir: 'ltr', // ltr, rtl
        //useBreadcrumb: true,
        topbarFixed: false,
        footerFixed: false,
        topbarColor: 'white', // http://demos.ui-lib.com/egret-doc/#egret-colors
        //footerColor: 'slate', // http://demos.ui-lib.com/egret-doc/#egret-colors
        matTheme: 'egret-navy', // egret-navy, egret-navy-dark
        //breadcrumb: 'title', // simple, title
        cScrollbar: true,
      }
    );
  }

  setAppLayout(layoutConf: ILayoutConf) {
    this.layoutConf = { ...this.layoutConf, ...layoutConf };
    this.applyMatTheme();

    // ******* Only for demo purpose ***
    //this.setLayoutFromQuery();
    // **********************
  }

  publishLayoutChange(lc: ILayoutConf, opt: ILayoutChangeOptions = {}) {
    if (this.layoutConf.matTheme !== lc.matTheme && lc.matTheme) {
      this.themeService.changeTheme(this.layoutConf.matTheme, lc.matTheme);
    }

    this.layoutConf = Object.assign(this.layoutConf, lc);
    this.layoutConfSubject.next(this.layoutConf);
  }

  applyMatTheme() {
    this.themeService.applyMatTheme(this.layoutConf.matTheme);
  }

  /*setLayoutFromQuery() {
    const layoutConfString = getQueryParam('layout');
    const prevTheme = this.layoutConf.matTheme;
    try {
      this.layoutConf = JSON.parse(layoutConfString);
      this.themeService.changeTheme(prevTheme, this.layoutConf.matTheme);
    } catch (e) {}
  }*/

  adjustLayout(options: IAdjustScreenOptions = {}) {
    let sidebarStyle: string;
    this.isMobile = this.isSm();
    this.currentRoute = options.route || this.currentRoute;
    sidebarStyle = this.isMobile ? 'closed' : 'full';

    if (this.currentRoute) {
      this.fullWidthRoutes.forEach((route) => {
        if (this.currentRoute.indexOf(route) !== -1) {
          sidebarStyle = 'closed';
        }
      });
    }

    this.publishLayoutChange({
      isMobile: this.isMobile,
      sidebarStyle,
    });
  }

  isSm() {
    return window.matchMedia(`(max-width: 959px)`).matches;
  }
}
```

Guardar en `src/app/pages/full-pages/layout/services/layout.service.ts`, luego `git rm src/app/system/admin/services/layout.service.ts`.

- [ ] **Step 5: Crear `navigation.service.ts`** (extrae `IMenuItem`/`IChildItem`/`IShortcut`/`IBadge`, re-exporta; `AuthService`/`system_keys` a rutas nuevas)

```ts
import { Injectable } from '@angular/core';
import { LocalStoreService } from 'app/core/data/local/local-store.service';
import { isNullOrUndefined } from 'app/core/helpers/functions.util';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { system_keys } from 'app/pages/full-pages/system-keys.config';
import { BehaviorSubject } from 'rxjs';
import { IMenuItem, IChildItem } from '../interfaces/menu-item.interface';
import { IShortcut, IBadge } from '../interfaces/shortcut.interface';

export { IMenuItem, IChildItem, IShortcut, IBadge };

@Injectable()
export class NavigationService {
  /*
    // Icon menu TITLE at the very top of navigation.
    // This title will appear if any icon type item is present in menu.
    iconTypeMenuTitle = 'Frequently Accessed';
    // sets iconMenu as default;
    menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
    // navigation component has subscribed to this Observable
    menuItems$ = this.menuItems.asObservable();
  */
  public menuItemsBuffer: IMenuItem[];
  public shortcutItemsBuffer: IShortcut[]=[];

  public routesArray: string[]=[];

  private menuItems = new BehaviorSubject<IMenuItem[]>([]);
  public menuItems$ = this.menuItems.asObservable();
  private shortcutItems = new BehaviorSubject<IShortcut[]>([]);
  public shortcutItems$ = this.shortcutItems.asObservable();

  constructor(
    private storage: LocalStoreService,
    private auth: AuthService
  ) {
    if (this.auth.isLoged) {
      this.menu(this.storage.getItem(system_keys.user_mr));
      this.publishMenuChanges();
    }
  }

  private compareItems(a: any, b: any) {
    if (a.order_sec === b.order_sec) {
      return 0;
    } else if (a.order_sec > b.order_sec) {
      return 1
    }
    return -1;
  }

  private shortcut(e){
    if([1,2].includes(e.tip_sec)){
      let s:IShortcut ={
        name:e.desc_sec,
        state:e.act_sec,
        icon:e.icon_sec,
        type:e.tip_sec,
        info:e.info
      }
      this.shortcutItemsBuffer.push(s);
    }
  }

  private menu(mr: any[]) {
    this.menuItemsBuffer=[];
    this.shortcutItemsBuffer=[];
    mr.filter(e => isNullOrUndefined(e.cod_par))
      .sort(this.compareItems)
      .forEach(e => {
        let a: IMenuItem = {
          type: e.menu_sec===0 || e.menu_sec === undefined?'link':'dropDown',
          name: e.desc_sec,
          state: e.act_sec,
          icon: e.icon_sec,
          info:e.info,
          cod: e.cod_sec
        }
        if(!isNullOrUndefined(e.act_sec)){
          this.routesArray.push(e.act_sec);
        }
        
        this.shortcut(e);
        this.generateChilds(a,mr,false);
        this.menuItemsBuffer.push(a);
      });
  }

  private generateChilds(epar: any, mr: any[],f:boolean) {
    let childs: IChildItem[] = [];
    mr.filter(e => e.cod_par === epar.cod)
      .sort(this.compareItems)
      .forEach(v => {
        let child: IChildItem = {
          type: 'link',
          name: v.desc_sec,
          state: v.act_sec,
          cod: v.cod_sec,
          icon:v.icon_sec,
          info:v.info
        }
        if(!isNullOrUndefined(v.act_sec)){
          this.routesArray.push(v.act_sec);
        }
        this.shortcut(v);
        this.generateChilds(child, mr,true);
        childs.push(child);
      });
    epar.sub = childs;
    if (childs.length > 0 && f) {
      epar.type = 'dropDown';
    }
  }

  public initMenu(mr: any,isAlt:boolean) {
    this.menu(mr);
    this.storage.setItem(system_keys.user_mr,mr);
    if(!isAlt){
      this.storage.setItem(system_keys.user_menu_items_ori,this.menuItemsBuffer);
      this.storage.setItem(system_keys.user_shortcut_items_ori,this.shortcutItemsBuffer);
    }
    this.publishMenuChanges();
  }

  public original(){
    let omi = this.storage.getItem(system_keys.user_menu_items_ori);
    let osi = this.storage.getItem(system_keys.user_shortcut_items_ori);
    this.menuItems.next(omi);
    this.shortcutItems.next(osi);
  }

  private publishMenuChanges(){
    this.menuItems.next(this.menuItemsBuffer);
    this.shortcutItems.next(this.shortcutItemsBuffer);
  }

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  /*publishNavigationChange(menuType: string) {
    switch (menuType) {
      case 'separator-menu':
        this.menuItems.next(this.separatorMenu);
        break;
      case 'icon-menu':
        this.menuItems.next(this.iconMenu);
        break;
      default:
        this.menuItems.next(this.plainMenu);
    }
  }*/
}
```

Guardar en `src/app/pages/full-pages/layout/services/navigation.service.ts`, luego `git rm src/app/system/admin/services/navigation.service.ts`.

- [ ] **Step 6: Mover `admin.service.ts` y `route-tracker.service.ts` sin cambios de contenido (`git mv` directo — sus imports relativos siguen siendo válidos porque `services/` y `components/` se movieron juntos manteniendo la misma relación)**

```bash
git mv src/app/system/admin/services/admin.service.ts src/app/pages/full-pages/layout/services/admin.service.ts
git mv src/app/system/admin/services/route-tracker.service.ts src/app/pages/full-pages/layout/services/route-tracker.service.ts
```

- [ ] **Step 7: Crear `user.service.ts`** (`AuthService`/`system_keys` a rutas nuevas, `LocalStoreService` de relativo `../../../` a absoluto)

```ts
import { Injectable } from "@angular/core";
import { isNullOrUndefined } from "app/core/helpers/functions.util";
import { AuthService } from "app/pages/full-pages/auth/services/auth.service";
import { system_keys } from "app/pages/full-pages/system-keys.config";
import { environment } from "environments/environment";
import { LocalStoreService } from "app/core/data/local/local-store.service";


@Injectable({ providedIn: 'root' })
export class UserService {
    public email:string;
    public name:string;
    public pictureURL:string;
    public isDev:boolean;
    public isAlt:boolean;

    private body:{};

    constructor(
        private storage: LocalStoreService,
        private auth: AuthService
    ) {
        this.isDev=!environment.production;
        if(this.auth.isLoged){
            let a:boolean = this.storage.getItem(system_keys.user_alt);
            this.basics(this.storage.getItem(system_keys.user_bas),a);
            this.body=this.storage.getItem(system_keys.user_inst);
        }else{
            this.body={};
        }
    }

    get oriEmail(): string {
        let bp = this.storage.getItem(system_keys.user_bas_ori);
        if (isNullOrUndefined(bp)) {
            return undefined;
        }
        return bp.email;
    }

    private basics(r:any,alt:boolean){
        this.email=r.email;
        this.name=r.name;
        this.pictureURL=r.picture;
        if(!environment.production && !alt){
            this.email=environment.devUser;
        }
        this.setAlt(alt);
    }

    private setAlt(a:boolean){
        this.storage.setItem(system_keys.user_alt,a);
        this.isAlt=a;
    }

    public initBasics(resp:any,alt:boolean){
        this.basics(resp,alt);
        let bp={
            email:this.email,name:this.name,picture:this.pictureURL
        };
        this.storage.setItem(system_keys.user_bas,bp);
        if(!alt){
            this.storage.setItem(system_keys.user_bas_ori,bp);
        }
    }

    public install(key:string,prof:any,alt:boolean){
        this.body[key]=prof;
        this.storage.setItem(system_keys.user_inst,this.body);
        if(!alt){
            this.storage.setItem(system_keys.user_inst_ori,this.body);
        }
    }

    public original(){
        let r = this.storage.getItem(system_keys.user_bas_ori);
        this.basics(r,false);
        let ob = this.storage.getItem(system_keys.user_inst_ori);
        this.body=ob;
        this.setAlt(false);
    }

    public get(key:string):any{
        if(isNullOrUndefined(this.body)){
            return undefined;
        }
        return this.body[key];
    }

    public drop(key:string):void{
        delete this.body[key];
    }

    
}
```

Guardar en `src/app/pages/full-pages/layout/services/user.service.ts`, luego `git rm src/app/system/admin/services/user.service.ts`.

- [ ] **Step 8: Mover `admin-sidenav-helper.service.ts` (sin cambios de contenido, solo ubicación — pasa de `directives/admin-sidenav-helper/` a `services/`)**

```bash
git mv src/app/system/admin/directives/admin-sidenav-helper/admin-sidenav-helper.service.ts src/app/pages/full-pages/layout/services/admin-sidenav-helper.service.ts
```

- [ ] **Step 9: Crear los 3 guards** (cambia solo el import de `AuthService`, ya corregido a absoluto desde la Tarea 2 — se mueven sin más cambios; `UserService`/`NavigationService` relativos quedan iguales)

`admin-guard.guard.ts`:
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { printLog, printWarn } from 'app/core/helpers/debug.util';
import { environment } from 'environments/environment';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    printLog("is loged",this.authService.isLoged);
    if(this.authService.isLoged){
      return of(true);
    }else{
      return of(false).pipe(tap(x => this.router.navigateByUrl(environment.rootPage)));;
    }
  }
}
```

`dummy-guard.guard.ts`:
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { printLog, printWarn } from 'app/core/helpers/debug.util';
import { environment } from 'environments/environment';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { UserService } from '../services/user.service';

@Injectable()
export class DummyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    let p = this.userService.get('profile');
    let o: Observable<boolean>;
    o = p.tip_use==0 || this.userService.email=='victor.blas@confianza.pe' || this.userService.email=='giovanni.calderon@confianza.pe' ? of(true) : of(false);
    return o.pipe(tap(x => {
      printWarn('You tried to go to ' + state.url + ' and dummy guard said ' + x);
      if (!x) {
        this.router.navigateByUrl(environment.rootPage);
      }
    }));
  }
}
```

`route-guard.guard.ts`:
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { printLog, printWarn } from 'app/core/helpers/debug.util';
import { environment } from 'environments/environment';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { UserService } from '../services/user.service';
import { NavigationService } from '../services/navigation.service';

@Injectable()
export class RouteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private navService: NavigationService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    let v = this.navService.routesArray.includes(state.url);
    let o: Observable<boolean>;
    o =  of(v) ;
    return o.pipe(tap(x => {
      printWarn('You tried to go to ' + state.url + ' and Router guard said ' + x);
      if (!x) {
        this.router.navigateByUrl(environment.homePage);
      }
    }));
  }
}
```

Guardar los 3 en `src/app/pages/full-pages/layout/guards/`, luego `git rm src/app/system/admin/guards/admin-guard.guard.ts src/app/system/admin/guards/dummy-guard.guard.ts src/app/system/admin/guards/route-guard.guard.ts`.

- [ ] **Step 10: Crear `token.interceptor.ts`** (renombrado desde `TokenInterceptor.ts`, `repository/` se aplana, `admin.service` pasa a `../services/admin.service`)

```ts
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { isNullOrUndefined } from "app/core/helpers/functions.util";
import { TokenService } from "app/core/services/token.service";
import { environment } from "environments/environment";
import { EMPTY, Observable } from "rxjs";
import { AdminService } from "../services/admin.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private tokenService: TokenService, private adminService: AdminService) { }

    isAntDomain(url: string) {
        return url.startsWith(environment.requestConfigRootURL);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.isAntDomain(request.url)) {
            this.tokenService.updateToken();
        }
        /*let changedReq: any;
        if (this.isAntDomain(request.url)) {
            if(!this.tokenService.validateToken(tk)){
                //console.log(request);
                this.adminService.openSessionEndDialog();
                return EMPTY;
            }
            changedReq = request.clone({
                setHeaders: {
                    'Authorization': tk
                },
            });
        } else {
            changedReq = request;
        }*/
        return next.handle(request);
    }
}
```

Guardar en `src/app/pages/full-pages/layout/interceptors/token.interceptor.ts`, luego `git rm src/app/system/admin/interceptors/repository/TokenInterceptor.ts`.

- [ ] **Step 11: Crear `http-interceptors.ts`** (barrel, actualiza el import al archivo renombrado)

```ts
/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
];
```

Guardar en `src/app/pages/full-pages/layout/interceptors/http-interceptors.ts`, luego `git rm src/app/system/admin/interceptors/http-interceptors.ts` y `rmdir src/app/system/admin/interceptors/repository` (si queda vacía).

- [ ] **Step 12: Mover `admin-side-nav-toggle.directive.ts` y `admin-highlight.directive.ts` sin cambios (`git mv`)**

```bash
git mv src/app/system/admin/directives/admin-side-nav-toggle.directive.ts src/app/pages/full-pages/layout/directives/admin-side-nav-toggle.directive.ts
git mv src/app/system/admin/directives/admin-highlight.directive.ts src/app/pages/full-pages/layout/directives/admin-highlight.directive.ts
```

- [ ] **Step 13: Crear `admin-sidenav-helper.directive.ts`** (aplanado, `./admin-sidenav-helper.service` → `../services/admin-sidenav-helper.service`)

```ts
import {
  Directive,
  OnInit,
  OnDestroy,
  HostBinding,
  Input,
  HostListener
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MatSidenav } from "@angular/material/sidenav";
import { MediaObserver } from "@angular/flex-layout";
import { AdminSidenavHelperService } from "../services/admin-sidenav-helper.service";
import { MatchMediaService } from "app/core/services/match-media.service";

@Directive({
  selector: "[adminSidenavHelper]"
})
export class AdminSidenavHelperDirective implements OnInit, OnDestroy {
  @HostBinding("class.is-open")
  isOpen: boolean;

  @Input("adminSidenavHelper")
  id: string;

  @Input("isOpen")
  isOpenBreakpoint: string;

  private unsubscribeAll: Subject<any>;

  constructor(
    private matchMediaService: MatchMediaService,
    private adminSidenavHelperService: AdminSidenavHelperService,
    private matSidenav: MatSidenav,
    private mediaObserver: MediaObserver
  ) {
    // Set the default value
    this.isOpen = true;

    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.adminSidenavHelperService.setSidenav(this.id, this.matSidenav);

    if (this.mediaObserver.isActive(this.isOpenBreakpoint)) {
      this.isOpen = true;
      this.matSidenav.mode = "side";
      this.matSidenav.toggle(true);
    } else {
      this.isOpen = false;
      this.matSidenav.mode = "over";
      this.matSidenav.toggle(false);
    }

    this.matchMediaService.onMediaChange
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        if (this.mediaObserver.isActive(this.isOpenBreakpoint)) {
          this.isOpen = true;
          this.matSidenav.mode = "side";
          this.matSidenav.toggle(true);
        } else {
          this.isOpen = false;
          this.matSidenav.mode = "over";
          this.matSidenav.toggle(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(null);
    this.unsubscribeAll.complete();
  }
}

@Directive({
  selector: "[adminSidenavToggler]"
})
export class AdminSidenavTogglerDirective {
  @Input("adminSidenavToggler")
  public id: any;

  constructor(private adminSidenavHelperService: AdminSidenavHelperService) {}

  @HostListener("click")
  onClick() {
    // console.log(this.egretSidenavHelperService.getSidenav(this.id))
    this.adminSidenavHelperService.getSidenav(this.id).toggle();
  }
}
```

Guardar en `src/app/pages/full-pages/layout/directives/admin-sidenav-helper.directive.ts`, luego `git rm -r src/app/system/admin/directives/admin-sidenav-helper` (ya vacía tras Steps 8 y 13).

- [ ] **Step 14: Crear `admin-directives.module.ts`** (ruta del import aplanado de `admin-sidenav-helper`)

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontSizeDirective } from 'app/shared/directives/font-size.directive';
import { ScrollToDirective } from 'app/shared/directives/scroll-to.directive';
import { AppDropdownDirective } from 'app/shared/directives/dropdown.directive';
import { DropdownAnchorDirective } from 'app/shared/directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from 'app/shared/directives/dropdown-link.directive';
import { AdminSideNavToggleDirective } from './admin-side-nav-toggle.directive';
import { AdminSidenavHelperDirective, AdminSidenavTogglerDirective } from './admin-sidenav-helper.directive';
//import { AdminHighlightDirective } from './admin-highlight.directive';



const directives = [
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  AdminSideNavToggleDirective,
  AdminSidenavHelperDirective,
  AdminSidenavTogglerDirective,
  //AdminHighlightDirective
]

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: directives,
  exports: directives
})
export class AdminDirectivesModule {}
```

Guardar en `src/app/pages/full-pages/layout/directives/admin-directives.module.ts`, luego `git rm src/app/system/admin/directives/admin-directives.module.ts`.

- [ ] **Step 15: Mover los componentes sin cambios de import (`git mv` — `ad-dialog`, `notifications`, `sidenav`)**

```bash
git mv src/app/system/admin/components/ad-dialog/ad-dialog.component.ts src/app/pages/full-pages/layout/components/ad-dialog/ad-dialog.component.ts
git mv src/app/system/admin/components/notifications/notifications.component.ts src/app/pages/full-pages/layout/components/notifications/notifications.component.ts
git mv src/app/system/admin/components/sidenav/sidenav.component.ts src/app/pages/full-pages/layout/components/sidenav/sidenav.component.ts
```

- [ ] **Step 16: Crear `alt-user-dialog.component.ts`** (import de `LoginService` ya corregido desde la Tarea 2, se mueve sin más cambios)

```ts
import { SelectionModel } from "@angular/cdk/collections";
import { Inject, OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LoginService } from "app/pages/full-pages/auth/services/login.service";

@Component({
    selector: 'app-alt-user',
    templateUrl: './alt-user-dialog.component.html',
    styleUrls: ['./alt-user-dialog.component.scss']
})
export class AltUserDialogComponent implements OnInit {
    altData: any;
    
    selection = new SelectionModel<any>(false, []);

    constructor(@Inject(MAT_DIALOG_DATA) data,private login:LoginService,private dialogRef: MatDialogRef<AltUserDialogComponent>) {
        this.altData = data.alts;
    }

    selectItem(item: any) {
        this.selection.toggle(item);
        //this.onSelectRow.emit(row);
    }

    actionPerformed(){
        let alt = this.selection.selected[0];
        this.dialogRef.close();
        this.login.onAltLogin(alt.email_alt,alt.nombre_alt);
    }

    ngOnInit(): void {

    }
}
```

Guardar en `src/app/pages/full-pages/layout/components/alt-user-dialog/alt-user-dialog.component.ts`, luego `git rm src/app/system/admin/components/alt-user-dialog/alt-user-dialog.component.ts`.

- [ ] **Step 17: Crear `header-top.component.ts`** (`layout.service`/`theme.service`/`auth.service` a rutas nuevas; `user.service` relativo sin cambios)

```ts
import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'app/pages/full-pages/layout/services/layout.service';
import { ThemeService } from 'app/pages/full-pages/layout/services/theme.service';
import { UserService } from '../../services/user.service';
import { AuthService } from 'app/pages/full-pages/auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html',
  styleUrls:['./header-top.component.scss']
})
export class HeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
  menuItems: any;
  menuItemSub: Subscription;
  egretThemes: any[] = [];
  currentLang = 'en';
  availableLangs = [{
    name: 'English',
    code: 'en',
  }, {
    name: 'Spanish',
    code: 'es',
  }]
  @Input() notificPanel;
  constructor(
    public layout: LayoutService,
    public themeService: ThemeService,
    public user: UserService,
    public auth: AuthService,
    public router:Router
    //public translate: TranslateService,
    //private renderer: Renderer2,
    //public jwtAuth: JwtAuthService
  ) { }

  showDesktop(){
    this.router.navigateByUrl(environment.homePage);
  }

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.themes;
  }
  ngOnDestroy() {
    if(this.menuItemSub){
      this.menuItemSub.unsubscribe()
    }
    
  }
  setLang() {
    //this.translate.use(this.currentLang)
  }
  changeTheme(theme) {
    this.layout.publishLayoutChange({ matTheme: theme.name })
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if (this.layoutConf.isMobile) {
      if (this.layoutConf.sidebarStyle === 'closed') {
        return this.layout.publishLayoutChange({
          sidebarStyle: 'full'
        })
      }
      this.layout.publishLayoutChange({
        sidebarStyle: 'closed'
      })
    }
  }
}
```

Guardar en `src/app/pages/full-pages/layout/components/header-top/header-top.component.ts`, luego `git rm src/app/system/admin/components/header-top/header-top.component.ts`.

- [ ] **Step 18: Crear `session-end-dialog.component.ts`** (import de `AuthService` no usado, corregido igual)

```ts
import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { LocalStoreService } from "app/core/data/local/local-store.service";
import { TokenService } from "app/core/services/token.service";
import { AuthService } from "app/pages/full-pages/auth/services/auth.service";
import { environment } from "environments/environment";

@Component({
    selector: 'session-end-dialog',
    templateUrl: './session-end-dialog.component.html',
    styleUrls: ['./session-end-dialog.component.scss']
})
export class SessionEndDialogComponent implements OnInit {

    constructor(private dialogRef: MatDialogRef<SessionEndDialogComponent>, 
        public dialog: MatDialog,
        private router: Router,
        private tokenService: TokenService) {
        
    }

    actionPerformed(){
        this.tokenService.clearToken();
        this.dialog.closeAll();
        //this.router.navigateByUrl(environment.rootDomain);
        window.open(environment.rootDomain,"_self")
    }

    ngOnInit(): void {

    }
}
```

Guardar en `src/app/pages/full-pages/layout/components/session-end-dialog/session-end-dialog.component.ts`, luego `git rm src/app/system/admin/components/session-end-dialog/session-end-dialog.component.ts`.

- [ ] **Step 19: Crear `sidebar-top.component.ts`** (`navigation.service` a ruta nueva)

```ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavigationService } from 'app/pages/full-pages/layout/services/navigation.service';
// import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-sidebar-top',
  templateUrl: './sidebar-top.component.html'
})
export class SidebarTopComponent implements OnInit, OnDestroy, AfterViewInit {
  // private sidebarPS: PerfectScrollbar;
  public menuItems: any[];
  private menuItemsSub: Subscription;
  constructor(
    private navService: NavigationService
  ) { }

  ngOnInit() {
    this.menuItemsSub = this.navService.menuItems$.subscribe(items => {
      //this.menuItems = menuItem.filter(item => item.type !== 'icon' && item.type !== 'separator');
      this.menuItems = items;
    });
    //this.menuItems=this.navService.menuItems;
  }
  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.sidebarPS = new PerfectScrollbar('#sidebar-top-scroll-area', {
    //     suppressScrollX: true
    //   })
    // })
  }
  ngOnDestroy() {
    // if(this.sidebarPS) {
    //   this.sidebarPS.destroy();
    // }
    if( this.menuItemsSub ) {
      this.menuItemsSub.unsubscribe();
    }
  }

}
```

Guardar en `src/app/pages/full-pages/layout/components/sidebar-top/sidebar-top.component.ts`, luego `git rm src/app/system/admin/components/sidebar-top/sidebar-top.component.ts`.

- [ ] **Step 20: Crear `start-menu.component.ts`** (`navigation.service`/`auth.service` a rutas nuevas; `user.service` relativo sin cambios)

```ts
import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationService } from "app/pages/full-pages/layout/services/navigation.service";
import { AuthService } from "app/pages/full-pages/auth/services/auth.service";
import { Subscription } from "rxjs";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent implements OnInit,OnDestroy {
  public menuItems: any[];

  private menuItemsSub: Subscription;

  constructor(
    public user: UserService,
    private navService: NavigationService,
    public auth: AuthService
  ) { }

  ngOnDestroy(): void {
    if( this.menuItemsSub ) {
      this.menuItemsSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.menuItemsSub = this.navService.menuItems$.subscribe(items => {
      this.menuItems = items;
    });
    /*this.menuItemSub = this.navService.menuItems$
      .subscribe(res => {
        res = res.filter(item => item.type !== 'icon' && item.type !== 'separator');
        let limit = 4
        let mainItems: any[] = res.slice(0, limit)
        if (res.length <= limit) {
          return this.menuItems = mainItems
        }
        let subItems: any[] = res.slice(limit, res.length - 1)
        mainItems.push({
          name: 'More',
          type: 'dropDown',
          tooltip: 'More',
          icon: 'more_horiz',
          sub: subItems
        })
        return this.menuItems = mainItems
      })*/
  }

}
```

Guardar en `src/app/pages/full-pages/layout/components/start-menu/start-menu.component.ts`, luego `git rm src/app/system/admin/components/start-menu/start-menu.component.ts`.

- [ ] **Step 21: Crear `admin-layout.component.ts`** (`layout.service`/`theme.service`/`system_keys` a rutas nuevas; `admin.service` relativo sin cambios)

```ts
import { Component, OnInit, AfterViewInit, ViewChild, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { 
  Router, 
  NavigationEnd, 
  RouteConfigLoadStart, 
  RouteConfigLoadEnd, 
  ResolveStart, 
  ResolveEnd 
} from '@angular/router';
import { Subscription } from "rxjs";
import { filter } from 'rxjs/operators';
import { LocalStoreService } from 'app/core/data/local/local-store.service';
import { LayoutService } from 'app/pages/full-pages/layout/services/layout.service';
import { ThemeService } from 'app/pages/full-pages/layout/services/theme.service';
import { system_keys } from 'app/pages/full-pages/system-keys.config';
import { AdminService } from '../../services/admin.service';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, AfterViewInit {
  public isModuleLoading: Boolean = false;
  private moduleLoaderSub: Subscription;
  private layoutConfSub: Subscription;
  private routerEventSub: Subscription;

  public  scrollConfig = {}
  public layoutConf: any = {};
  public adminContainerClasses: any = {};
  
  constructor(
    private router: Router,
    //public translate: TranslateService,
    public themeService: ThemeService,
    public layout: LayoutService,
    private cdr: ChangeDetectorRef,
    private storage: LocalStoreService,
    private admin :AdminService
    //private jwtAuth: JwtAuthService
  ) {
    // Check Auth Token is valid
    //this.jwtAuth.checkTokenIsValid().subscribe();

    this.storage.removeItem(system_keys.act_lp);

    // Close sidenav after route change in mobile
    this.routerEventSub = router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((routeChange: NavigationEnd) => {
      this.layout.adjustLayout({ route: routeChange.url });
      this.scrollToTop();
    });
    
    // Translator init
    //const browserLang: string = translate.getBrowserLang();
    //translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
    // this.layoutConf = this.layout.layoutConf;
    this.layoutConfSub = this.layout.layoutConf$.subscribe((layoutConf) => {
        this.layoutConf = layoutConf;
        // console.log(this.layoutConf);
        
        this.adminContainerClasses = this.updateAdminContainerClasses(this.layoutConf);
        this.cdr.markForCheck();
    });

    // FOR MODULE LOADER FLAG
    this.moduleLoaderSub = this.router.events.subscribe(event => {
      if(event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
        this.isModuleLoading = true;
      }
      if(event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.isModuleLoading = false;
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.layout.adjustLayout(event);
  }
  
  ngAfterViewInit() {
    if(environment.production || (!environment.production && environment.devAd)){
      this.admin.openAdDialog(); //POPUP
    }
  }
  
  scrollToTop() {
    if(document) {
      setTimeout(() => {
        let element;
        if(this.layoutConf.topbarFixed) {
          element = <HTMLElement>document.querySelector('#rightside-content-hold');
        } else {
          element = <HTMLElement>document.querySelector('#main-content-wrap');
        }
        element.scrollTop = 0;
      })
    }
  }
  ngOnDestroy() {
    if(this.moduleLoaderSub) {
      this.moduleLoaderSub.unsubscribe();
    }
    if(this.layoutConfSub) {
      this.layoutConfSub.unsubscribe();
    }
    if(this.routerEventSub) {
      this.routerEventSub.unsubscribe();
    }
  }
  closeSidebar() {
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  sidebarMouseenter(e) {
    // console.log(this.layoutConf);
    if(this.layoutConf.sidebarStyle === 'compact') {
        this.layout.publishLayoutChange({sidebarStyle: 'full'}, {transitionClass: true});
    }
  }

  sidebarMouseleave(e) {
    // console.log(this.layoutConf);
    if (
        this.layoutConf.sidebarStyle === 'full' &&
        this.layoutConf.sidebarCompactToggle
    ) {
        this.layout.publishLayoutChange({sidebarStyle: 'compact'}, {transitionClass: true});
    }
  }

  updateAdminContainerClasses(layoutConf) {
    return {
      'navigation-top': layoutConf.navigationPos === 'top',
      'sidebar-full': layoutConf.sidebarStyle === 'full',
      'sidebar-compact': layoutConf.sidebarStyle === 'compact' && layoutConf.navigationPos === 'side',
      'compact-toggle-active': layoutConf.sidebarCompactToggle,
      'sidebar-compact-big': layoutConf.sidebarStyle === 'compact-big' && layoutConf.navigationPos === 'side',
      'sidebar-opened': layoutConf.sidebarStyle !== 'closed' && layoutConf.navigationPos === 'side',
      'sidebar-closed': layoutConf.sidebarStyle === 'closed',
      'fixed-topbar': layoutConf.topbarFixed && layoutConf.navigationPos === 'side'
    }
  }
  
}
```

Guardar en `src/app/pages/full-pages/layout/components/admin-layout/admin-layout.component.ts`, luego `git rm src/app/system/admin/views/admin-layout/admin-layout.component.ts`.

- [ ] **Step 22: Mover `desktop.component.ts` sin cambios (`git mv` — sus imports relativos `../../services/layout.service` y `../../services/navigation.service` se preservan sin tocar, incluyendo el `IShortcut` re-exportado)**

```bash
git mv src/app/system/admin/views/desktop/desktop.component.ts src/app/pages/full-pages/layout/components/desktop/desktop.component.ts
```

- [ ] **Step 23: Crear `layout.module.ts`**

```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from 'app/shared/shared.module';

import { HeaderTopComponent } from './components/header-top/header-top.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { StartMenuComponent } from './components/start-menu/start-menu.component';
import { AltUserDialogComponent } from './components/alt-user-dialog/alt-user-dialog.component';
import { AdDialogComponent } from './components/ad-dialog/ad-dialog.component';
import { SessionEndDialogComponent } from './components/session-end-dialog/session-end-dialog.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DesktopComponent } from './components/desktop/desktop.component';

import { AdminDirectivesModule } from './directives/admin-directives.module';

import { AdminGuard } from './guards/admin-guard.guard';
import { RouteGuard } from './guards/route-guard.guard';
import { DummyGuard } from './guards/dummy-guard.guard';
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';

const components = [
    HeaderTopComponent,
    SidebarTopComponent,
    SidenavComponent,
    NotificationsComponent,
    StartMenuComponent,
    AltUserDialogComponent,
    AdDialogComponent,
    SessionEndDialogComponent,
    AdminLayoutComponent,
    DesktopComponent
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FlexLayoutModule,
        NgScrollbarModule,
        AdminDirectivesModule,
        MaterialModule,
        SharedModule
    ],
    declarations: components,
    exports: components,
    providers: [
        AdminGuard,
        RouteGuard,
        DummyGuard,
        ThemeService,
        NavigationService
    ]
})
export class LayoutModule { }
```

- [ ] **Step 24: Barrido de imports — actualizar los ~143 archivos externos + los 2 imports temporales que quedaron pendientes de la Tarea 2**

```bash
cd "c:/Users/24681/Videos/DD/MIS-FUENTE"

declare -a PATTERNS=(
  "system/admin/services/admin.service|pages/full-pages/layout/services/admin.service"
  "system/admin/services/layout.service|pages/full-pages/layout/services/layout.service"
  "system/admin/services/navigation.service|pages/full-pages/layout/services/navigation.service"
  "system/admin/services/theme.service|pages/full-pages/layout/services/theme.service"
  "system/admin/services/user.service|pages/full-pages/layout/services/user.service"
  "system/admin/services/route-tracker.service|pages/full-pages/layout/services/route-tracker.service"
  "system/admin/guards/admin-guard.guard|pages/full-pages/layout/guards/admin-guard.guard"
  "system/admin/guards/dummy-guard.guard|pages/full-pages/layout/guards/dummy-guard.guard"
  "system/admin/guards/route-guard.guard|pages/full-pages/layout/guards/route-guard.guard"
  "system/admin/interceptors/http-interceptors|pages/full-pages/layout/interceptors/http-interceptors"
  "system/admin/views/admin-layout/admin-layout.component|pages/full-pages/layout/components/admin-layout/admin-layout.component"
  "system/admin/views/desktop/desktop.component|pages/full-pages/layout/components/desktop/desktop.component"
  "system/admin/directives/admin-directives.module|pages/full-pages/layout/directives/admin-directives.module"
)

for pair in "${PATTERNS[@]}"; do
  old="${pair%%|*}"
  new="${pair##*|}"
  files=$(grep -rlE "$old" src/app --include=*.ts || true)
  if [ -n "$files" ]; then
    echo "$files" | xargs sed -i "s#$old#$new#g"
  fi
done
```

- [ ] **Step 25: Corregir los 2 imports temporales que quedaron pendientes desde la Tarea 2**

```bash
grep -n "app/system/admin/services/admin.service" src/app/pages/full-pages/auth/guards/auth.guard.ts
grep -n "app/system/admin/services/navigation.service\|app/system/admin/services/user.service" src/app/pages/full-pages/auth/services/login.service.ts
```

Expected: el Step 24 ya los debería haber corregido (ambos archivos están bajo `src/app` y el barrido no excluye `pages/full-pages/`). Confirmar con los `grep` de arriba que NO queda salida — si aparece algo, es que el barrido no alcanzó esos 2 archivos por alguna razón y hay que corregirlos a mano con el mismo `sed` del Step 24.

- [ ] **Step 26: Actualizar `src/app/app.component.ts`**

```bash
sed -i "s#./system/admin/services/layout.service#./pages/full-pages/layout/services/layout.service#" src/app/app.component.ts
grep -n "layout.service" src/app/app.component.ts
```

Expected: la línea de import muestra la ruta nueva.

- [ ] **Step 27: Actualizar `src/app/app.module.ts`**

```ts
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { AuthModule } from './pages/full-pages/auth/auth.module';
import { LayoutModule } from './pages/full-pages/layout/layout.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { httpInterceptorProviders } from './pages/full-pages/layout/interceptors/http-interceptors';
import { RouteTrackerService } from './pages/full-pages/layout/services/route-tracker.service';
import { DatePipe } from '@angular/common';
import { RoutePartsService } from 'app/core/services/route-parts.service';
import { WinderService } from 'app/core/data/remote/winder/winder.service';
import { CypherService } from 'app/core/services/cypher.service';
import { RESTService } from 'app/core/data/remote/rest/rest.service';
import { ModSysAdminService } from 'app/core/data/remote/instances/mod-sys-admin.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule,
    LayoutModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    DatePipe,
    httpInterceptorProviders,
    RoutePartsService,
    WinderService,
    CypherService,
    RESTService,
    ModSysAdminService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private tracker: RouteTrackerService) {
    tracker.init();
  }
}
```

> Nota: aquí ya se adelanta la Tarea 4 (mover `RoutePartsService`/`WinderService`/`CypherService`/`RESTService`/`ModSysAdminService` a `AppModule.providers`) porque `SystemModule` deja de existir en este mismo paso — no tiene sentido crear un `SystemModule` reducido de un solo provider para borrarlo enseguida en la Tarea 4. `TokenService` se omite (ya es `providedIn:'root'`, confirmado en la investigación previa — su entrada en el `SystemModule` original era redundante).

- [ ] **Step 28: Actualizar `src/app/app-routing.module.ts`** (solo cambian los imports de `AdminLayoutComponent`, `DesktopComponent`, `RouteGuard`; el resto del archivo, tal como quedó en la Tarea 2, no cambia)

```bash
sed -i \
  -e "s#./system/admin/views/admin-layout/admin-layout.component#./pages/full-pages/layout/components/admin-layout/admin-layout.component#" \
  -e "s#./system/admin/views/desktop/desktop.component#./pages/full-pages/layout/components/desktop/desktop.component#" \
  -e "s#./system/admin/guards/route-guard.guard#./pages/full-pages/layout/guards/route-guard.guard#" \
  src/app/app-routing.module.ts
```

- [ ] **Step 29: Borrar `system.module.ts`, `system-components.ts` y todo lo que quede de `src/app/system/`**

```bash
git rm src/app/system/system.module.ts src/app/system/system-components.ts
find src/app/system -type f
# Expected: sin salida
```

Si `find` muestra algún archivo restante, es una señal de que algo del Step 2/6/8/12/15/22 no se movió — revisar contra la lista completa de archivos de `admin/` del mapeo de la Tarea 3 antes de continuar.

```bash
rm -rf src/app/system
```

- [ ] **Step 30: Grep final de verificación — cero referencias a `system/` en todo `src/`**

```bash
grep -rn "app/system/\|from ['\"]\./system\|from ['\"]\.\./system\|from ['\"]\.\./\.\./system" src/app --include=*.ts
```

Expected: sin salida (o solo la línea comentada `//import { secStructureConfig } from 'app/system/session/session-structure.config';` en `reva.component.ts`, que ya estaba muerta antes de esta migración y está fuera de alcance — ver Global Constraints).

- [ ] **Step 31: Build y test completo**

Run: `npm run build`
Expected: build en verde.

Run: `npx ng test --watch=false`
Expected: mismo conteo de tests pasando que antes de empezar toda la migración (Tareas 1-3 combinadas).

- [ ] **Step 32: Verificación manual del comportamiento (el build en verde no prueba runtime)**

Levantar la app (`npm start` o el comando que use el repo) y confirmar a mano:
- `/session/signin` carga el formulario de signin y el botón de login redirige a Google OAuth.
- Después de loguearse, `/app/desktop` muestra el layout con header, sidebar y shortcuts.
- El menú lateral, el selector de tema, el diálogo de "usuario alterno" y el logout funcionan.
- Navegar a una ruta protegida sin sesión redirige a login (probar en una pestaña nueva/incógnito).

- [ ] **Step 33: Commit**

```bash
git add -A -- src/app/pages/full-pages/layout src/app/pages/full-pages/auth \
  src/app/app.module.ts src/app/app-routing.module.ts src/app/app.component.ts
git add -u -- src/app/system
git status --short
# Confirmar que src/app/system ya no aparece (fue borrado) y que no queda nada con prefijo " M" suelto
git commit -m "$(cat <<'EOF'
refactor: migrar system/admin a pages/full-pages/layout, eliminar system/

Completa la migracion iniciada en la tarea anterior: layout.module.ts
consolida header/sidebar/desktop/dialogs de admin en components/services/
guards/interceptors/directives, con 4 interfaces extraidas
(ILayoutConf, IMenuItem/IChildItem, IShortcut/IBadge, ITheme). Los 5
servicios de infraestructura generica (WinderService, CypherService,
RESTService, RoutePartsService, ModSysAdminService) pasan a
AppModule.providers directo. src/app/system/ queda eliminado por
completo; cero referencias residuales verificadas con grep.
EOF
)"
```

---

## Self-Review

**1. Cobertura del spec:**
- División auth/layout ✓ (Tareas 2 y 3).
- Carpetas propias guards/interceptors/directives ✓ (presentes en ambos módulos donde aplica).
- Extracción de interfaces inline ✓ (Task 3 Step 1, 4 archivos).
- `auth/` como módulo eager único, signin ya no lazy ✓ (Task 2 Step 16).
- `system-keys.config.ts` compartido en `pages/full-pages/` ✓ (Task 1).
- Acoplamiento auth⇄layout preservado vía imports absolutos ✓ (documentado en cada archivo con cruce, Tareas 2 y 3).
- Nada de limpieza de código muerto/naming/hardcoded emails ✓ (todo el contenido copiado preserva comentarios y el allowlist de `dummy-guard.guard.ts` tal cual).
- Barrido completo de las ~156 referencias externas + wiring de `app.module`/`app-routing`/`app.component` ✓ (Task 3 Steps 24-28).
- Verificación final sin referencias residuales a `system/` ✓ (Task 3 Step 30).

**2. Placeholders:** ninguno — cada Create/Modify tiene contenido completo o comando exacto, no hay "TODO"/"similar a".

**3. Consistencia de tipos:** `IMenuItem`/`IChildItem`/`IShortcut`/`IBadge`/`ITheme`/`ILayoutConf`/`ILayoutChangeOptions` usan el mismo nombre en su archivo de definición (`interfaces/*.ts`) y en cada re-export (`services/*.service.ts`) — verificado línea por línea al escribir cada Step.

**4. Riesgo identificado y mitigado durante la escritura de este plan (no estaba en el spec original):** `session-end-dialog.component.ts` tiene un import de `AuthService` sin usar que el inventario inicial (agente Explore) no reportó — encontrado al leer el archivo completo antes de escribir la Tarea 2. Se agregó a la lista de 9 archivos con cruce admin→session (antes eran 8 en el spec).
