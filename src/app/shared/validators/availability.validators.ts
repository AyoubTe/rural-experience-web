import {
  AbstractControl, AsyncValidatorFn, ValidationErrors
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first }
  from 'rxjs/operators';
import { inject } from '@angular/core';
import { BookingService } from
    '@rxp/features/booking/booking-service';

/**
 * Async validator: checks that the selected dates are available
 * for the experience by calling the Spring Boot API.
 */
export function availabilityValidators(
  experienceId: number
): AsyncValidatorFn {
  const bookingService = inject(BookingService);

  return (group: AbstractControl): Observable<ValidationErrors | null> => {
    const startDate = group.get('startDate')?.value;
    const endDate   = group.get('endDate')?.value;
    const guests    = group.get('numberOfGuests')?.value;

    if (!startDate || !endDate || !guests) return of(null);

    return of(null).pipe(
      debounceTime(500),   // Don't check on every keystroke
      switchMap(() =>
        bookingService.checkAvailability(
          experienceId, { startDate, endDate, guests }
        )
      ),
      map(available =>
        available ? null : { unavailable: true }
      ),
      catchError(() => of(null)),  // Don't block on API error
      first(),  // Complete after one emission
    );
  };
}
