import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SessionLoaderService } from "app/shared/services/session-loader.service";

const DEFAULT_MESSAGE = 'Redirigiendo...';
const DEFAULT_DELAY_MS = 4000;

export interface ExternalRedirectRouteData {
    redirectUrl: string;
    message?: string;
    delayMs?: number;
}

/**
 * Placeholder de ruta genérico para cuando la navegación real es salir de la SPA hacia un
 * sitio externo — muestra el loader de marca (`SessionLoaderService`) unos segundos en vez
 * de dejar al usuario en una pantalla en blanco mientras el navegador procesa el redirect.
 * El destino sale de `route.data` (ver `ExternalRedirectRouteData`) para no atar este
 * componente compartido a una URL de negocio puntual — esa configuración vive en la ruta
 * que lo usa (p. ej. `app-routing.module.ts` para "Imparables").
 */
@Component({
    selector: 'app-external-redirect',
    templateUrl: './external-redirect.component.html'
})
export class ExternalRedirectComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private sessionLoader: SessionLoaderService
    ) { }

    ngOnInit(): void {
        const data = this.route.snapshot.data as ExternalRedirectRouteData;
        this.sessionLoader.show(data.message || DEFAULT_MESSAGE);
        setTimeout(() => this.redirect(data.redirectUrl), data.delayMs || DEFAULT_DELAY_MS);
    }

    protected redirect(url: string): void {
        window.location.href = url;
    }
}
