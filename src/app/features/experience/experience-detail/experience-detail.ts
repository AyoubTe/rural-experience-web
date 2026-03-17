import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Experience} from '@rxp/core/models/experience.model';
import {MatIcon} from '@angular/material/icon';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {AuthService} from '@rxp/core/auth/auth-service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'rxp-experience-detail',
  imports: [
    MatIcon,
    DecimalPipe,
    CurrencyPipe,
    RouterLink,
    MatButton

  ],
  templateUrl: './experience-detail.html',
  styleUrl: './experience-detail.scss',
})
export class ExperienceDetail {
  private route   = inject(ActivatedRoute);
  protected auth = inject(AuthService);

  // Data is available synchronously — no loading state needed
  experience = signal<Experience>(
    this.route.snapshot.data['experience']
  );

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
