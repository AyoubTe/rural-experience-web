import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterForm } from './register-form';
import { AuthService } from '@rxp/core/auth/auth-service';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // 1. Create Spies
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterForm,
        NoopAnimationsModule, // Required for Material form fields
        ReactiveFormsModule
      ],
      providers: [
        provideRouter([]), // Prevents RouterLink errors in template
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize the form with default values', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBeFalse();
    expect(component.form.get('role')?.value).toBe('EXPLORER');
    expect(component.isLoading()).toBeFalse();
    expect(component.showPassword()).toBeFalse();
  });

  describe('Password Validation & Getters', () => {
    it('passwordError should return required message', () => {
      const passCtrl = component.form.get('password');
      expect(component.passwordError).toBeNull(); // Untouched initially

      passCtrl?.markAsTouched();
      passCtrl?.setValue('');
      expect(component.passwordError).toBe('Password is required');
    });

    it('passwordError should return minlength message', () => {
      const passCtrl = component.form.get('password');
      passCtrl?.markAsTouched();
      passCtrl?.setValue('Short1!'); // 7 characters
      expect(component.passwordError).toBe('Minimum 8 characters');
    });

    it('passwordError should return pattern message if missing upper/lower/number', () => {
      const passCtrl = component.form.get('password');
      passCtrl?.markAsTouched();

      // Missing uppercase
      passCtrl?.setValue('alllowercase123');
      expect(component.passwordError).toBe('Must include upper, lower case and a number');

      // Missing number
      passCtrl?.setValue('NoNumbersHere');
      expect(component.passwordError).toBe('Must include upper, lower case and a number');
    });

    it('confirmError should detect password mismatch', () => {
      component.form.get('password')?.setValue('ValidPass123');
      const confirmCtrl = component.form.get('confirmPassword');

      confirmCtrl?.markAsTouched();
      confirmCtrl?.setValue('DifferentPass123');

      // The error is attached to the form group, not the control
      expect(component.confirmError).toBe('Passwords do not match');
    });

    it('confirmError should return null if passwords match', () => {
      component.form.get('password')?.setValue('MatchPass123');
      const confirmCtrl = component.form.get('confirmPassword');

      confirmCtrl?.markAsTouched();
      confirmCtrl?.setValue('MatchPass123');

      expect(component.confirmError).toBeNull();
    });
  });

  describe('updateShowPassword()', () => {
    it('should flip the showPassword signal', () => {
      expect(component.showPassword()).toBeFalse();

      component.updateShowPassword();
      expect(component.showPassword()).toBeTrue();

      component.updateShowPassword();
      expect(component.showPassword()).toBeFalse();
    });
  });

  describe('onSubmit()', () => {
    it('should mark all controls as touched and abort if form is invalid', () => {
      component.onSubmit();

      expect(component.form.get('firstName')?.touched).toBeTrue();
      expect(component.form.get('email')?.touched).toBeTrue();
      expect(authServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should navigate to "/" on successful registration', () => {
      // Setup valid form
      component.form.setValue({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@rxp.com',
        role: 'HOST',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123'
      });
      authServiceSpy.register.and.returnValue(of({} as any));

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
      expect(authServiceSpy.register).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@rxp.com',
        password: 'ValidPassword123',
        role: 'HOST'
      });
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
    });

    it('should handle registration errors, update the error message, and stop loading', () => {
      const mockError = new Error('Email already exists');

      component.form.setValue({
        firstName: 'John',
        lastName: 'Smith',
        email: 'taken@rxp.com',
        role: 'EXPLORER',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123'
      });
      authServiceSpy.register.and.returnValue(throwError(() => mockError));

      component.onSubmit();

      expect(authServiceSpy.register).toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();

      // Verify state changes on error
      expect(component.errorMessage()).toBe('Email already exists');
      expect(component.isLoading()).toBeFalse();
    });
  });
});
