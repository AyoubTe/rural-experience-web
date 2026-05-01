import { inject }          from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { Experience }        from '@rxp/core/models/experience.model';
import {ExperienceService} from '@rxp/features/experience/experience-service';

/**
 * Resolves an experience before the route activates.
 * If the experience doesn't exist, redirects to 404.
 */
export const experienceResolver: ResolveFn<Experience> =
  (route) => {
    const service = inject(ExperienceService);
    const router  = inject(Router);

    const id = Number(route.paramMap.get('id'));

    return service.getById(id).pipe(
      catchError(() => {
        router.navigate(['/404']);
        return EMPTY;  // Cancel the navigation
      }),
    );
  };
