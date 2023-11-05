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
    path: 'log-in',
    loadComponent: () =>
      import('./log-in/log-in.component').then((mod) => mod.LogInComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'prefix',
  },
];
