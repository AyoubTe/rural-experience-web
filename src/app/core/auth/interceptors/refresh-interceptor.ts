import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from '@rxp/core/auth/auth-service';
import {inject} from '@angular/core';
import {catchError, switchMap, throwError} from 'rxjs';

/**
 * Intercepts 401 responses, refreshes the access token,
 * and retries the original request exactly once.
 */
export const refreshInterceptor: HttpInterceptorFn =
  (req, next) => {
    const auth = inject(AuthService);

    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Only handle 401 — and not on the refresh endpoint itself
        // (avoids infinite refresh loops)
        const isRefreshCall = req.url.includes('/auth/refresh');
        const isAuthCall    = req.url.includes('/auth/login')
          || req.url.includes('/auth/register');

        if (error.status !== 401 || isRefreshCall || isAuthCall) {
          return throwError(() => error);
        }

        // Attempt to refresh the token
        return auth.refresh().pipe(
          switchMap(response => {
            // Replay the original request with the new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh failed — auth.refresh() already called logout()
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  };
