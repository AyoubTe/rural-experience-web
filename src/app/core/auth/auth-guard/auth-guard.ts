import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '@rxp/core/auth/auth-service';

/**
 * Prevents navigation to protected routes when not authenticated.
 * Redirects to /auth/login with the intended URL as a return param.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirect after login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
