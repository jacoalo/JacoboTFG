import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards';

export const CAMBIAR_PASSWORD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cambiar-password.component').then(c => c.CambiarPasswordComponent),
    canActivate: [authGuard]
  }
]; 