import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {BookingStatus} from '@rxp/core/models/booking.model';
import {MatChip} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'rxp-booking-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatChip,
    MatIcon
  ],
  templateUrl: './booking-status-badge.html',
  styleUrl: './booking-status-badge.scss',
})
export class BookingStatusBadge {
  status = input.required<BookingStatus>();

  label = computed(() => ({
    PENDING:   'Awaiting host',
    CONFIRMED: 'Confirmed',
    DECLINED:  'Declined',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  }[this.status()]));

  icon = computed(() => ({
    PENDING:   'hourglass_empty',
    CONFIRMED: 'check_circle',
    DECLINED:  'cancel',
    CANCELLED: 'do_not_disturb',
    COMPLETED: 'verified',
  }[this.status()]));
}
