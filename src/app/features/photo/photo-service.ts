import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpRequest} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';
import {PhotoResponse} from '@rxp/core/models/responses.model';
import {map, Observable} from 'rxjs';

export type UploadEvent =
  | { type: 'progress'; progress: number }
  | { type: 'complete'; photo: PhotoResponse };

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL;

  // ── Get all photos for an experience ────────────────────────────
  getPhotos(expId: number): Observable<PhotoResponse[]> {
    return this.http.get<PhotoResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.EXPERIENCES.GET_PHOTOS(expId)}`
    );
  }

  // ── Upload a single photo with progress events ───────────────────
  uploadPhoto(expId: number, file: File): Observable<UploadEvent> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest(
      'POST',
      `${this.baseUrl}${API_ENDPOINTS.EXPERIENCES.UPLOAD_PHOTO(expId)}`,
      formData,
      { reportProgress: true }
    );

    return this.http.request<PhotoResponse>(req).pipe(
      map((event: HttpEvent<PhotoResponse>): UploadEvent => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total
            ? Math.round((100 * event.loaded) / event.total)
            : 0;
          return { type: 'progress', progress };
        }
        if (event.type === HttpEventType.Response) {
          return { type: 'complete', photo: event.body! };
        }
        // Intermediate events (Sent, headers, etc.) — return 0 progress
        return { type: 'progress', progress: 0 };
      })
    );
  }

  // ── Reorder photos ───────────────────────────────────────────────
  reorderPhotos(expId: number, orderedIds: number[]): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}${API_ENDPOINTS.EXPERIENCES.REORDER_PHOTOS(expId)}`,
      { orderedIds }
    );
  }

  // ── Delete a photo ───────────────────────────────────────────────
  deletePhoto(expId: number, photoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ENDPOINTS.EXPERIENCES.DELETE_PHOTO(expId, photoId)}`
    );
  }
}
