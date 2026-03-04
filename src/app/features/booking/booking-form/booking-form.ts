import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-booking-form',
  imports: [],
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.scss',
})
export class BookingForm {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Navigate to a path array
  onBookingConfirmed(bookingId: number): void {
    this.router.navigate(['/my-bookings', bookingId]);
  }

  // Navigate with query params
  onSearch(keyword: string): void {
    this.router.navigate(['/experiences'], {
      queryParams: { keyword },
    });
  }

  // Navigate relative to the current route
  onEditExperience(id: number): void {
    this.router.navigate(['../edit', id], {
      relativeTo: this.route,
    });
  }

  // Navigate by full URL string
  onReturnHome(): void {
    this.router.navigateByUrl('/');
  }

  // Navigate and replace current history entry
  onRedirect(url: string): void {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }

  // Get the return URL from query params (after login)
  onLoginSuccess(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.router.navigateByUrl(returnUrl, { replaceUrl: true });
  }
}
