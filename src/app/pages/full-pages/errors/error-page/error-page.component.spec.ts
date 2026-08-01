import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorPageComponent } from './error-page.component';

describe('ErrorPageComponent', () => {
  let fixture: ComponentFixture<ErrorPageComponent>;
  let router: jasmine.SpyObj<Router>;

  function build(code: string | null) {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [MatIconModule, NoopAnimationsModule],
      declarations: [ErrorPageComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(code ? { code } : {}) } }
        }
      ]
    });
    fixture = TestBed.createComponent(ErrorPageComponent);
    fixture.detectChanges();
  }

  it('resuelve y muestra el contenido correspondiente al código de la ruta (404)', () => {
    build('404');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Página no encontrada');
  });

  it('resuelve y muestra el contenido genérico cuando no hay código en la ruta', () => {
    build(null);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Ocurrió un error');
  });

  it('goHome() navega a environment.homePage', () => {
    build('500');
    fixture.componentInstance.goHome();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/desktop');
  });
});
