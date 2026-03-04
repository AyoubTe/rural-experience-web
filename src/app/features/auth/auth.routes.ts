import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./auth-shell/auth-shell')
        .then(m => m.AuthShell),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./login-form/login-form')
            .then(m => m.LoginForm),
        title: 'Log In — RuralXperience',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register-form/register-form')
            .then(m => m.RegisterForm),
        title: 'Create Account — RuralXperience',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password/forgot-password')
            .then(m => m.ForgotPassword),
        title: 'Forgot Password — RuralXperience',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
