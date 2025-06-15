import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { gestorGuard } from './gestor.guard';
import { AuthService } from '../services/auth.service';

describe('gestorGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isGestor']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock de ActivatedRouteSnapshot y RouterStateSnapshot
    mockRoute = {
      url: [],
      queryParams: {},
      fragment: null,
      data: {},
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any,
      params: {},
      title: undefined
    } as ActivatedRouteSnapshot;
    mockState = { url: '/usuarios', root: {} as any } as RouterStateSnapshot;
  });

  describe('Autorización para gestores', () => {
    it('debería permitir acceso cuando el usuario es gestor logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isGestor).toHaveBeenCalled();
      expect(routerSpy.parseUrl).not.toHaveBeenCalled();
    });

    it('debería denegar acceso cuando el usuario no es gestor pero está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(false);
      const mockUrlTree = { toString: () => '/dashboard' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isGestor).toHaveBeenCalled();
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('debería denegar acceso cuando el usuario no está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(false);
      authServiceSpy.isGestor.and.returnValue(false);
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('Lógica de redirección', () => {
    it('debería redirigir a /dashboard cuando está logueado pero no es gestor', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(false);
      const mockUrlTree = { toString: () => '/dashboard' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/dashboard');
      expect(result).toBe(mockUrlTree);
    });

    it('debería redirigir a /login cuando no está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
      expect(result).toBe(mockUrlTree);
    });

    it('debería no redirigir cuando es gestor logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(routerSpy.parseUrl).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Casos de uso específicos', () => {
    it('debería proteger rutas de administración', () => {
      // Preparar
      const adminRoutes = [
        { url: '/usuarios' },
        { url: '/usuarios/nuevo' },
        { url: '/proyectos/nuevo' }
      ];

      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar & Assert
      adminRoutes.forEach(state => {
        const result = TestBed.runInInjectionContext(() => 
          gestorGuard(mockRoute, state as RouterStateSnapshot)
        );
        expect(result).toBe(true);
      });

      expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(3);
      expect(authServiceSpy.isGestor).toHaveBeenCalledTimes(3);
    });

    it('debería bloquear investigadores de rutas de gestión', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(false); // Es investigador
      const mockUrlTree = { toString: () => '/dashboard' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      const testState = { url: '/usuarios' } as RouterStateSnapshot;

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, testState)
      );

      // Verificar
      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isGestor).toHaveBeenCalled();
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Orden de verificación', () => {
    it('debería verificar login antes que rol de gestor', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(false);
      authServiceSpy.isGestor.and.returnValue(true); // Esto no debería importar
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      // isGestor no debería ser llamado si no está logueado
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
    });

    it('debería verificar rol de gestor solo si está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(false);
      const mockUrlTree = { toString: () => '/dashboard' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isGestor).toHaveBeenCalled();
      expect(result).toBe(mockUrlTree);
    });
  });

  describe('Integración con AuthService', () => {
    it('debería llamar a ambos métodos del AuthService cuando está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar
      TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(authServiceSpy.isGestor).toHaveBeenCalledTimes(1);
    });

    it('debería manejar cambios de estado de autenticación y rol', () => {
      // Preparar - Primera llamada: no logueado
      authServiceSpy.isLoggedIn.and.returnValue(false);
      let mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar - Primera verificación
      let result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar - Primera verificación
      expect(result).toBe(mockUrlTree);

      // Preparar - Segunda llamada: logueado pero no gestor
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(false);
      mockUrlTree = { toString: () => '/dashboard' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar - Segunda verificación
      result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar - Segunda verificación
      expect(result).toBe(mockUrlTree);

      // Preparar - Tercera llamada: logueado y gestor
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar - Tercera verificación
      result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar - Tercera verificación
      expect(result).toBe(true);
    });
  });

  describe('Casos edge', () => {
    it('debería funcionar con rutas con parámetros', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isGestor).toHaveBeenCalled();
    });

    it('debería manejar rutas anidadas complejas', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isGestor.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        gestorGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(true);
    });
  });
}); 