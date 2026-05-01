import { Routes } from '@angular/router';

export const explorerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@rxp/features/explorer/my-bookings/my-bookings')
        .then(m => m.MyBookings),
    title: 'My Bookings — RuralXperience',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./booking-detail/booking-detail')
        .then(m => m.BookingDetail),
    title: 'Booking Detail — RuralXperience',
  },
  {
    path: ':id/review',
    loadComponent: () =>
      import('./write-review/write-review')
        .then(m => m.WriteReview),
    title: 'Write a Review — RuralXperience',
  },
];
