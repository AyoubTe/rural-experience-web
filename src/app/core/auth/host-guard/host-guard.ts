import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '@rxp/core/auth/auth-service';
import {inject} from '@angular/core';

export const hostGuard: CanActivateFn = (route, state) => {

  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.hasRole('HOST') || auth.hasRole('ADMIN')) {
    return true;
  }

  // Explorer trying to access host area — redirect home
  return router.createUrlTree(['/']);
};
