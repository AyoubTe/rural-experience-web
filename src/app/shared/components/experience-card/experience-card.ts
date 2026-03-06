import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed, signal,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Experience } from '@rxp/core/models/experience.model';
import {DurationPipe} from '@rxp/shared/pipes/duration/duration-pipe';
import {TruncatePipe} from '@rxp/shared/pipes/truncate/truncate-pipe-pipe';
import {environment} from '../../../../environments/environment.development';
import {StarState} from '@rxp/core/models/starstate.model';

import { MatCardModule }    from '@angular/material/card';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatRippleModule }  from '@angular/material/core';
import { MatChipsModule }   from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'rxp-experience-card',
  standalone: true,
  templateUrl: './experience-card.html',
  styleUrl: './experience-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DecimalPipe, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatRippleModule, MatChipsModule, MatTooltipModule,
    TruncatePipe, DurationPipe,
  ],
})
export class ExperienceCardComponent {

  // ── Inputs (signal-based) ───────────────────────────────────────
  experience  = input.required<Experience>();

  /** When true, renders a compact version without description */
  compact     = input<boolean>(false);
  showActions = input<boolean>(true);

  // ── Outputs ─────────────────────────────────────────────────────
  /** Emits the experience ID when the user clicks "Book Now" */
  booked      = output<number>();
  wishlisted  = output<number>();

  // ── Internal state ───────────────────────────────────────────────
  isWishlisted = signal(false);

  // ── Computed: derived from experience() input signal ─────────────
  hostName = computed(() => {
    const h = this.experience();
    return `${h.hostFirstName} ${h.hostLastName}`;
  });

  hostInitials = computed(() => {
    const h = this.experience();
    return `${h.hostFirstName[0]}${h.hostLastName[0]}`.toUpperCase();
  });

  /** Build an array of filled/empty stars for the rating display */
  stars = computed<StarState[]>(() => {
    const rating = this.experience().averageRating;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return { type: 'full',  index: i };
      if (i === Math.floor(rating) && rating % 1 >= 0.5)
        return { type: 'half',  index: i };
      return                               { type: 'empty', index: i };
    });
  });

  priceLabel = computed<string>(() => {
    const days = this.experience().durationDays;
    const price = this.experience().pricePerPerson;
    const total = price * days;
    return `From €${total.toLocaleString('fr-FR')} total`;
  });

  isVerifiedHost = computed(() =>
    this.experience().hostVerified
  );

  // ── Event handlers ───────────────────────────────────────────────
  onBookNow(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.booked.emit(this.experience().id);
  }

  onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isWishlisted.update(w => !w);
    this.wishlisted.emit(this.experience().id);
  }

  /** Fallback image when coverPhotoUrl is null */
  // In your card component
  get photoPhoto(): string {
    if (this.experience().coverPhotoUrl) {
      return <string>this.experience().coverPhotoUrl;
    }
    // Map category to a relevant search term
    const categoryMap: Record<string, string> = {
      'Farm Life': 'farm',
      'Fishing & Sea': 'fishing',
      'Winemaking': 'vineyard',
      'Cooking & Food': 'cooking',
      'Artisan Crafts': 'pottery',
      'Forest & Nature': 'forest',
      'Shepherding': 'sheep',
      'Horse & Equestrian': 'horse',
    };
    const term = categoryMap[this.experience().categoryName] ?? 'countryside';
    const UNSPLASH_KEY = environment.UNSPLASH_ACCESS_KEY;
    return `https://api.unsplash.com/photos/random?query=${term}&client_id=${UNSPLASH_KEY}&w=600&h=400`;
  }

  photoUrl = computed<string>(() => {
    if (this.experience().coverPhotoUrl) {
      return this.experience().coverPhotoUrl as string;
    }

    const categoryPhotos: Record<string, string> = {
      'Farm Life': 'https://www.traveliowa.com/userdocs/places/14404_20210825_182826.jpg',
      'Fishing & Sea': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      'Winemaking': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop',
      'Cooking & Food': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
      'Artisan Crafts': 'https://www.nps.gov/articles/000/images/Blue-Ridge-Craft-Trail-Images-11.jpg?maxwidth=650&autorotate=false&quality=78&format=webp',
      'Forest & Nature': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop',
      'Shepherding': 'https://presencepoint.com/wp-content/uploads/2020/07/shepherding-is-a-thing-of-the-soul-AdobeStock_98103487-scaled-1-1024x683.jpg',
      'Horse & Equestrian': 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop',
    };

    return categoryPhotos[this.experience().categoryName]
      ?? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop';
  });
}
