import { Routes } from '@angular/router';
import { authGuard, gestorGuard } from '../../core/guards';

export const COMISION_SERVICIO_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'proyecto/:proyectoId',
    loadComponent: () => import('./lista-comisiones-proyecto/lista-comisiones-proyecto.component').then(c => c.ListaComisionesProyectoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'proyecto/:proyectoId/nueva',
    loadComponent: () => import('./crear-comision-servicio/crear-comision-servicio.component').then(c => c.CrearComisionServicioComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-comision-servicio/detalle-comision-servicio.component').then(c => c.DetalleComisionServicioComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./editar-comision-servicio/editar-comision-servicio.component').then(c => c.EditarComisionServicioComponent),
    canActivate: [gestorGuard]
  }
]; 