import { ErrorContentService } from './error-content.service';

describe('ErrorContentService', () => {
  let service: ErrorContentService;

  beforeEach(() => {
    service = new ErrorContentService();
  });

  it('devuelve contenido específico de "no encontrado" para 404', () => {
    const c = service.resolve('404');
    expect(c.title.toLowerCase()).toContain('no encontrada');
  });

  it('devuelve contenido específico de "servicio no disponible" para 503', () => {
    const c = service.resolve('503');
    expect(c.title.toLowerCase()).toContain('no disponible');
  });

  it('devuelve contenido de "error del servidor" para 500', () => {
    const c = service.resolve('500');
    expect(c.title.toLowerCase()).toContain('servidor');
  });

  it('cualquier otro 5xx sin entrada específica cae en "error del servidor" (no en el genérico)', () => {
    const c = service.resolve('502');
    expect(c.title.toLowerCase()).toContain('servidor');
  });

  it('un código no reconocido (ni 404 ni 5xx) devuelve el contenido genérico', () => {
    const c = service.resolve('418');
    expect(c.title).toBe('Ocurrió un error');
  });

  it('sin código (null/undefined) devuelve el contenido genérico', () => {
    expect(service.resolve(null).title).toBe('Ocurrió un error');
    expect(service.resolve(undefined).title).toBe('Ocurrió un error');
  });

  it('un código no numérico devuelve el contenido genérico, sin romper', () => {
    expect(service.resolve('abc').title).toBe('Ocurrió un error');
  });
});
