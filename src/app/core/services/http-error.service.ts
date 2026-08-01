import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { StgAlertService } from 'app/shared/components/stg-alert/stg-alert.service';
import { StgAppLoaderService } from 'app/shared/components/stg-app-loader/stg-app-loader.service';
import { printError } from 'app/core/helpers/debug.util';

/**
 * Punto único donde una request al backend Ant que falla (error HTTP o timeout) se
 * traduce en feedback real para el usuario, en vez de fallar en silencio (ver
 * doc/informe-falencias-mejoras.md punto 24). No reemplaza el manejo de error que ya
 * tenga un componente puntual — sigue propagando el error original para que ese
 * `.subscribe({ error: ... })` siga funcionando igual que antes.
 *
 * Errores "severos" (404/5xx: la app o el backend no pueden responder, no es que una
 * operación puntual haya fallado) navegan a una página de error de pantalla completa en
 * vez del diálogo liviano — sacar al usuario de la pantalla actual solo tiene sentido
 * cuando esa pantalla ya no puede funcionar.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorService {
  constructor(
    private alertService: StgAlertService,
    private loaderService: StgAppLoaderService,
    private router: Router
  ) { }

  public handle(error: unknown): Observable<never> {
    this.loaderService.close();
    printError('Error HTTP no manejado por el componente', error);

    const severeStatus = this.severeStatus(error);
    if (severeStatus !== undefined) {
      this.router.navigateByUrl('/error/' + severeStatus);
    } else {
      this.alertService.open('Ocurrió un problema', this.messageFor(error));
    }
    return throwError(error);
  }

  private severeStatus(error: unknown): number | undefined {
    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status >= 500)) {
      return error.status;
    }
    return undefined;
  }

  private messageFor(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'La operación tardó demasiado y fue cancelada. Intentá nuevamente.';
    }
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'No se pudo establecer conexión con el servidor. Revisá tu conexión e intentá nuevamente.';
    }
    return 'Ocurrió un error al procesar la solicitud. Intentá nuevamente en unos minutos.';
  }
}
