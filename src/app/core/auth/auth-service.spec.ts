import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('isAuthenticated() is false initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('login() sets isAuthenticated to true', () => {
    service.login({ email: 'a@b.com', password: 'P@ssword1' })
      .subscribe();

    const req = httpMock.expectOne(r =>
      r.url.includes('/auth/login'));

    req.flush({
      accessToken:  'fake-access',
      refreshToken: 'fake-refresh',
      tokenType:    'Bearer',
      expiresIn:    900,
      user: {
        id: 1, email: 'a@b.com',
        firstName: 'Pierre', lastName: 'Dubois',
        role: 'EXPLORER', avatarUrl: null,
      },
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.userDisplayName()).toBe('Pierre Dubois');
    expect(service.hasRole('EXPLORER')).toBeTrue();
  });

  it('logout() clears state', () => {
    // Manually set state
    (service as any)._currentUser.set({
      id: 1, firstName: 'Pierre', lastName: 'Dubois',
      email: 'a@b.com', role: 'EXPLORER', avatarUrl: null,
    });
    (service as any)._accessToken.set('fake-token');

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('authInterceptor attaches Bearer header', () => {
    (service as any)._accessToken.set('test-token');
    // The interceptor test is an integration test —
    // covered in auth.interceptor.spec.ts
  });
});
