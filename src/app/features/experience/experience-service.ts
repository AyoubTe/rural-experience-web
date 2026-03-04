import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment.development';
import {Category, Experience, ExperienceSearchParams} from '@rxp/core/models/experience.model';
import {catchError, Observable, retry, throwError} from 'rxjs';
import {ApiError, PageResponse} from '@rxp/core/models/api.model';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_BASE_URL}`;

  /**
   * Search and paginate experiences.
   * Maps query parameters onto Spring Boot's expected format.
   */
  search(
    params: ExperienceSearchParams = {}
  ): Observable<PageResponse<Experience>> {

    let httpParams = new HttpParams();

    if (params.keyword?.trim()) {
      httpParams = httpParams.set('keyword', params.keyword.trim());
    }
    if (params.categoryId != null) {
      httpParams = httpParams.set('categoryId',
        params.categoryId.toString());
    }
    if (params.minPrice != null) {
      httpParams = httpParams.set('minPrice',
        params.minPrice.toString());
    }
    if (params.maxPrice != null) {
      httpParams = httpParams.set('maxPrice',
        params.maxPrice.toString());
    }
    if (params.minDays != null) {
      httpParams = httpParams.set('minDays',
        params.minDays.toString());
    }
    if (params.maxDays != null) {
      httpParams = httpParams.set('maxDays',
        params.maxDays.toString());
    }
    if (params.country) {
      httpParams = httpParams.set('country', params.country);
    }

    httpParams = httpParams
      .set('page', (params.page ?? 0).toString())
      .set('size', (params.size ?? 12).toString())
      .set('sort', params.sort ?? 'averageRating,desc');

    return this.http
      .get<PageResponse<Experience>>(this.baseUrl + API_ENDPOINTS.EXPERIENCES.BASE,
        { params: httpParams })
      .pipe(
        retry({ count: 1, delay: 1000 }),  // Retry once on failure
        catchError(this.handleError),
      );
  }

  /**
   * Fetch a single experience by ID.
   */
  getById(id: number): Observable<Experience> {
    return this.http
      .get<Experience>(`${this.baseUrl}` + API_ENDPOINTS.EXPERIENCES.GET_BY_ID(id))
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetch all categories (used for filter chips).
   */
  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(
        `${this.baseUrl}` + API_ENDPOINTS.CATEGORIES.BASE)
      .pipe(catchError(this.handleError));
  }

  // ── Error handling ─────────────────────────────────────────────

  /**
   * Transform HTTP errors into user-friendly AppError objects.
   * This is the single error-handling point for all experience requests.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    if (error.status === 0) {
      // Network error (no internet, server unreachable)
      message = 'Cannot reach the server. Please check your connection.';
    } else if (error.status === 404) {
      message = 'This experience could not be found.';
    } else if (error.status === 403) {
      message = 'You do not have permission to view this experience.';
    } else if (error.status >= 500) {
      message = 'Something went wrong on our end. Please try again.';
    } else {
      // 4xx with a structured API error body
      const apiError = error.error as ApiError;
      message = apiError?.message ?? 'An unexpected error occurred.';
    }

    console.error('ExperienceService error:', error);
    return throwError(() => new Error(message));
  }
}
