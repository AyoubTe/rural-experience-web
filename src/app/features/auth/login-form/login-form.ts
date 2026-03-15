import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '@rxp/core/auth/auth-service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'rxp-login-form',
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email: email!, password: password! })
      .subscribe({
        next: () => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  get emailErrors(): string | null {
    const control = this.form.get('email');

    // Don't show errors on pristine (untouched) fields
    if (!control || control.pristine || control.untouched) return null;

    if (control.hasError('required')) return 'Email is required';
    if (control.hasError('email'))    return 'Enter a valid email';
    return null;
  }

  get passwordErrors(): string | null {
    const ctl = this.form.get('password');

    if (!ctl || ctl.pristine || ctl.untouched ) return null;

    if (ctl.hasError('required')) return 'Password is required';

    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
