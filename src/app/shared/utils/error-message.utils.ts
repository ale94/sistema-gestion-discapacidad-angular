import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const error = err.error as { detail?: unknown; message?: unknown; title?: unknown } | null;

    const detail = typeof error?.detail === 'string' && error.detail.trim() ? error.detail : null;
    if (detail) return detail;

    const message = typeof error?.message === 'string' && error.message.trim() ? error.message : null;
    if (message) return message;

    const title = typeof error?.title === 'string' && error.title.trim() ? error.title : null;
    if (title) return title;

    switch (err.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';
      case 400:
        return 'La solicitud no pudo procesarse. Verifique los datos ingresados.';
      case 401:
        return 'Su sesión expiró o no tiene permisos. Inicie sesión nuevamente.';
      case 403:
        return 'No tiene permisos para realizar esta operación.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return 'La operación entra en conflicto con los datos existentes.';
      case 500:
        return 'Ocurrió un error interno en el servidor. Intente nuevamente.';
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return 'Ocurrió un error inesperado. Intente nuevamente.';
}
