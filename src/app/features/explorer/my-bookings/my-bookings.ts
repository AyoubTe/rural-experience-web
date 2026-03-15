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
import {MatDialog} from '@angular/material/dialog';
import {filter, take} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ConfirmDialog, ConfirmDialogData} from '@rxp/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'rxp-my-bookings',
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
  private dialog   = inject(MatDialog);

  // ── Select from Store using selectors ─────────────────────────
  loading$       = this.store.select(BookingSelectors.selectBookingLoading);
  error$         = this.store.select(BookingSelectors.selectBookingError);
  bookingGroups$ = this.store.select(BookingSelectors.selectBookingsByStatus);
  total$         = this.store.select(BookingSelectors.selectTotalElements);
  summary$                         = this.store.select(BookingSelectors.selectBookingSummary);

  ngOnInit(): void {
    // Dispatch action — Effect handles the HTTP call
    this.store.dispatch(BookingActions.loadMyBookings({}));
  }

  onCancelBooking(bookingId: number): void {
    const dialogRef = this.dialog.open<
      ConfirmDialog,
      ConfirmDialogData,
      boolean
    >(ConfirmDialog, {
      width: '400px',
      data: {
        title:       'Cancel Booking',
        message:
          'Are you sure you want to cancel this booking? ' +
          'This action cannot be undone.',
        confirmText: 'Yes, Cancel',
        cancelText:  'Keep Booking',
        danger:      true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.store.dispatch(
        BookingActions.cancelBooking({ bookingId })
      );

      // Listen for the result action and show snackbar
      this.store.select(BookingSelectors.selectBookingError)
        .pipe(
          filter(e => e !== null),
          take(1),
          takeUntilDestroyed(),
        )
        .subscribe(error => {
          this.snackBar.open(
            error ?? 'Failed to cancel booking',
            'Dismiss',
            { duration: 4000, panelClass: 'snack--error' }
          );
        });
    });
  }

  onPageChange(page: number): void {
    this.store.dispatch(BookingActions.loadMyBookings({ page }));
  }
}
