import { Routes } from '@angular/router';
import {unsavedChangesGuard} from '@rxp/core/auth/unsaved-changes-guard/unsaved-changes-guard';

export const hostRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./host-shell/host-shell')
        .then(m => m.HostShell),
    // Child routes render inside HostShellComponent's <router-outlet>
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./host-dashboard/host-dashboard')
            .then(m => m.HostDashboard),
        title: 'Host Dashboard — RuralXperience',
      },
      {
        path: 'experiences',
        loadComponent: () =>
          import('./host-experiences/host-experiences')
            .then(m => m.HostExperiences),
        title: 'My Experiences — RuralXperience',
      },
      {
        path: 'experiences/new',
        loadComponent: () =>
          import('./experience-form/experience-form')
            .then(m => m.ExperienceForm),
        title: 'New Experience — RuralXperience',
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'experiences/:id/edit',
        loadComponent: () =>
          import('./experience-form/experience-form')
            .then(m => m.ExperienceForm),
        title: 'Edit Experience — RuralXperience',
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./host-bookings/host-bookings')
            .then(m => m.HostBookings),
        title: 'Incoming Bookings — RuralXperience',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./host-profile/host-profile')
            .then(m => m.HostProfile),
        title: 'Host Profile — RuralXperience',
      },
    ],
  },
];
