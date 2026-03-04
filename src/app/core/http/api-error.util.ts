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
  switch (true) {
    case status === 400: return 'Invalid request. Check your input.';
    case status === 401: return 'Please log in to continue.';
    case status === 403: return 'You do not have permission.';
    case status === 404: return 'The requested resource was not found.';
    case status === 409: return 'A conflict occurred.';
    case status >= 500:  return 'Server error. Please try again.';
    default:             return 'An unexpected error occurred.';
  }
}
