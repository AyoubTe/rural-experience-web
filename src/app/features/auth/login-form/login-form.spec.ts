import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginForm } from './login-form';
import { AuthService } from '@rxp/core/auth/auth-service';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Mock for ActivatedRoute to simulate reading the ?returnUrl parameter
  let mockActivatedRoute = {
    snapshot: {
      queryParamMap: {
        get: jasmine.createSpy('get').and.returnValue(null) // default to null
      }
    }
  };

  beforeEach(async () => {
    // 1. Create Spies
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        LoginForm,
        NoopAnimationsModule, // Required for Material components
        ReactiveFormsModule
      ],
      providers: [
        provideRouter([]), // Prevents RouterLink errors in template
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBeFalse();
    expect(component.isLoading()).toBeFalse();
    expect(component.showPassword()).toBeFalse();
  });

  describe('Form Validation Getters', () => {
    it('emailErrors should return required message', () => {
      const emailCtrl = component.form.get('email');

      // Initially null because it's pristine/untouched
      expect(component.emailErrors).toBeNull();

      // Mark as touched to trigger error messages
      emailCtrl?.markAsTouched();
      emailCtrl?.setValue('');
      expect(component.emailErrors).toBe('Email is required');
    });

    it('emailErrors should return invalid email message', () => {
      const emailCtrl = component.form.get('email');
      emailCtrl?.markAsTouched();
      emailCtrl?.setValue('not-an-email');
      expect(component.emailErrors).toBe('Enter a valid email');
    });

    it('passwordErrors should return required message', () => {
      const passCtrl = component.form.get('password');

      expect(component.passwordErrors).toBeNull();

      passCtrl?.markAsTouched();
      passCtrl?.setValue('');
      expect(component.passwordErrors).toBe('Password is required');
    });
  });

  describe('togglePassword()', () => {
    it('should flip the showPassword signal', () => {
      expect(component.showPassword()).toBeFalse();

      component.togglePassword();
      expect(component.showPassword()).toBeTrue();

      component.togglePassword();
      expect(component.showPassword()).toBeFalse();
    });
  });

  describe('onSubmit()', () => {
    it('should mark all controls as touched and abort if form is invalid', () => {
      component.onSubmit();

      expect(component.form.get('email')?.touched).toBeTrue();
      expect(component.form.get('password')?.touched).toBeTrue();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should navigate to "/" on successful login with no returnUrl', () => {
      // Setup successful form
      component.form.setValue({ email: 'test@rxp.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(of({} as any)); // Simulate successful login

      component.onSubmit();

      expect(component.isLoading()).toBeTrue(); // isLoading is set before the observable completes
      expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@rxp.com', password: 'password123' });
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
    });

    it('should navigate to returnUrl on successful login if it exists', () => {
      // Simulate ?returnUrl=/my-bookings
      mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('/my-bookings');

      component.form.setValue({ email: 'test@rxp.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(of({} as any));

      component.onSubmit();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/my-bookings', { replaceUrl: true });
    });

    it('should handle login errors, update the error message signal, and stop loading', () => {
      const mockError = new Error('Invalid credentials');

      component.form.setValue({ email: 'test@rxp.com', password: 'wrongpassword' });
      authServiceSpy.login.and.returnValue(throwError(() => mockError));

      component.onSubmit();

      expect(authServiceSpy.login).toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();

      // Verify signals were updated appropriately on error
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(component.isLoading()).toBeFalse();
    });
  });
});
