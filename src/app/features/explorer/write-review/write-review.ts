import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ReviewService} from '@rxp/features/review/review-service';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {CreateReviewRequest} from '@rxp/core/models/requests.model';
import {MatIcon} from '@angular/material/icon';
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'rxp-write-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatButton
  ],
  templateUrl: './write-review.html',
  styleUrl: './write-review.scss',
})
export class WriteReview {
  private fb           = inject(FormBuilder);
  private route        = inject(ActivatedRoute);
  router       = inject(Router);
  private reviewSvc    = inject(ReviewService);
  private notify       = inject(NotificationService);

  bookingId    = signal(0);
  isSubmitting = signal(false);
  hoveredStar  = signal(0);

  form = this.fb.group({
    rating:  [0,  [Validators.required, Validators.min(1),
      Validators.max(5)]],
    title:   ['', [Validators.required, Validators.maxLength(100)]],
    comment: ['', [Validators.required, Validators.minLength(20),
      Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.bookingId.set(
      Number(this.route.snapshot.paramMap.get('id'))
    );
  }

  setRating(rating: number): void {
    this.form.get('rating')?.setValue(rating);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const request: CreateReviewRequest = {
      bookingId: this.bookingId(),
      rating:    this.form.value.rating ?? 0,
      comment:   this.form.value.comment ?? undefined,
    };

    this.reviewSvc.submitReview(request).subscribe({
      next: () => {
        this.notify.success('Review submitted — thank you!');
        this.router.navigate(['/my-bookings'], { replaceUrl: true });
      },
      error: (err: Error) => {
        this.notify.error(err.message);
        this.isSubmitting.set(false);
      },
    });
  }
}
