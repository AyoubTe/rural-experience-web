import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router }       from '@angular/router';
import {
  switchMap, map, catchError, tap, exhaustMap
} from 'rxjs/operators';
import { of } from 'rxjs';

import * as BookingActions from './booking.actions';
import {BookingService} from '@rxp/features/booking/booking-service';

@Injectable()
export class BookingEffects {

  private actions$ = inject(Actions);
  private svc      = inject(BookingService);
  private router   = inject(Router);

  // ── Load my my-bookings ──────────────────────────────────────────
  loadMyBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadMyBookings),
      switchMap(({ page, size }) =>
        this.svc.getMyBookings(page ?? 0, size ?? 10)
          .pipe(
            map(response =>
              BookingActions.loadMyBookingsSuccess({ response })
            ),
            catchError((err: Error) =>
              of(BookingActions.loadMyBookingsFailure({
                error: err.message,
              }))
            ),
          )
      ),
    )
  );

  // ── Load host my-bookings ────────────────────────────────────────
  loadHostBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadHostBookings),
      switchMap(({ page }) =>
        this.svc.getHostBookings(page ?? 0, 20)
          .pipe(
            map(response =>
              BookingActions.loadHostBookingsSuccess({ response })
            ),
            catchError((err: Error) =>
              of(BookingActions.loadHostBookingsFailure({
                error: err.message,
              }))
            ),
          )
      ),
    )
  );

  // ── Cancel booking ────────────────────────────────────────────
  // Uses exhaustMap: if user rapidly clicks cancel,
  // only the first click triggers an API call
  cancelBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.cancelBooking),
      exhaustMap(({ bookingId }) =>
        this.svc.cancelBooking(bookingId).pipe(
          map(() =>
            BookingActions.cancelBookingSuccess({ bookingId })
          ),
          catchError((err: Error) =>
            of(BookingActions.cancelBookingFailure({
              bookingId,
              error: err.message,
            }))
          ),
        )
      ),
    )
  );

  // ── Confirm booking (host) ────────────────────────────────────
  confirmBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.confirmBooking),
      switchMap(({ bookingId }) =>
        this.svc.confirmBooking(bookingId).pipe(
          map(booking =>
            BookingActions.confirmBookingSuccess({ booking })
          ),
          catchError((err: Error) =>
            of(BookingActions.confirmBookingFailure({
              bookingId, error: err.message,
            }))
          ),
        )
      ),
    )
  );

  // ── Decline booking (host) ────────────────────────────────────
  declineBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.declineBooking),
      switchMap(({ bookingId, reason }) =>
        this.svc.declineBooking(bookingId, reason).pipe(
          map(() =>
            BookingActions.declineBookingSuccess({ bookingId })
          ),
          catchError((err: Error) =>
            of(BookingActions.declineBookingFailure({
              bookingId, error: err.message,
            }))
          ),
        )
      ),
    )
  );

  // ── Non-dispatching effect: navigate after successful cancel ──
  cancelSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BookingActions.cancelBookingSuccess),
        tap(() => {
          // Show success notification (Chapter 12 adds MatSnackBar)
          console.log('Booking cancelled');
        }),
      ),
    { dispatch: false }  // This effect does not dispatch an action
  );
}
