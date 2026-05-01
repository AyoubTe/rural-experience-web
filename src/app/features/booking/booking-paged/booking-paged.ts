import {Component, inject} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Store} from '@ngrx/store';
import {toSignal} from '@angular/core/rxjs-interop';

import * as BookingActions   from '../../booking/store/booking.actions';
import * as BookingSelectors from '../../booking/store/booking.selectors';

@Component({
  selector: 'rxp-booking-paged',
  imports: [
    MatPaginator
  ],
  templateUrl: './booking-paged.html',
  styleUrl: './booking-paged.scss',
})
export class BookingPaged {
  private store = inject(Store);

  total = toSignal(
    this.store.select(BookingSelectors.selectTotalElements),
    { initialValue: 0 }
  );
  page = toSignal(
    this.store.select(BookingSelectors.selectCurrentPage),
    { initialValue: 0 }
  );

  ngOnInit(): void {
    this.store.dispatch(BookingActions.loadMyBookings({ page: 0 }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      BookingActions.loadMyBookings({
        page: event.pageIndex,
        size: event.pageSize,
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
