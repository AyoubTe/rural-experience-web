import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '@rxp/core/auth/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {

  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.hasRole('ADMIN')
    ? true
    : router.createUrlTree(['/']);
};
