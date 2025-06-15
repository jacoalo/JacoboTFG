import { Routes } from '@angular/router';
import { authGuard, gestorGuard } from '../../core/guards';

export const PROYECTOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./crear-proyecto/crear-proyecto.component').then(c => c.CrearProyectoComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-proyecto/detalle-proyecto.component').then(c => c.DetalleProyectoComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./editar-proyecto/editar-proyecto.component').then(c => c.EditarProyectoComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id/gastos',
    loadComponent: () => import('./gastos-proyecto/gastos-proyecto.component').then(c => c.GastosProyectoComponent),
    canActivate: [authGuard]
  }
]; 