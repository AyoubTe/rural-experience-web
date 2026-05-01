import {
  Component, OnInit, ChangeDetectionStrategy,
  signal, computed, inject, OnDestroy
} from '@angular/core';
import {FormControl, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import { ExperienceCard }
  from '@rxp/shared/components/experience-card/experience-card';

import {Experience, Category, ExperienceSearchParams}
  from '@rxp/core/models/experience.model';
import {ExperienceService} from '@rxp/features/experience/experience-service';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map, of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import {PageResponse} from '@rxp/core/models/api.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {CategoryService} from '@rxp/features/category/category-service';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';
import {ExperienceFilterService} from '@rxp/features/experience/experience-filter';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'rxp-experience-list',
  standalone: true,
  templateUrl: './experience-list.html',
  styleUrl: './experience-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ExperienceCard,
    MatPaginator, MatIconModule, MatProgressSpinner, AsyncPipe, MatButton,
  ],
})
export class ExperienceListComponent implements OnInit, OnDestroy {

  private expSvc      = inject(ExperienceService);
  private catSvc      = inject(CategoryService);
  private router      = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  /** Signal Based State Service */
  private filters = inject(ExperienceFilterService);

  private results$ = toObservable(this.filters.searchParams)
    .pipe(
      debounceTime(300),
      switchMap(
        params => this.expSvc.search(params)
          .pipe(
            catchError(() => of(null))
          )
      ),
      takeUntilDestroyed(),
    );

  results = toSignal(this.results$, { initialValue: null });

  // ── State ──────────────────────────────────────────────────────
  pageResponse  = signal<PageResponse<Experience> | null>(null);

  keyword       = signal('');

  categories = signal<Category[]>([]);
  // ── Derived signals ───────────────────────────────────────────
  experiences = computed(() => this.searchResult()?.content ?? []);

  totalElements = computed(() => this.searchResult()?.totalElements ?? 0);

  currentPage = computed(() => this.searchResult()?.page ?? 0);

  totalPages = computed(() => this.searchResult()?.totalPages ?? 0);

  // selectedCategoryId as a signal (for template binding)
  selectedCategoryId = signal<number | null>(null);

  keywordControl = new FormControl('');

  // Subject for category selection (button click, not a form input)
  private categoryId$ = new Subject<number | null>();

  // ── Loading and error signals ─────────────────────────────────
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  // ── Categories (from service, cached with shareReplay) ─────────
  categories$ = this.catSvc.categories$;


  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit(): void {
    // Initialize filters from URL query params
    // (lets users share filtered URLs)
    const params = this.route.snapshot.queryParamMap;
    this.keyword.set(params.get('keyword') ?? '');
    const catId = params.get('categoryId');
    this.selectedCategoryId.set(catId ? Number(catId) : null);
    this.loadExperiences();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── The reactive search pipeline ──────────────────────────────
  private searchResult$ = combineLatest([
    // Keyword stream: emit on every change, debounced
    this.keywordControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      map(kw => kw?.trim() ?? '')
    ),
    // Category stream: emit immediately on selection
    this.categoryId$.pipe(startWith(null as number | null)),
  ]).pipe(
    // Side effect: mark as loading
    tap(() => {
      this.isLoading.set(true);
      this.errorMessage.set(null);
    }),

    // switchMap cancels previous in-flight HTTP request
    switchMap(([keyword, categoryId]) =>
      this.expSvc.search({
        keyword:    keyword || undefined,
        categoryId: categoryId ?? undefined,
        page: 0,
        size: 12,
      }).pipe(
        // catchError INSIDE switchMap — stream survives errors
        catchError((err: Error) => {
          this.errorMessage.set(err.message);
          return of(null);
        })
      )
    ),

    tap(() => this.isLoading.set(false)),

    takeUntilDestroyed(),  // Auto-cleanup when component destroyed
  );

  // ── Convert to Signal for template ────────────────────────────
  searchResult = toSignal<PageResponse<Experience> | null>(
    this.searchResult$,
    { initialValue: null }
  );

  // ── Event handlers ────────────────────────────────────────────
  onCategorySelect(id: number | null): void {
    this.selectedCategoryId.set(id);
    this.categoryId$.next(id);
  }

  clearAllFilters(): void {
    this.keywordControl.setValue('');
    this.onCategorySelect(null);
  }

  onExperienceBooked(experienceId: number): void {
    this.router.navigate(['/experiences', experienceId, 'book']);
  }

  onPageChange(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.expSvc.search({
      keyword: this.keywordControl.value?.trim() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      page,
      size: 12,
    }).pipe(
      // Use your existing Subject instead of takeUntilDestroyed()
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        // Update the writable signal
        this.pageResponse.set(result);
        this.isLoading.set(false);

        // Optional: nice UX touch to scroll up when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
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

    this.expSvc
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
    this.catSvc
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

    // Update URL without navigation (keeps browser history clean)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: value || null,  // null removes the param
        categoryId: this.selectedCategoryId() ?? null,
      },
      queryParamsHandling: 'merge',
    });

    this.loadExperiences(0);  // Reset to first page on new search
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
