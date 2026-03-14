import {
  Component, ChangeDetectionStrategy,
  inject, signal, computed
} from '@angular/core';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule }    from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { CurrencyPipe }        from '@angular/common';
import { toSignal }            from '@angular/core/rxjs-interop';

import { BookingService }   from '../booking-service';
import { Experience }       from '@rxp/core/models/experience.model';

import {
  notInPastValidator,
  endAfterStartValidator,
} from '@rxp/shared/validators/date.validators';
import { CreateBookingRequest } from '@rxp/core/models/requests.model';

@Component({
  selector: 'rxp-booking-form',
  standalone: true,
  templateUrl: './booking-form.html',
  styleUrl:    './booking-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatStepperModule, MatDatepickerModule,
    MatNativeDateModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    CurrencyPipe,
  ],
})
export class BookingForm {

  private fb             = inject(FormBuilder);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private bookingService = inject(BookingService);

  // Experience pre-loaded by the resolver
  experience = signal<Experience>(
    this.route.snapshot.data['experience']
  );

  isSubmitting = signal(false);
  submitError  = signal<string | null>(null);
  bookingId    = signal<number | null>(null);

  // Today's date for the datepicker minimum
  readonly minDate = new Date();

  // ── The booking form ───────────────────────────────────────────
  bookingForm: FormGroup = this.fb.group(
    {
      startDate: [
        null,
        [Validators.required, notInPastValidator()],
      ],
      endDate: [
        null,
        [Validators.required, notInPastValidator()],
      ],
      numberOfGuests: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(this.experience().maxGuests),
        ],
      ],
      specialRequests: ['', Validators.maxLength(500)],
    },
    {
      validators: endAfterStartValidator(),
    }
  );

  // ── Convert form changes to a Signal ────────────────
  // This constantly updates with the latest form values
  formValues = toSignal(this.bookingForm.valueChanges, {
    initialValue: this.bookingForm.value
  });

  // ── Computed values ────────────────────────────────────────────
  /** Number of nights derived from selected dates */
  durationDays = computed(() => {
    // Read from the Signal we just created!
    const start = this.formValues().startDate;
    const end   = this.formValues().endDate;

    if (!start || !end) return 0;

    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  totalPrice = computed(() => {
    // Read guests from the Signal as well
    const guests   = this.formValues().numberOfGuests ?? 1;
    const days     = this.durationDays();
    const price    = this.experience().pricePerPerson;

    return guests * days * price;
  });

  // ── Accessors ──────────────────────────────────────────────────
  get startDateCtrl() {
    return this.bookingForm.get('startDate')!;
  }
  get endDateCtrl() {
    return this.bookingForm.get('endDate')!;
  }
  get guestsCtrl() {
    return this.bookingForm.get('numberOfGuests')!;
  }

  // ── Validation helpers ─────────────────────────────────────────
  hasError(path: string, error: string): boolean {
    const ctrl = this.bookingForm.get(path);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  get dateRangeError(): string | null {
    if (!this.bookingForm.hasError('endAfterStart')) return null;
    return 'End date must be after start date';
  }

  // ── Submission ─────────────────────────────────────────────────
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const { startDate, endDate, numberOfGuests, specialRequests } =
      this.bookingForm.value;

    const request: CreateBookingRequest = {
      experienceId:   this.experience().id,
      startDate:      this.formatDate(startDate),
      endDate:        this.formatDate(endDate),
      numberOfGuests,
      specialRequests: specialRequests || undefined,
    };

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.bookingService.createBooking(request).subscribe({
      next: booking => {
        this.bookingId.set(booking.id);
        this.isSubmitting.set(false);
        this.router.navigate(
          ['/my-bookings', booking.id],
          { queryParams: { justBooked: true } }
        );
      },
      error: (err: Error) => {
        this.submitError.set(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
