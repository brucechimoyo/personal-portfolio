import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent),
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'bins', loadComponent: () => import('./features/bins/bins.component').then(m => m.BinsComponent) },
      { path: 'drivers', loadComponent: () => import('./features/drivers/drivers.component').then(m => m.DriversComponent) },
      { path: 'dispatch', loadComponent: () => import('./features/dispatch/dispatch.component').then(m => m.DispatchComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
