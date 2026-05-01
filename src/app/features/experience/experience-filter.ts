import {computed, Injectable, signal} from '@angular/core';
import {ExperienceSearchParams} from '@rxp/core/models/experience.model';

/**
 * Shared filter state for the experience search.
 * Any component that injects this service reads and writes
 * the same filter state — no prop-drilling required.
 */
@Injectable({
  providedIn: 'root',
})
export class ExperienceFilterService {

  // ── Writable state ─────────────────────────────────────────────
  keyword     = signal('');
  categoryId  = signal<number | null>(null);
  minPrice    = signal<number | null>(null);
  maxPrice    = signal<number | null>(null);
  sortBy      = signal<string>('averageRating,desc');
  currentPage = signal(0);

  // ── Derived state ──────────────────────────────────────────────
  hasActiveFilters = computed(() =>
    this.keyword().trim() !== ''
    || this.categoryId() !== null
    || this.minPrice() !== null
    || this.maxPrice() !== null
  );

  activeFilterCount = computed(() => [
    this.keyword().trim() !== '',
    this.categoryId() !== null,
    this.minPrice() !== null,
    this.maxPrice() !== null,
  ].filter(Boolean).length);

  /** Build the search params object for ExperienceService */
  searchParams = computed<ExperienceSearchParams>(() => ({
    keyword:    this.keyword().trim() || undefined,
    categoryId: this.categoryId() ?? undefined,
    minPrice:   this.minPrice() ?? undefined,
    maxPrice:   this.maxPrice() ?? undefined,
    sort:       this.sortBy(),
    page:       this.currentPage(),
    size:       12,
  }));

  // ── Actions ────────────────────────────────────────────────────
  setKeyword(value: string): void {
    this.keyword.set(value);
    this.currentPage.set(0);  // Reset to page 1 on new search
  }

  setCategory(id: number | null): void {
    this.categoryId.set(id);
    this.currentPage.set(0);
  }

  nextPage(): void {
    this.currentPage.update(p => p + 1);
  }

  clearAllFilters(): void {
    this.keyword.set('');
    this.categoryId.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.currentPage.set(0);
  }
}
