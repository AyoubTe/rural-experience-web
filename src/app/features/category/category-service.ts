import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, Observable, shareReplay} from 'rxjs';
import {Category} from '@rxp/core/models/experience.model';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';
import {handleApiError} from '@rxp/core/http/api-error.util';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL;


  /**
   * Fetch all categories.
   * shareReplay(1) caches the last result — multiple components
   * calling getAll() share one HTTP request and one result.
   *
   * This mirrors the Spring Boot cache from Chapter 14:
   * the frontend also caches the reference data.
   */
  /**
   * shareReplay(1) makes this Observable hot and multicasted:
   * - First subscriber triggers the HTTP call
   * - All subsequent subscribers receive the cached result immediately
   * - The HTTP request is made exactly once per app session
   *
   * Perfect for: categories, countries, feature flags — data that
   * changes once a day (if that) and is needed by multiple components.
   */
  readonly categories$: Observable<Category[]> =
    this.http.get<Category[]>(this.baseUrl + API_ENDPOINTS.CATEGORIES.BASE).pipe(
      shareReplay(1),
      catchError(() => {
        console.warn('Failed to load categories');
        return [];
      }),
    );

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.baseUrl}` + API_ENDPOINTS.CATEGORIES.BASE)
      .pipe(catchError(handleApiError));
  }
}
