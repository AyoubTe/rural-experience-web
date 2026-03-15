import {
  Component, ChangeDetectionStrategy,
  input, output
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingResponse, BookingStatus } from '@rxp/core/models/responses.model';

@Component({
  selector: 'rxp-booking-card',
  standalone: true,
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, RouterLink,
    MatButtonModule, MatIconModule,
  ],
})
export class BookingCard {
  booking = input.required<BookingResponse>();
  cancel  = output<number>();

  onCancel(): void {
    this.cancel.emit(this.booking().id);
  }

  statusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      PENDING:   'Pending',
      CONFIRMED: 'Confirmed',
      DECLINED:  'Declined',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
    };
    return labels[status];
  }

  statusClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      PENDING:   'status--pending',
      CONFIRMED: 'status--confirmed',
      DECLINED:  'status--declined',
      CANCELLED: 'status--cancelled',
      COMPLETED: 'status--completed',
    };
    return classes[status];
  }
}
