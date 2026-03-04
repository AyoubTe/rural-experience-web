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
import {environment} from '../../../../environments/environment.development';

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

  get photoUrl(): string {
    if (this.experience().coverPhotoUrl) {
      return this.experience().coverPhotoUrl as string;
    }

    const categoryPhotos: Record<string, string> = {
      'Farm Life':         'https://www.traveliowa.com/userdocs/places/14404_20210825_182826.jpg',
      'Fishing & Sea':     'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      'Winemaking':        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop',
      'Cooking & Food':    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
      'Artisan Crafts':    'https://www.nps.gov/articles/000/images/Blue-Ridge-Craft-Trail-Images-11.jpg?maxwidth=650&autorotate=false&quality=78&format=webp',
      'Forest & Nature':   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop',
      'Shepherding':       'https://presencepoint.com/wp-content/uploads/2020/07/shepherding-is-a-thing-of-the-soul-AdobeStock_98103487-scaled-1-1024x683.jpg',
      'Horse & Equestrian':'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop',
    };

    return categoryPhotos[this.experience().categoryName]
      ?? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop';
  }

  // ── Event handlers ───────────────────────────────────────────────
  onBookNow(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.booked.emit(this.experience().id);
  }
}
