import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ENDPOINTS } from '@rxp/core/constants/endpoints';
import { CreateReviewRequest, HostReplyRequest } from '@rxp/core/models/requests.model';
import {PageResponse, ReviewResponse} from '@rxp/core/models/responses.model';
import {handleApiError} from '@rxp/core/http/api-error.util';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_BASE_URL;

  createReview(request: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}${API_ENDPOINTS.REVIEWS.BASE}`, request);
  }

  replyToReview(id: number, request: HostReplyRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}${API_ENDPOINTS.REVIEWS.REPLY(id)}`, request);
  }

  getByExperience(experienceId: number, page: number = 0, size: number = 10): Observable<PageResponse<ReviewResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<ReviewResponse>>(
      `${this.apiUrl}${API_ENDPOINTS.REVIEWS.BY_EXPERIENCE(experienceId)}`,
      { params }
    );
  }

  /**
   * Submit a review for a completed booking.
   * POST /api/v1/bookings/review
   */
  submitReview(request: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}${API_ENDPOINTS.REVIEWS.BASE}`, request)
      .pipe(catchError(handleApiError));
  }

  /**
   * Fetch all reviews for an experience.
   * GET /api/v1/experiences/{experienceId}/reviews
   */
  getReviews(
    experienceId: number,
    page = 0
  ): Observable<ReviewResponse[]> {
    return this.http
      .get<ReviewResponse[]>(
        `${this.apiUrl}` + API_ENDPOINTS.REVIEWS.BY_EXPERIENCE(experienceId),
        { params: { page: page.toString(), size: '10' } }
      )
      .pipe(catchError(handleApiError));
  }
}
