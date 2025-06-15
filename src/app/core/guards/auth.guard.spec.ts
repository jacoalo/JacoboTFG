import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
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
    mockState = { url: '/dashboard', root: {} as any } as RouterStateSnapshot;
  });

  describe('Autorización de acceso', () => {
    it('debería permitir acceso cuando el usuario está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.parseUrl).not.toHaveBeenCalled();
    });

    it('debería denegar acceso cuando el usuario no está logueado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('Redirección', () => {
    it('debería redirigir a /login cuando no está autenticado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
      expect(result).toBe(mockUrlTree);
    });

    it('debería no redirigir cuando está autenticado', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(routerSpy.parseUrl).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Casos edge', () => {
    it('debería manejar diferentes rutas de destino', () => {
      // Preparar
      const differentStates = [
        { url: '/proyectos' },
        { url: '/contratos-menores' },
        { url: '/usuarios' }
      ];

      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar & Assert
      differentStates.forEach(state => {
        const result = TestBed.runInInjectionContext(() => 
          authGuard(mockRoute, state as RouterStateSnapshot)
        );
        expect(result).toBe(true);
      });

      expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(3);
    });

    it('debería funcionar con rutas anidadas', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar
      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
    });
  });

  describe('Integración con AuthService', () => {
    it('debería llamar a isLoggedIn exactamente una vez por verificación', () => {
      // Preparar
      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar
      TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(1);
    });

    it('debería manejar cambios de estado de autenticación', () => {
      // Preparar - Primera llamada: no autenticado
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const mockUrlTree = { toString: () => '/login' } as any;
      routerSpy.parseUrl.and.returnValue(mockUrlTree);

      // Ejecutar - Primera verificación
      let result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar - Primera verificación
      expect(result).toBe(mockUrlTree);

      // Preparar - Segunda llamada: autenticado
      authServiceSpy.isLoggedIn.and.returnValue(true);

      // Ejecutar - Segunda verificación
      result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      // Verificar - Segunda verificación
      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(2);
    });
  });
}); 