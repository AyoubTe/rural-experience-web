import {
  Component, OnInit, ChangeDetectionStrategy,
  signal, computed, inject, OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExperienceCardComponent }
  from '@rxp/shared/components/experience-card/experience-card';

import {Experience, Category, ExperienceSearchParams}
  from '@rxp/core/models/experience.model';
import {ExperienceService} from '@rxp/features/experience/experience-service';
import {Subject, takeUntil} from 'rxjs';
import {PageResponse} from '@rxp/core/models/api.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {CategoryService} from '@rxp/features/category/category-service';
import { MatChipListbox, MatChip } from '@angular/material/chips';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'rxp-experience-list',
  standalone: true,
  templateUrl: './experience-list.html',
  styleUrl: './experience-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ExperienceCardComponent,
    MatPaginator, MatIcon, MatProgressSpinner,
  ],
})
export class ExperienceListComponent implements OnInit, OnDestroy {

  private experienceService = inject(ExperienceService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  // ── State ──────────────────────────────────────────────────────
  pageResponse  = signal<PageResponse<Experience> | null>(null);
  isLoading     = signal(false);
  errorMessage  = signal<string | null>(null);

  keyword            = signal('');
  selectedCategoryId = signal<number | null>(null);

  // ── Derived ────────────────────────────────────────────────────
  experiences = computed(() => this.pageResponse()?.content ?? []);

  categories = signal<Category[]>([]);
  // The async pipe subscribes automatically
  // Multiple uses of categories$ share the same cached response
  categories$ = this.categoryService.categories$;

  totalElements = computed(() => this.pageResponse()?.totalElements ?? 0);

  currentPage = computed(() => this.pageResponse()?.page ?? 0);

  totalPages = computed(() => this.pageResponse()?.totalPages ?? 0);

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadExperiences();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────────────────
  loadExperiences(page = 0): void {
    const params: ExperienceSearchParams = {
      keyword:    this.keyword() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      page,
      size: 12,
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.experienceService
      .search(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.pageResponse.set(response);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  /** All unique categories from the loaded experiences */
  loadCategories(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories.set(response);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
        },
      });
  }

  // ── Filter handlers ────────────────────────────────────────────
  onKeywordChange(value: string): void {
    this.keyword.set(value);
    this.loadExperiences(0);  // Reset to first page on new search
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.loadExperiences(0);
  }

  onPageChange(page: number): void {
    this.loadExperiences(page);
    // Scroll back to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearAllFilters(): void {
    this.keyword.set('');
    this.selectedCategoryId.set(null);
    this.loadExperiences(0);
  }

  onExperienceBooked(experienceId: number): void {
    inject(Router).navigate(
        ['/experiences', experienceId, 'book']
    );
  }

  /** Filtered experiences based on all active filters */
  filteredExperiences = computed(() => {
    const kw  = this.keyword().trim().toLowerCase();
    const cat = this.selectedCategoryId();

    return this.experiences().filter(exp => {
      if (kw && !exp.title.toLowerCase().includes(kw)
        && !exp.shortDescription.toLowerCase().includes(kw)
        && !exp.location.toLowerCase().includes(kw))
        return false;
      return true;
    });
  });

  /** Count of currently active filters */
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.keyword().trim())           count++;
    if (this.selectedCategoryId() !== null) count++;
    return count;
  });
}
