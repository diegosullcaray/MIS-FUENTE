import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { HttpErrorService } from 'app/core/services/http-error.service';

/**
 * Reportes de negocio pueden tardar; 30s es margen suficiente para no cortar una consulta
 * pesada legítima, pero evita que un backend colgado deje la UI esperando indefinidamente
 * (ver doc/informe-falencias-mejoras.md punto 24).
 */
export const HTTP_ERROR_TIMEOUT_MS = 30000;

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private httpErrorService: HttpErrorService) { }

  private isAntDomain(url: string): boolean {
    return url.startsWith(environment.requestConfigRootURL);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isAntDomain(request.url)) {
      return next.handle(request);
    }
    return next.handle(request).pipe(
      timeout(HTTP_ERROR_TIMEOUT_MS),
      catchError((error) => this.httpErrorService.handle(error))
    );
  }
}
