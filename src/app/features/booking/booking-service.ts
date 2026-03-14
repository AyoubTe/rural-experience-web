import {inject, Injectable} from '@angular/core';
import {catchError, Observable, Observer} from 'rxjs';
import {handleApiError} from '@rxp/core/http/api-error.util';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';
import {PageResponse} from '@rxp/core/models/api.model';
import {BookingResponse} from '@rxp/core/models/responses.model';
import {CreateBookingRequest} from '@rxp/core/models/requests.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_BASE_URL;

  getMyBookings(page: number = 0, size: number = 10): Observable<PageResponse<BookingResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<BookingResponse>>(`${this.apiUrl}${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}`, { params });
  }

  getHostBookings(page: number = 0, size: number = 10): Observable<PageResponse<BookingResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<BookingResponse>>(`${this.apiUrl}${API_ENDPOINTS.BOOKINGS.HOST_BOOKINGS}`, { params });
  }

  confirmBooking(id: number): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}${API_ENDPOINTS.BOOKINGS.CONFIRM(id)}`, {});
  }

  declineBooking(id: number): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}${API_ENDPOINTS.BOOKINGS.DECLINE(id)}`, {});
  }

  cancelBooking(id: number): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}${API_ENDPOINTS.BOOKINGS.CANCEL(id)}`, {});
  }

  createBooking(req: CreateBookingRequest) {
    return this.http
      .post<BookingResponse>(this.apiUrl + API_ENDPOINTS.BOOKINGS.BASE, req)
      .pipe(catchError(handleApiError));  // Reused across all services
  }

  checkAvailability (experienceId: number, values: any) {
    return new Observable((observer: Observer<BookingResponse>) => {})
  }
}
