import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home')
        .then(m => m.Home),
  },
  {
    path: 'experiences',
    loadComponent: () =>
      import('./features/experience/experience-list/experience-list')
        .then(m => m.ExperienceListComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
