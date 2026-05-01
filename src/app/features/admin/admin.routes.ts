import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-shell/admin-shell')
        .then(m => m.AdminShell),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboard),
        title: 'Admin Dashboard — RuralXperience',
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('./moderation/moderation')
            .then(m => m.Moderation),
        title: 'Experience Moderation — RuralXperience',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./user-management/user-management')
            .then(m => m.UserManagement),
        title: 'User Management — RuralXperience',
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./audit-log/audit-log')
            .then(m => m.AuditLog),
        title: 'Audit Log — RuralXperience',
      },
    ],
  }
];
