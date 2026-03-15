import {
  Component, ChangeDetectionStrategy,
  input, output, computed
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingResponse, BookingStatus } from '@rxp/core/models/responses.model';
import {DurationPipe} from '@rxp/shared/pipes/duration/duration-pipe';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatChip} from '@angular/material/chips';

interface StatusConfig {
  label:  string;
  icon:   string;
  color:  'primary' | 'accent' | 'warn' | '';
  cssClass: string;
}

@Component({
  selector: 'rxp-booking-card',
  standalone: true,
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, RouterLink,
    MatButtonModule, MatIconModule, DurationPipe, MatCardActions, MatCardContent, MatChip, MatCard,
  ],
})
export class BookingCard {
  // ── Inputs ──────────────────────────────────────────────────────
  booking      = input.required<BookingResponse>();
  isCancelling = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────
  cancel  = output<number>();
  review  = output<number>();

  // ── Computed ────────────────────────────────────────────────────
  statusConfig = computed<StatusConfig>(() => {
    const configs: Record<BookingStatus, StatusConfig> = {
      PENDING: {
        label: 'Awaiting host',
        icon:  'hourglass_empty',
        color: '',
        cssClass: 'status--pending',
      },
      CONFIRMED: {
        label: 'Confirmed',
        icon:  'check_circle',
        color: 'primary',
        cssClass: 'status--confirmed',
      },
      DECLINED: {
        label: 'Declined',
        icon:  'cancel',
        color: 'warn',
        cssClass: 'status--declined',
      },
      CANCELLED: {
        label: 'Cancelled',
        icon:  'do_not_disturb',
        color: '',
        cssClass: 'status--cancelled',
      },
      COMPLETED: {
        label: 'Completed',
        icon:  'verified',
        color: 'primary',
        cssClass: 'status--completed',
      },
    };
    return configs[this.booking().status];
  });

  durationDays = computed(() => {
    const start = new Date(this.booking().startDate);
    const end   = new Date(this.booking().endDate);
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  });

  canCancel = computed(() =>
    this.booking().status === 'PENDING' ||
    this.booking().status === 'CONFIRMED'
  );

  canReview = computed(() =>
    this.booking().status === 'COMPLETED'
  );

  // ── Handlers ────────────────────────────────────────────────────
  onCancel(): void {
    this.cancel.emit(this.booking().id);
  }

  onReview(): void {
    this.review.emit(this.booking().id);
  }
}
