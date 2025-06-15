import { Routes } from '@angular/router';
import { authGuard, gestorGuard } from '../../core/guards';

export const GASTOS_PERSONAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'proyecto/:proyectoId',
    loadComponent: () => import('./lista-gastos-personal/lista-gastos-personal.component').then(c => c.ListaGastosPersonalComponent),
    canActivate: [authGuard]
  },
  {
    path: 'proyecto/:proyectoId/nuevo',
    loadComponent: () => import('./crear-gasto-personal/crear-gasto-personal.component').then(c => c.CrearGastoPersonalComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':dni/:proyectoId/:mes/:anio',
    loadComponent: () => import('./detalle-gasto-personal/detalle-gasto-personal.component').then(c => c.DetalleGastoPersonalComponent),
    canActivate: [authGuard]
  },
  {
    path: ':dni/:proyectoId/:mes/:anio/editar',
    loadComponent: () => import('./editar-gasto-personal/editar-gasto-personal.component').then(c => c.EditarGastoPersonalComponent),
    canActivate: [gestorGuard]
  }
]; 