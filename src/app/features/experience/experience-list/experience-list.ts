import {
  Component, OnInit, ChangeDetectionStrategy,
  signal, computed, inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExperienceCardComponent }
  from '@rxp/shared/components/experience-card/experience-card';

import { Experience, Category }
  from '@rxp/core/models/experience.model';
import { MOCK_EXPERIENCES }
  from '@rxp/core/mocks/experience.mock';

@Component({
  selector: 'rxp-experience-list',
  standalone: true,
  templateUrl: './experience-list.html',
  styleUrl: './experience-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ExperienceCardComponent
  ],
})
export class ExperienceListComponent implements OnInit {

  private router = inject(Router);

  // ── Raw data ────────────────────────────────────────────────────
  allExperiences = signal<Experience[]>([]);
  isLoading      = signal(true);

  // ── Filter state ────────────────────────────────────────────────
  keyword            = signal('');
  selectedCategoryId = signal<number | null>(null);
  maxPrice           = signal<number | null>(null);

  // ── Derived data ────────────────────────────────────────────────
  /** All unique categories from the loaded experiences */
  categories = computed<Category[]>(() => {
    const seen = new Set<number>();
    return this.allExperiences()
      .map(e => e.category)
      .filter(cat => {
        if (seen.has(cat.id)) return false;
        seen.add(cat.id);
        return true;
      });
  });

  /** Filtered experiences based on all active filters */
  filteredExperiences = computed(() => {
    const kw  = this.keyword().trim().toLowerCase();
    const cat = this.selectedCategoryId();
    const max = this.maxPrice();

    return this.allExperiences().filter(exp => {
      if (kw && !exp.title.toLowerCase().includes(kw)
        && !exp.description.toLowerCase().includes(kw)
        && !exp.location.toLowerCase().includes(kw))
        return false;

      if (cat !== null && exp.category.id !== cat)
        return false;

      return !(max !== null && exp.pricePerPerson > max);
    });
  });

  /** Count of currently active filters */
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.keyword().trim())           count++;
    if (this.selectedCategoryId() !== null) count++;
    if (this.maxPrice() !== null)           count++;
    return count;
  });

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit(): void {
    setTimeout(() => {
      this.allExperiences.set(MOCK_EXPERIENCES);
      this.isLoading.set(false);
    }, 600);
  }

  // ── Event handlers ────────────────────────────────────────────────
  onKeywordChange(value: string): void {
    this.keyword.set(value);
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  clearAllFilters(): void {
    this.keyword.set('');
    this.selectedCategoryId.set(null);
    this.maxPrice.set(null);
  }

  onExperienceBooked(experienceId: number): void {
    this.router.navigate(['/experiences', experienceId, 'book']);
  }
}
