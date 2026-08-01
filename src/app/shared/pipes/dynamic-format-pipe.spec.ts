import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DynamicFormatPipe } from './dynamic-format-pipe';

/**
 * Estos formatters arman HTML por concatenación de strings a partir de `value`
 * (datos que vienen del backend, ver doc/informe-falencias-mejoras.md punto 18) y hoy
 * envuelven el resultado con `DomSanitizer.bypassSecurityTrustHtml`, desactivando el
 * sanitizador de Angular. `sanitizer.sanitize(SecurityContext.HTML, result)` es exactamente
 * lo que Angular hace internamente al resolver un binding `[innerHTML]`, así que sirve para
 * probar, sin renderizar un componente, si el binding real dejaría pasar el payload.
 */
describe('DynamicFormatPipe', () => {
  let pipe: DynamicFormatPipe;
  let sanitizer: DomSanitizer;

  const xssPayload = '"><img src=x onerror=alert(1)>';

  function renderedHtml(value: any): string {
    return sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [DynamicFormatPipe]
    });
    pipe = TestBed.inject(DynamicFormatPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  describe('link', () => {
    it('sanitiza un payload XSS que venga en el valor del backend', () => {
      const html = renderedHtml(pipe.link(xssPayload, {}));
      expect(html).not.toContain('onerror');
    });

    it('preserva el formateo normal (span.stg-link) para un valor benigno', () => {
      const html = renderedHtml(pipe.link('Ver detalle', {}));
      expect(html).toContain('stg-link');
      expect(html).toContain('Ver detalle');
    });

    it('usa la clase stg-link2 cuando underline=true', () => {
      const html = renderedHtml(pipe.link('Ver detalle', { underline: true }));
      expect(html).toContain('stg-link2');
    });
  });

  describe('chip', () => {
    const params = {
      contStyleFn: () => 'background:#fff',
      textStyleFn: () => 'color:#000',
      format: 'decimal'
    };

    it('sanitiza un payload XSS que venga en el valor del backend', () => {
      const html = renderedHtml(pipe.chip(xssPayload as any, params, {}, 'k'));
      expect(html).not.toContain('onerror');
    });

    it('preserva el formateo decimal para un valor benigno', () => {
      const html = renderedHtml(pipe.chip(1234.5, params, {}, 'k'));
      expect(html).toContain('1,234.5');
    });
  });

  describe('icon', () => {
    it('sanitiza un payload XSS que venga en el valor del backend (google)', () => {
      const html = renderedHtml(pipe.icon(xssPayload, { src: 'google' }));
      expect(html).not.toContain('onerror');
    });

    it('preserva el ícono material para un valor benigno', () => {
      const html = renderedHtml(pipe.icon('home', { src: 'google' }));
      expect(html).toContain('material-icons');
      expect(html).toContain('home');
    });
  });

  describe('integer', () => {
    it('sanitiza un payload XSS cuando params.link=true', () => {
      const html = renderedHtml(pipe.integer(xssPayload as any, { link: true }));
      expect(html).not.toContain('onerror');
    });

    it('preserva el formateo numérico con link', () => {
      const html = renderedHtml(pipe.integer(1234 as any, { link: true }));
      expect(html).toContain('stg-link');
      expect(html).toContain('1,234');
    });

    it('sin params.link devuelve solo el número formateado (sin cambios)', () => {
      expect(pipe.integer(1234 as any, {})).toBe('1,234');
    });
  });

  describe('decimal', () => {
    it('sanitiza un payload XSS cuando params.link2=true', () => {
      const html = renderedHtml(pipe.decimal(xssPayload as any, { link2: true }));
      expect(html).not.toContain('onerror');
    });

    it('preserva el formateo decimal con link2', () => {
      const html = renderedHtml(pipe.decimal(12.3456 as any, { link2: true }));
      expect(html).toContain('stg-link2');
      expect(html).toContain('12.35');
    });
  });

  describe('percent', () => {
    it('sanitiza un payload XSS cuando params.link=true', () => {
      const html = renderedHtml(pipe.percent(xssPayload as any, { link: true }));
      expect(html).not.toContain('onerror');
    });

    it('sanitiza un payload XSS cuando se usa trafficFn', () => {
      const html = renderedHtml(
        pipe.percent(xssPayload as any, { trafficFn: () => 'verde' })
      );
      expect(html).not.toContain('onerror');
    });

    it('preserva el formateo porcentual con link', () => {
      const html = renderedHtml(pipe.percent(0.1234, { link: true }));
      expect(html).toContain('stg-link');
      expect(html).toContain('12.34%');
    });

    it('preserva el semáforo con trafficFn', () => {
      const html = renderedHtml(pipe.percent(0.5, { trafficFn: () => 'verde' }));
      expect(html).toContain('stg-verde-icon');
      expect(html).toContain('50.00%');
    });
  });

  describe('trafficlight', () => {
    it('preserva el semáforo verde para value=1 (sin datos de usuario involucrados)', () => {
      const html = renderedHtml(pipe.trafficlight(1, ''));
      expect(html).toContain('stg-green-icon');
    });
  });

  describe('truncate', () => {
    it('sanitiza un payload XSS cuando params.link=true', () => {
      const html = renderedHtml(pipe.truncate(xssPayload, { link: true }));
      expect(html).not.toContain('onerror');
    });

    it('preserva el truncado + link para un valor benigno largo', () => {
      const longValue = 'a'.repeat(40);
      const html = renderedHtml(pipe.truncate(longValue, { link: true }));
      expect(html).toContain('stg-link');
      expect(html).toContain('...');
    });

    it('sin params.link devuelve el string truncado plano (sin cambios)', () => {
      const longValue = 'a'.repeat(40);
      expect(pipe.truncate(longValue, {})).toBe('a'.repeat(25 - 3) + '...');
    });
  });
});
