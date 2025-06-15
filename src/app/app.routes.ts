import { Routes } from '@angular/router';
import { authGuard, gestorGuard } from './core/guards';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ListaPersonalComponent } from './features/personal/lista-personal/lista-personal.component';
import { CrearPersonalComponent } from './features/personal/crear-personal/crear-personal.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  // Rutas de usuario y cambio de contraseña
  {
    path: 'usuarios',
    loadChildren: () => import('./features/usuarios/usuarios.routes').then(r => r.USUARIOS_ROUTES),
    canActivate: [gestorGuard]
  },
  {
    path: 'cambiar-password',
    loadChildren: () => import('./features/usuarios/cambiar-password/cambiar-password.routes').then(r => r.CAMBIAR_PASSWORD_ROUTES),
    canActivate: [authGuard]
  },
  
  // Rutas de proyectos
  {
    path: 'proyectos',
    loadChildren: () => import('./features/proyectos/proyectos.routes').then(r => r.PROYECTOS_ROUTES),
    canActivate: [authGuard]
  },
  
  // Rutas de contratos menores
  {
    path: 'contratos-menores',
    loadChildren: () => import('./features/contrato-menor/contrato-menor.routes').then(r => r.CONTRATO_MENOR_ROUTES),
    canActivate: [authGuard]
  },
  
  // Rutas de comisiones de servicio
  {
    path: 'comisiones-servicio',
    loadChildren: () => import('./features/comision-servicio/comision-servicio.routes').then(r => r.COMISION_SERVICIO_ROUTES),
    canActivate: [authGuard]
  },
  
  // Rutas de gastos de personal
  {
    path: 'gastos-personal',
    loadChildren: () => import('./features/gastos-personal/gastos-personal.routes').then(r => r.GASTOS_PERSONAL_ROUTES),
    canActivate: [authGuard]
  },
  
  // Rutas de personal
  {
    path: 'personal',
    children: [
      {
        path: '',
        component: ListaPersonalComponent
      },
      {
        path: 'nuevo',
        component: CrearPersonalComponent
      },
      {
        path: ':dni/editar',
        component: CrearPersonalComponent
      }
    ]
  },
  
  // Ruta para página no encontrada
  { path: '**', redirectTo: '/dashboard' }
];
