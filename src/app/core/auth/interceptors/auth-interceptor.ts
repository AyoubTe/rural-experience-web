import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '@rxp/core/auth/auth-service';
/**
 * Attaches the JWT access token to every outgoing API request.
 * Skips auth-related endpoints (login, register, refresh).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth  = inject(AuthService);
    const token = auth.getAccessToken();

    // Skip token attachment for auth endpoints
    const isAuthEndpoint =
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh');

    if (!token || isAuthEndpoint) {
      return next(req);
    }

    // Clone the request and add the Authorization header
    // (requests are immutable — must clone to modify)
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq);
};
