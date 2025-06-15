import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services';

// Guard que verifica si el usuario es gestor
export const gestorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isGestor()) {
    return true;
  }

  // Si está logueado pero no es gestor, redirige al dashboard
  if (authService.isLoggedIn()) {
    return router.parseUrl('/dashboard');
  }

  // Si no está logueado, redirige al login
  return router.parseUrl('/login');
}; 