import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest, map} from 'rxjs';

import * as BookingActions   from '../../booking/store/booking.actions';
import * as BookingSelectors from '../../booking/store/booking.selectors';
import {AsyncPipe, CurrencyPipe} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'rxp-host-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatIcon,
    CurrencyPipe
  ],
  templateUrl: './host-dashboard.html',
  styleUrl: './host-dashboard.scss',
})
export class HostDashboard {
  private store = inject(Store);

  stats$ = combineLatest([
    this.store.select(BookingSelectors.selectHostBookings),
    this.store.select(BookingSelectors.selectPendingHostBookingCount),
  ]).pipe(
    map(([bookings, pendingCount]) => ({
      pendingCount,
      totalBookings:   bookings.length,
      confirmedCount:  bookings.filter(b =>
        b.status === 'CONFIRMED').length,
      totalRevenue:    bookings
        .filter(b => b.status === 'CONFIRMED' ||
          b.status === 'COMPLETED')
        .reduce((sum: any, b: { totalPrice: any; }) => sum + b.totalPrice, 0),
    }))
  );

  ngOnInit(): void {
    this.store.dispatch(BookingActions.loadHostBookings({}));
  }
}
