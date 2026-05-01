import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ENDPOINTS } from '@rxp/core/constants/endpoints';
import { ExperienceSummaryResponse, PageResponse } from '@rxp/core/models/responses.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_BASE_URL;

  getWishlist(): Observable<PageResponse<ExperienceSummaryResponse>> {
    return this.http.get<PageResponse<ExperienceSummaryResponse>>(`${this.apiUrl}${API_ENDPOINTS.WISHLIST.BASE}`);
  }

  add(experienceId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}${API_ENDPOINTS.WISHLIST.ADD(experienceId)}`, {});
  }

  remove(experienceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${API_ENDPOINTS.WISHLIST.REMOVE(experienceId)}`);
  }

  checkStatus(experienceId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}${API_ENDPOINTS.WISHLIST.STATUS(experienceId)}`);
  }
}
