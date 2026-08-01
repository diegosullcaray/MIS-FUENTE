import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ExternalRedirectComponent } from './external-redirect.component';
import { SessionLoaderService } from 'app/shared/services/session-loader.service';

describe('ExternalRedirectComponent', () => {
  let fixture: ComponentFixture<ExternalRedirectComponent>;
  let sessionLoader: jasmine.SpyObj<SessionLoaderService>;

  function build(data: any) {
    sessionLoader = jasmine.createSpyObj('SessionLoaderService', ['show', 'hide']);

    TestBed.configureTestingModule({
      declarations: [ExternalRedirectComponent],
      providers: [
        { provide: SessionLoaderService, useValue: sessionLoader },
        { provide: ActivatedRoute, useValue: { snapshot: { data } } }
      ]
    });

    fixture = TestBed.createComponent(ExternalRedirectComponent);
    spyOn(fixture.componentInstance as any, 'redirect');
  }

  it('toma la URL de destino de route.data en vez de tenerla fija en el componente compartido', fakeAsync(() => {
    build({ redirectUrl: 'https://ejemplo.pe/destino' });
    fixture.detectChanges();
    tick(4000);
    expect((fixture.componentInstance as any).redirect).toHaveBeenCalledWith('https://ejemplo.pe/destino');
  }));

  it('muestra el loader de marca antes de salir de la SPA, en vez de dejar el texto crudo "Redirecting..." en pantalla', () => {
    build({ redirectUrl: 'https://ejemplo.pe/destino' });
    fixture.detectChanges();
    expect(sessionLoader.show).toHaveBeenCalledWith('Redirigiendo...');
  });

  it('usa el mensaje de route.data si se especifica uno distinto del genérico', () => {
    build({ redirectUrl: 'https://ejemplo.pe/destino', message: 'Yendo a Ejemplo...' });
    fixture.detectChanges();
    expect(sessionLoader.show).toHaveBeenCalledWith('Yendo a Ejemplo...');
  });

  it('no redirige de inmediato: espera con el loader visible antes de salir', fakeAsync(() => {
    build({ redirectUrl: 'https://ejemplo.pe/destino' });
    fixture.detectChanges();
    expect((fixture.componentInstance as any).redirect).not.toHaveBeenCalled();
    tick(4000);
  }));

  it('respeta un delayMs propio de route.data en vez del default de 4s', fakeAsync(() => {
    build({ redirectUrl: 'https://ejemplo.pe/destino', delayMs: 1000 });
    fixture.detectChanges();
    tick(1000);
    expect((fixture.componentInstance as any).redirect).toHaveBeenCalledWith('https://ejemplo.pe/destino');
  }));
});
