import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {ConfirmDialog, ConfirmDialogData} from '@rxp/shared/components/confirm-dialog/confirm-dialog';

import * as BookingActions   from '../../booking/store/booking.actions';
import * as BookingSelectors from '../../booking/store/booking.selectors';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatDivider} from '@angular/material/list';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {BookingStatusBadge} from '@rxp/shared/components/booking-status-badge/booking-status-badge';

@Component({
  selector: 'rxp-booking-detail',
  imports: [
    MatIcon,
    MatCard,
    MatCardContent,
    RouterLink,
    MatDivider,
    DatePipe,
    CurrencyPipe,
    MatCardActions,
    BookingStatusBadge
  ],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
})
export class BookingDetail implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(Store);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  private bookingId = Number(
    this.route.snapshot.paramMap.get('id')
  );

  // Select the booking from Store by ID
  booking = toSignal(
    this.store.select(BookingSelectors.selectMyBookings).pipe(
      map(bookings => bookings.find(b => b.id === this.bookingId) ?? null)
    )
  );

  cancelling = toSignal(
    this.store.select(BookingSelectors.selectBookingCancelling)
  );

  // Query param: show "just booked" banner
  justBooked = signal(
    this.route.snapshot.queryParamMap.get('justBooked') === 'true'
  );

  ngOnInit(): void {
    // Ensure bookings are loaded
    if (!this.booking()) {
      this.store.dispatch(BookingActions.loadMyBookings({}));
    }

    // Select this booking in the Store for DevTools visibility
    this.store.dispatch(
      BookingActions.selectBooking({ bookingId: this.bookingId })
    );
  }

  onCancel(): void {
    const dialogRef = this.dialog.open<
      ConfirmDialog,
      ConfirmDialogData,
      boolean
    >(ConfirmDialog, {
      width: '400px',
      data: {
        title:       'Cancel Booking',
        message:     'Cancel this booking? This cannot be undone.',
        confirmText: 'Cancel Booking',
        cancelText:  'Keep It',
        danger:      true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(
          BookingActions.cancelBooking({ bookingId: this.bookingId })
        );
        this.notify.info('Booking cancellation requested.');
      }
    });
  }

  onWriteReview(): void {
    this.router.navigate(['/my-bookings', this.bookingId, 'review']);
  }
}
