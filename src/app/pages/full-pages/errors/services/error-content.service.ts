import { Injectable } from '@angular/core';
import { ErrorContent } from '../interfaces/error-content.interface';

const KNOWN_ERRORS: Record<string, ErrorContent> = {
  '404': {
    icon: 'search_off',
    title: 'Página no encontrada',
    message: 'La página o el recurso que buscás no existe o fue movido.'
  },
  '503': {
    icon: 'cloud_off',
    title: 'Servicio no disponible',
    message: 'El servicio no está disponible en este momento. Probá de nuevo más tarde.'
  },
  '500': {
    icon: 'error_outline',
    title: 'Error del servidor',
    message: 'Ocurrió un problema en el servidor. Probá de nuevo en unos minutos.'
  }
};

const DEFAULT_ERROR: ErrorContent = {
  icon: 'error_outline',
  title: 'Ocurrió un error',
  message: 'Algo salió mal. Volvé al inicio e intentá de nuevo.'
};

/**
 * `code` llega como string desde el parámetro de ruta `/error/:code` (ver HttpErrorService,
 * que navega ahí con el status HTTP tal cual). Cualquier 5xx sin entrada propia cae en el
 * mensaje genérico de "error del servidor" en vez del genérico total, para no perder la
 * pista de que el problema es del lado del servidor.
 */
@Injectable({ providedIn: 'root' })
export class ErrorContentService {
  resolve(code: string | null | undefined): ErrorContent {
    if (code === '404') {
      return KNOWN_ERRORS['404'];
    }
    if (code === '503') {
      return KNOWN_ERRORS['503'];
    }
    const numeric = Number(code);
    if (!isNaN(numeric) && numeric >= 500) {
      return KNOWN_ERRORS['500'];
    }
    return DEFAULT_ERROR;
  }
}
