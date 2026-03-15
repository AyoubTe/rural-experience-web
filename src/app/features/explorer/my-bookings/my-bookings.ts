import {Component, inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatSnackBar} from '@angular/material/snack-bar';

import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink }          from '@angular/router';
import { MatCardModule }       from '@angular/material/card';
import { MatButtonModule }     from '@angular/material/button';
import { MatChipsModule }      from '@angular/material/chips';
import { MatProgressBarModule }from '@angular/material/progress-bar';
import { MatIconModule }       from '@angular/material/icon';
import { MatTabsModule }       from '@angular/material/tabs';

import * as BookingActions    from '../../booking/store/booking.actions';
import * as BookingSelectors  from '../../booking/store/booking.selectors';
import {BookingCard} from '@rxp/shared/components/booking-card/booking-card';

@Component({
  selector: 'rxp-my-my-bookings',
  imports: [
    AsyncPipe, RouterLink,
    MatCardModule, MatButtonModule, MatChipsModule,
    MatProgressBarModule, MatIconModule,
    MatTabsModule, BookingCard
  ],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings implements OnInit {
  private store    = inject(Store);
  private snackBar = inject(MatSnackBar);

  // ── Select from Store using selectors ─────────────────────────
  loading$       = this.store.select(BookingSelectors.selectBookingLoading);
  error$         = this.store.select(BookingSelectors.selectBookingError);
  bookingGroups$ = this.store.select(BookingSelectors.selectBookingsByStatus);
  total$         = this.store.select(BookingSelectors.selectTotalElements);

  ngOnInit(): void {
    // Dispatch action — Effect handles the HTTP call
    this.store.dispatch(BookingActions.loadMyBookings({}));
  }

  onCancelBooking(bookingId: number): void {
    // Reducer immediately marks as CANCELLED (optimistic)
    // Effect fires HTTP call in the background
    this.store.dispatch(BookingActions.cancelBooking({ bookingId }));

    // Listen for the result
    // (Chapter 16's real-time notifications make this cleaner)
    this.snackBar.open(
      'Cancelling booking...', undefined, { duration: 2000 }
    );
  }

  onPageChange(page: number): void {
    this.store.dispatch(BookingActions.loadMyBookings({ page }));
  }
}
