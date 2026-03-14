import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AuthService} from '@rxp/core/auth/auth-service';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  authService = inject(AuthService);

  fb = new FormBuilder()
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  get emailErrors(): string | null {
    const control = this.loginForm.get('email');

    // Don't show errors on pristine (untouched) fields
    if (!control || control.pristine || control.untouched) return null;

    if (control.hasError('required')) return 'Email is required';
    if (control.hasError('email'))    return 'Enter a valid email';
    return null;
  }

  get passwordErrors(): string | null {
    const ctl = this.loginForm.get('password');

    if (!ctl || ctl.pristine || ctl.untouched ) return null;

    if (ctl.hasError('required')) return 'Password is required';

    return null;
  }

  onSubmit() {

  }

  isLoading() : boolean {
    return false;
  }
}
