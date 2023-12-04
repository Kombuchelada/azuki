import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'post/create',
    loadComponent: () =>
      import('./post-edit/post-edit.component').then(
        (mod) => mod.PostEditComponent
      ),
  },
  {
    path: 'register',
    loadComponent() {
      return import('./signup/signup.component').then((mod) => mod.SignupComponent)
    },
  },
  {
    path: 'log-in',
    loadComponent: () =>
      import('./log-in/log-in.component').then((mod) => mod.LogInComponent),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account.component').then((mod) => mod.AccountComponent),
  },
  {
    path: 'account/edit',
    loadComponent: () =>
      import('./account-edit/account-edit.component').then(
        (mod) => mod.AccountEditComponent
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'prefix',
  },
];
