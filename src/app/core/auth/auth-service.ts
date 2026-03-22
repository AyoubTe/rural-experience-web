import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginRequest, RefreshTokenRequest, RegisterRequest} from '@rxp/core/models/requests.model';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';
import {Router} from '@angular/router';
import {AuthResponse, AuthUser} from '@rxp/core/models/responses.model';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {RxStompService} from '@rxp/core/websocket/rxstomp-service';


const ACCESS_TOKEN_KEY = 'rxp_access-token';
const REFRESH_TOKEN_KEY = 'rxp_refresh_token';
const USER_KEY = 'rxp_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = environment.API_BASE_URL;
  private http = inject(HttpClient);
  private router = inject(Router);
  private wsService = inject(RxStompService)

  // ── Reactive state ─────────────────────────────────────────────
  private _currentUser = signal<AuthUser | null>(
    this.loadUserFromStorage()
  );
  private _accessToken = signal<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );

  // Public read-only views
  readonly currentUser    = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(
    () => this._currentUser() !== null && this._accessToken() !== null
  );
  readonly userRole = computed(
    () => this._currentUser()?.role ?? null
  );
  readonly userDisplayName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.firstName} ${u.lastName}` : null;
  });

  constructor() {
    // Persist auth state to localStorage whenever it changes
    effect(() => {
      const user  = this._currentUser();
      const token = this._accessToken();

      if (user && token) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        this.wsService.connect(token);
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    });
  }

  // ── Auth operations ────────────────────────────────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}` + API_ENDPOINTS.AUTH.LOGIN, request)
      .pipe(
        tap(response => this.storeAuth(response)),
        catchError(err => throwError(() =>
          new Error(this.loginErrorMessage(err.status))
        )),
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}` + API_ENDPOINTS.AUTH.REGISTER, request)
      .pipe(
        tap(response => this.storeAuth(response)),
        catchError(err => throwError(() =>
          new Error(err.error?.message ?? 'Registration failed.')
        )),
      );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    const req: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<AuthResponse>(`${this.baseUrl}` + API_ENDPOINTS.AUTH.REFRESH, req)
      .pipe(
        tap(response => this.storeAuth(response)),
        catchError(() => {
          this.logout();
          return throwError(() => new Error('Session expired'));
        }),
      );
  }

  logout(): void {
    this._currentUser.set(null);
    this._accessToken.set(null);

    // Disconnect WebSocket on logout
    this.wsService.disconnect()
    this.router.navigate(['/']);
  }

  // ── Token access (used by interceptor) ────────────────────────
  getAccessToken(): string | null {
    return this._accessToken();
  }

  hasRole(role: string): boolean {
    return this._currentUser()?.role === role;
  }

  // ── Private helpers ────────────────────────────────────────────
  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this._accessToken.set(response.accessToken);

    const user: AuthUser = {
      id:        response.userId,
      email:     response.email,
      firstName: response.firstName,
      lastName:  response.lastName,
      role:      response.role,
      avatarUrl: null,
    };

    this._currentUser.set(user);

    // Connect websocket after successful authentication
    this.wsService.connect(response.accessToken);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private loginErrorMessage(status: number): string {
    if (status === 401) return 'Incorrect email or password.';
    if (status === 429) return 'Too many attempts. Please wait.';
    return 'Login failed. Please try again.';
  }
}
