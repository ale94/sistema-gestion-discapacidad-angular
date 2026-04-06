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
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page'),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/user-management/list/user-management'),
      },
      {
        path: 'personas',
        loadComponent: () => import('./features/person/list/person-list'),
      },
      {
        path: 'seguimientos',
        loadComponent: () => import('./features/person-tracking/list/person-indicator'),
      },
      {
        path: 'personas/:id',
        loadComponent: () => import('./features/person/profile/person-profile'),
      },
      {
        path: 'graficos',
        loadComponent: () => import('./features/chart/chart-page'),
      },
      {
        path: 'prestamos',
        loadComponent: () => import('./features/equipment/list/equipment-page'),
      },
      {
        path: 'prestamos/:id',
        loadComponent: () => import('./features/equipment/profile/profile'),
      },
      {
        path: 'transportes',
        loadComponent: () => import('./features/transport/transport-tracking'),
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/event/list/list'),
      },
      {
        path: 'informacion',
        loadComponent: () => import('./shared/components/info-system/info-system'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
