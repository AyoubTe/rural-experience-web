import {inject, Injectable} from '@angular/core';
import {catchError} from 'rxjs';
import {handleApiError} from '@rxp/core/http/api-error.util';
import {BookingResponse, CreateBookingRequest} from '@rxp/core/models/booking.model';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL;


  createBooking(req: CreateBookingRequest) {
    return this.http
      .post<BookingResponse>(this.baseUrl + API_ENDPOINTS.BOOKINGS.BASE, req)
      .pipe(catchError(handleApiError));  // Reused across all services
  }
}
