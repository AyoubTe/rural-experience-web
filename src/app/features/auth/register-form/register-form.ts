import {Component, inject, signal} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink }  from '@angular/router';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatRadioModule }      from '@angular/material/radio';
import {AuthService} from '@rxp/core/auth/auth-service';


/** Cross-field validator: password and confirm must match */
function passwordMatchValidator(
  group: AbstractControl
): ValidationErrors | null {
  const pw      = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'rxp-register-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatRadioModule, RouterLink,
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
})
export class RegisterForm {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  form: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      role:      ['EXPLORER', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, role } =
      this.form.value;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.register({ firstName, lastName, email, password, role })
      .subscribe({
        next: () => this.router.navigateByUrl('/', { replaceUrl: true }),
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  get passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required'))   return 'Password is required';
    if (ctrl.hasError('minlength'))  return 'Minimum 8 characters';
    if (ctrl.hasError('pattern'))
      return 'Must include upper, lower case and a number';
    return null;
  }

  get confirmError(): string | null {
    if (!this.form.get('confirmPassword')?.touched) return null;
    return this.form.hasError('passwordMismatch')
      ? 'Passwords do not match'
      : null;
  }

  updateShowPassword() {
    this.showPassword.update(v => !v)
  }
}
