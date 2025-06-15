import { Routes } from '@angular/router';
import { authGuard, gestorGuard } from '../../core/guards';

export const CONTRATO_MENOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'proyecto/:proyectoId',
    loadComponent: () => import('./lista-contratos-proyecto/lista-contratos-proyecto.component').then(c => c.ListaContratosProyectoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'proyecto/:proyectoId/nuevo',
    loadComponent: () => import('./crear-contrato-menor/crear-contrato-menor.component').then(c => c.CrearContratoMenorComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-contrato-menor/detalle-contrato-menor.component').then(c => c.DetalleContratoMenorComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./editar-contrato-menor/editar-contrato-menor.component').then(c => c.EditarContratoMenorComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id/articulos',
    loadComponent: () => import('./articulos/articulos.component').then(c => c.ArticulosComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id/facturas',
    loadComponent: () => import('./facturas/facturas.component').then(c => c.FacturasComponent),
    canActivate: [gestorGuard]
  }
]; 