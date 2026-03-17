import {Component, inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {toSignal} from '@angular/core/rxjs-interop';

import * as BookingActions   from '../../booking/store/booking.actions';
import * as BookingSelectors from '../../booking/store/booking.selectors';
import {DeclineDialog} from '@rxp/features/host/decline-dialog/decline-dialog';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {BookingStatusBadge} from '@rxp/shared/components/booking-status-badge/booking-status-badge';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'rxp-host-bookings',
  imports: [
    MatProgressBar,
    MatTabGroup,
    MatTab,
    MatCard,
    MatCardContent,
    DatePipe,
    MatIcon,
    CurrencyPipe,
    MatCardActions,
    BookingStatusBadge,
    MatTabLabel,
    MatButton
  ],
  templateUrl: './host-bookings.html',
  styleUrl: './host-bookings.scss',
})
export class HostBookings implements OnInit {
  private store  = inject(Store);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  // ── Store selectors → Signals ────────────────────────────────
  loading      = toSignal(
    this.store.select(BookingSelectors.selectBookingLoading),
    { initialValue: false }
  );
  pending      = toSignal(
    this.store.select(BookingSelectors.selectPendingHostBookings),
    { initialValue: [] }
  );
  allHostBks   = toSignal(
    this.store.select(BookingSelectors.selectHostBookings),
    { initialValue: [] }
  );

  ngOnInit(): void {
    this.store.dispatch(BookingActions.loadHostBookings({}));
  }

  // ── Accept booking ────────────────────────────────────────────
  onConfirm(bookingId: number): void {
    this.store.dispatch(
      BookingActions.confirmBooking({ bookingId })
    );
    this.notify.success('Booking confirmed! The explorer has been notified.');
  }

  // ── Decline booking with optional reason ─────────────────────
  onDecline(bookingId: number): void {
    const dialogRef = this.dialog.open<
      DeclineDialog,
      { bookingId: number },
      string | null | false
    >(DeclineDialog, {
      width: '480px',
      data:  { bookingId },
    });

    dialogRef.afterClosed().subscribe(result => {
      // result === false: user dismissed without submitting
      // result === null: declined without a reason
      // result === string: declined with a reason
      if (result === false) return;

      this.store.dispatch(
        BookingActions.declineBooking({
          bookingId,
          reason: result ?? undefined,
        })
      );
      this.notify.info('Booking declined. The explorer has been notified.');
    });
  }
}
