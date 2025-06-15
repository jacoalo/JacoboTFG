import { Routes } from '@angular/router';
import { gestorGuard } from '../../core/guards';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista-usuarios/lista-usuarios.component').then(c => c.ListaUsuariosComponent),
    canActivate: [gestorGuard]
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./crear-usuario/crear-usuario.component').then(c => c.CrearUsuarioComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-usuario/detalle-usuario.component').then(c => c.DetalleUsuarioComponent),
    canActivate: [gestorGuard]
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./editar-usuario/editar-usuario.component').then(c => c.EditarUsuarioComponent),
    canActivate: [gestorGuard]
  }
]; 