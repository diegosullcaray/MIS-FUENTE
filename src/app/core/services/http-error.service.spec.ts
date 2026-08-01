import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { HttpErrorService } from './http-error.service';
import { StgAlertService } from 'app/shared/components/stg-alert/stg-alert.service';
import { StgAppLoaderService } from 'app/shared/components/stg-app-loader/stg-app-loader.service';

describe('HttpErrorService', () => {
  let service: HttpErrorService;
  let alertService: jasmine.SpyObj<StgAlertService>;
  let loaderService: jasmine.SpyObj<StgAppLoaderService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    alertService = jasmine.createSpyObj('StgAlertService', ['open']);
    loaderService = jasmine.createSpyObj('StgAppLoaderService', ['close']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        HttpErrorService,
        { provide: StgAlertService, useValue: alertService },
        { provide: StgAppLoaderService, useValue: loaderService },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(HttpErrorService);
  });

  it('cierra cualquier loader abierto ante cualquier tipo de error', (done) => {
    const err = new HttpErrorResponse({ status: 500 });

    service.handle(err).subscribe({
      error: () => {
        expect(loaderService.close).toHaveBeenCalled();
        done();
      }
    });
  });

  it('propaga el error original al subscriber (no lo silencia)', (done) => {
    const err = new HttpErrorResponse({ status: 500 });

    service.handle(err).subscribe({
      error: (e) => {
        expect(e).toBe(err);
        done();
      }
    });
  });

  describe('errores no severos (timeout, sin conexión, 4xx recuperables) — diálogo liviano', () => {
    it('muestra un mensaje genérico ante un error de backend, sin exponer el detalle crudo', (done) => {
      const rawBackendDetail = 'ORA-00942: table or view does not exist at line 42';
      const err = new HttpErrorResponse({ status: 400, error: { message: rawBackendDetail } });

      service.handle(err).subscribe({
        error: () => {
          expect(alertService.open).toHaveBeenCalled();
          const message = alertService.open.calls.mostRecent().args[1] as string;
          expect(message).not.toContain(rawBackendDetail);
          expect(router.navigateByUrl).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('muestra un mensaje distinto para error de conexión (status 0), no navega a la error page', (done) => {
      const err = new HttpErrorResponse({ status: 0 });

      service.handle(err).subscribe({
        error: () => {
          const message = alertService.open.calls.mostRecent().args[1] as string;
          expect(message.toLowerCase()).toContain('conex');
          expect(router.navigateByUrl).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('muestra un mensaje distinto cuando la operación excede el timeout, no navega a la error page', (done) => {
      const err = new TimeoutError();

      service.handle(err).subscribe({
        error: () => {
          const message = alertService.open.calls.mostRecent().args[1] as string;
          expect(message.toLowerCase()).toContain('tardó');
          expect(router.navigateByUrl).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('errores severos (404, 5xx del backend) — página de error completa', () => {
    it('navega a /error/404 ante un 404 y no abre el diálogo liviano', (done) => {
      const err = new HttpErrorResponse({ status: 404 });

      service.handle(err).subscribe({
        error: () => {
          expect(router.navigateByUrl).toHaveBeenCalledWith('/error/404');
          expect(alertService.open).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('navega a /error/500 ante un 500', (done) => {
      const err = new HttpErrorResponse({ status: 500 });

      service.handle(err).subscribe({
        error: () => {
          expect(router.navigateByUrl).toHaveBeenCalledWith('/error/500');
          expect(alertService.open).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('navega a /error/503 ante un 503', (done) => {
      const err = new HttpErrorResponse({ status: 503 });

      service.handle(err).subscribe({
        error: () => {
          expect(router.navigateByUrl).toHaveBeenCalledWith('/error/503');
          done();
        }
      });
    });

    it('cierra el loader también en el camino de navegación (no solo en el del diálogo)', (done) => {
      const err = new HttpErrorResponse({ status: 500 });

      service.handle(err).subscribe({
        error: () => {
          expect(loaderService.close).toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
