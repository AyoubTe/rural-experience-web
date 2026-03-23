import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiError } from '@rxp/core/models/api.model';

export function handleApiError(
  error: HttpErrorResponse
): Observable<never> {

  if (error.status === 0) {
    return throwError(() => new Error(
      'Cannot reach the server. Check your connection.'
    ));
  }

  // Try to parse the Spring Boot error body
  const apiError = error.error as Partial<ApiError>;

  const message = apiError?.message
    ?? defaultMessageFor(error.status);

  return throwError(() => Object.assign(
    new Error(message), {
      status:      error.status,
      fieldErrors: apiError?.fieldErrors ?? [],
    }
  ));
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400: return $localize`:@@error.400:
      The request was invalid. Please check your input.`;
    case 401: return $localize`:@@error.401:
      Please log in to continue.`;
    case 403: return $localize`:@@error.403:
      You do not have permission to perform this action.`;
    case 404: return $localize`:@@error.404:
      The requested resource was not found.`;
    case 409: return $localize`:@@error.409:
      This action conflicts with an existing record.`;
    case 422: return $localize`:@@error.422:
      Validation failed. Please check your input.`;
    case 429: return $localize`:@@error.429:
      Too many requests. Please wait a moment.`;
    case 503: return $localize`:@@error.503:
      The service is temporarily unavailable. Please try again.`;
    default:  return $localize`:@@error.default:
      Something went wrong. Please try again.`;
  }
}
