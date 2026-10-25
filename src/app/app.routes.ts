import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Pull requests abiertos',
    loadComponent: () =>
      import('./features/pull-requests/pull-requests-page/pull-requests-page').then(
        (m) => m.PullRequestsPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
