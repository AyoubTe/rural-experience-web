import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, Observable} from "rxjs";
import {AdminExperience, AdminUser, AuditLogEntry, ModerationAction, PlatformStats} from '@rxp/core/models/admin.model';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';
import {handleApiError} from '@rxp/core/http/api-error.util';
import {PageResponse} from '@rxp/core/models/responses.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL;

  // ── Platform stats ────────────────────────────────────────────
  getStats(): Observable<PlatformStats> {
    return this.http
      .get<PlatformStats>(`${this.baseUrl}${API_ENDPOINTS.ADMIN.STATS}`)
      .pipe(catchError(handleApiError));
  }

  // ── Moderation ────────────────────────────────────────────────
  getPendingReview(
    page = 0, size = 20
  ): Observable<PageResponse<AdminExperience>> {
    const params = new HttpParams()
      .set('status', 'PENDING_REVIEW')
      .set('page',   page.toString())
      .set('size',   size.toString());

    return this.http
      .get<PageResponse<AdminExperience>>(
        `${this.baseUrl}${API_ENDPOINTS.ADMIN.PENDING_EXPERIENCES}`, { params }

      )
      .pipe(catchError(handleApiError));
  }

  moderateExperience(
    action: ModerationAction
  ): Observable<AdminExperience> {
    return this.http
      .post<AdminExperience>(
        `${this.baseUrl}` + API_ENDPOINTS.ADMIN.MODERATE, action
      )
      .pipe(catchError(handleApiError));
  }
  /*
  moderateExperience(action: ModerationAction): Observable<void> {
    if (action.action === 'APPROVE') {
      return this.http
        .post<void>(
          `${this.baseUrl}${API_ENDPOINTS.ADMIN.APPROVE_EXPERIENCE(action.experienceId)}`,
          {}
        )
        .pipe(catchError(handleApiError));
    } else {
      return this.http
        .post<void>(
          `${this.baseUrl}${API_ENDPOINTS.ADMIN.REJECT_EXPERIENCE(action.experienceId)}`,
          { reason: action.reason ?? '' }
        )
        .pipe(catchError(handleApiError));
    }
  }*/

  bulkModerate(
    actions: ModerationAction[]
  ): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/moderation/bulk`, { actions })
      .pipe(catchError(handleApiError));
  }

  // ── Users ─────────────────────────────────────────────────────
  getUsers(params: {
    page:    number;
    size:    number;
    sort:    string;
    order:   'asc' | 'desc';
    search?: string;
    role?:   string;
    status?: string;
  }): Observable<PageResponse<AdminUser>> {
    let httpParams = new HttpParams()
      .set('page',  params.page.toString())
      .set('size',  params.size.toString())
      .set('sort',  `${params.sort},${params.order}`);

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role)   httpParams = httpParams.set('role',   params.role);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http
      .get<PageResponse<AdminUser>>(
        `${this.baseUrl}${API_ENDPOINTS.ADMIN.USERS}`, { params: httpParams }
      )
      .pipe(catchError(handleApiError));
  }

  updateUserRole(
    userId: number,
    role: 'EXPLORER' | 'HOST' | 'ADMIN'
  ): Observable<AdminUser> {
    return this.http
      .patch<AdminUser>(
        `${this.baseUrl}${API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId)}`, { role }
      )
      .pipe(catchError(handleApiError));
  }

  updateUserStatus(
    userId: number,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Observable<AdminUser> {
    return this.http
      .patch<AdminUser>(
        `${this.baseUrl}${API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId)}`, { status }
      )
      .pipe(catchError(handleApiError));
  }

  // ── Audit log ─────────────────────────────────────────────────
  getAuditLog(params: {
    page:   number;
    size:   number;
    action?: string;
  }): Observable<PageResponse<AuditLogEntry>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.action) {
      httpParams = httpParams.set('action', params.action);
    }

    return this.http
      .get<PageResponse<AuditLogEntry>>(
        `${this.baseUrl}${API_ENDPOINTS.ADMIN.AUDIT_LOG}`, { params: httpParams }
      )
      .pipe(catchError(handleApiError));
  }

}
