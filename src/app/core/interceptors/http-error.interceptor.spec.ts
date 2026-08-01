import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { HttpErrorInterceptor, HTTP_ERROR_TIMEOUT_MS } from './http-error.interceptor';
import { HttpErrorService } from 'app/core/services/http-error.service';

const ANT_URL = 'https://stg.confianza.pe/cores2/ant/v1/g';
const NON_ANT_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

describe('HttpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorService: jasmine.SpyObj<HttpErrorService>;

  beforeEach(() => {
    errorService = jasmine.createSpyObj('HttpErrorService', ['handle']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HttpErrorService, useValue: errorService },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deja pasar una respuesta exitosa del dominio Ant sin tocar el servicio de errores', () => {
    let result: any;
    http.get(ANT_URL).subscribe((r) => (result = r));

    httpMock.expectOne(ANT_URL).flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(errorService.handle).not.toHaveBeenCalled();
  });

  it('no intercepta requests fuera del dominio Ant (ni siquiera si fallan)', () => {
    let receivedError: any;
    http.get(NON_ANT_URL).subscribe({ error: (e) => (receivedError = e) });

    httpMock.expectOne(NON_ANT_URL).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(errorService.handle).not.toHaveBeenCalled();
    expect(receivedError).toBeTruthy();
  });

  it('ante un error HTTP del dominio Ant, delega en HttpErrorService y sigue propagando el error al subscriber', () => {
    errorService.handle.and.callFake((e: any) => throwError(e));

    let receivedError: any;
    http.get(ANT_URL).subscribe({ error: (e) => (receivedError = e) });

    httpMock.expectOne(ANT_URL).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(errorService.handle).toHaveBeenCalled();
    expect(receivedError).toBeTruthy();
    expect(receivedError.status).toBe(500);
  });

  it('corta la request del dominio Ant si no responde dentro del timeout y delega en HttpErrorService', fakeAsync(() => {
    errorService.handle.and.callFake((e: any) => throwError(e));

    let receivedError: any;
    http.get(ANT_URL).subscribe({ error: (e) => (receivedError = e) });

    httpMock.expectOne(ANT_URL);
    tick(HTTP_ERROR_TIMEOUT_MS + 1);

    expect(errorService.handle).toHaveBeenCalled();
    expect(receivedError).toBeTruthy();
    expect(receivedError.name).toBe('TimeoutError');
    // el operador timeout() cancela/desuscribe la request al vencer el plazo, así que
    // httpMock no la considera "pendiente" y no hace falta (ni se puede) hacer flush() acá.
  }));
});
