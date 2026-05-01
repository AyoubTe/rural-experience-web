import { Routes } from '@angular/router';
import {experienceResolver} from '@rxp/features/experience/resolver/experience.resolver';
import { HowItWorks} from '@rxp/features/static/how-it-works/how-it-works';
import {authGuard} from '@rxp/core/auth/auth-guard/auth-guard';
import {adminGuard} from '@rxp/core/auth/admin-guard/admin-guard';
import {hostGuard} from '@rxp/core/auth/host-guard/host-guard';

export const routes: Routes = [
  // ── Public routes ──────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home')
        .then(m => m.Home),
    title: 'RuralXperience — Authentic Rural Experiences',
  },

  {
    path: 'experiences',
    loadComponent: () =>
      import('./features/experience/experience-list/experience-list')
        .then(m => m.ExperienceListComponent),
    title: 'Explore Experiences — RuralXperience',
  },

  {
    path: 'experiences/:id',
    loadComponent: () =>
      import('./features/experience/experience-detail/experience-detail')
        .then(m => m.ExperienceDetail),
    resolve: { experience: experienceResolver },
    title: 'Experience Detail — RuralXperience',
  },

  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./features/static/how-it-works/how-it-works')
        .then(m => m.HowItWorks),
    title: 'How It Works — RuralXperience',
  },

  // ── Auth routes ────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.authRoutes),
  },

  // ── Protected: Explorer ────────────────────────────────────────
  {
    path: 'experiences/:id/book',
    loadComponent: () =>
      import('./features/booking/booking-form/booking-form')
        .then(m => m.BookingForm),
    canActivate: [authGuard],
    resolve: { experience: experienceResolver },
    title: 'Book Experience — RuralXperience',
  },

  {
    path: 'my-bookings',
    loadChildren: () =>
      import('./features/explorer/explorer.routes')
        .then(m => m.explorerRoutes),
    canActivate: [authGuard],
  },

  // ── Protected: Host ────────────────────────────────────────────
  {
    path: 'host',
    loadChildren: () =>
      import('./features/host/host.routes')
        .then(m => m.hostRoutes),
    canActivate: [authGuard, hostGuard],
  },

  // ── Protected: Admin ───────────────────────────────────────────
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.adminRoutes),
    canActivate: [authGuard, adminGuard],
  },

  // ── Fallback ───────────────────────────────────────────────────
  {
    path: '404',
    loadComponent: () =>
      import('./features/static/not-found/not-found')
        .then(m => m.NotFound),
    title: 'Page Not Found — RuralXperience',
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
