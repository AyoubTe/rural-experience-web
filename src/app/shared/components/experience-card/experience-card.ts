import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Experience } from '@rxp/core/models/experience.model';
import {DurationPipe} from '@rxp/shared/pipes/duration/duration-pipe';
import {TruncatePipe} from '@rxp/shared/pipes/truncate/truncate-pipe-pipe';

@Component({
  selector: 'rxp-experience-card',
  standalone: true,
  templateUrl: './experience-card.html',
  styleUrl: './experience-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DecimalPipe, RouterLink, DurationPipe, TruncatePipe],
})
export class ExperienceCardComponent {

  // ── Inputs ──────────────────────────────────────────────────────
  experience = input.required<Experience>();

  /** When true, renders a compact version without description */
  compact = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────
  /** Emits the experience ID when the user clicks "Book Now" */
  booked = output<number>();

  // ── Computed values ─────────────────────────────────────────────
  /** Build an array of filled/empty stars for the rating display */
  stars = computed(() => {
    const rating = this.experience().averageRating;
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < Math.floor(rating),
      half:   i === Math.floor(rating) && (rating % 1) >= 0.5,
    }));
  });

  /** Format the duration for display */
  durationLabel = computed(() => {
    const days = this.experience().durationDays;
    return days === 1 ? '1 day' : `${days} days`;
  });

  /** The host's full name */
  hostName = computed(() => {
    const h = this.experience().host;
    return `${h.firstName} ${h.lastName}`;
  });

  /** Fallback image when coverPhotoUrl is null */
  get photoUrl(): string {
    return this.experience().coverPhotoUrl
      ?? 'assets/images/placeholder-experience.jpg';
  }

  // ── Event handlers ───────────────────────────────────────────────
  onBookNow(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.booked.emit(this.experience().id);
  }
}
