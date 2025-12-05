import { Routes } from '@angular/router';
import { authGuard } from './shared/services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login-page'),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/main-layout'),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page')
      },
      {
        path: 'personas',
        loadComponent: () => import('./features/person/list/person-list')
      },
      {
        path: 'personas/:id',
        loadComponent: () => import('./features/person/profile/person-profile')
      },
      {
        path: 'graficos',
        loadComponent: () => import('./features/chart/chart-page')
      },
      {
        path: 'transporte',
        loadComponent: () => import('./features/transport/transport-tracking')
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/event/list/list')
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
