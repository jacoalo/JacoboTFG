import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Usuario } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageMock: any;

  const API_URL = 'http://localhost:3000';

  const mockUsuario: Usuario = {
    dni: '12345678A',
    login: 'testuser',
    password: 'testpass',
    nombre: 'Test',
    apellido1: 'User',
    apellido2: 'Apellido2',
    investigador: false
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock localStorage completo
    localStorageMock = {
      store: {} as any,
      getItem: jasmine.createSpy('getItem').and.callFake((key: string) => {
        return localStorageMock.store[key] || null;
      }),
      setItem: jasmine.createSpy('setItem').and.callFake((key: string, value: string) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: jasmine.createSpy('removeItem').and.callFake((key: string) => {
        delete localStorageMock.store[key];
      }),
      clear: jasmine.createSpy('clear').and.callFake(() => {
        localStorageMock.store = {};
      })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorageMock.clear();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería retornar false cuando no hay usuario logueado', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('debería retornar null cuando no existe token', () => {
    expect(service.getToken()).toBeNull();
  });

  describe('Inicialización del servicio', () => {
    it('debería crearse correctamente', () => {
      expect(service).toBeTruthy();
    });

    it('debería cargar usuario desde localStorage si existe', () => {
      // Preparar
      const storedUser = JSON.stringify(mockUsuario);
      localStorageMock.store['gestionCSIC_user'] = storedUser;
      
      // Ejecutar - Simular carga manual
      service['loadStoredUser']();
      
      // Verificar
      expect(service.getCurrentUser()).toEqual(mockUsuario);
    });

    it('debería tener currentUser null si no hay usuario en localStorage', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('login()', () => {
    it('debería hacer login exitoso con credenciales válidas', (done) => {
      // Preparar
      const login = 'testuser';
      const password = 'testpass';
      const mockResponse = [mockUsuario];

      // Ejecutar
      service.login(login, password).subscribe({
        next: (user) => {
          // Verificar
          expect(user).toEqual(mockUsuario);
          expect(service.getCurrentUser()).toEqual(mockUsuario);
          expect(service.isLoggedIn()).toBeTruthy();
          expect(localStorageMock.getItem('gestionCSIC_user')).toBeTruthy();
          expect(localStorageMock.getItem('gestionCSIC_auth_token')).toBeTruthy();
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería fallar con credenciales inválidas', (done) => {
      // Preparar
      const login = 'wronguser';
      const password = 'wrongpass';
      const mockResponse: Usuario[] = [];

      // Ejecutar
      service.login(login, password).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error de autenticación. Por favor, verifica tus credenciales.');
          expect(service.getCurrentUser()).toBeNull();
          expect(service.isLoggedIn()).toBeFalsy();
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      req.flush(mockResponse);
    });

    it('debería manejar errores HTTP correctamente', (done) => {
      // Preparar
      const login = 'testuser';
      const password = 'testpass';

      // Ejecutar
      service.login(login, password).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error de autenticación. Por favor, verifica tus credenciales.');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      req.error(new ErrorEvent('Network error'));
    });

    it('debería generar token único en cada login', (done) => {
      // Preparar
      const login = 'testuser';
      const password = 'testpass';
      const mockResponse = [mockUsuario];

      // Ejecutar - Primer login
      service.login(login, password).subscribe({
        next: () => {
          const firstToken = service.getToken();
          
          // Cerrar sesión y segundo inicio de sesión
          service.logout();
          
          service.login(login, password).subscribe({
            next: () => {
              const secondToken = service.getToken();
              
              // Verificar
              expect(firstToken).not.toEqual(secondToken);
              expect(firstToken).toBeTruthy();
              expect(secondToken).toBeTruthy();
              done();
            }
          });

          // Segunda petición HTTP
          const req2 = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
          req2.flush(mockResponse);
        }
      });

      // Primera petición HTTP
      const req1 = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      req1.flush(mockResponse);
    });
  });

  describe('logout()', () => {
    it('debería limpiar sesión correctamente', () => {
      // Preparar - Simular usuario logueado
      localStorageMock.store['gestionCSIC_auth_token'] = 'test-token';
      localStorageMock.store['gestionCSIC_user'] = JSON.stringify(mockUsuario);

      // Ejecutar
      service.logout();

      // Verificar
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('gestionCSIC_auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('gestionCSIC_user');
    });

    it('debería limpiar localStorage después del logout', () => {
      // Preparar
      localStorageMock.store['gestionCSIC_auth_token'] = 'test-token';
      localStorageMock.store['gestionCSIC_user'] = JSON.stringify(mockUsuario);

      // Ejecutar
      service.logout();

      // Verificar
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('gestionCSIC_auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('gestionCSIC_user');
    });
  });

  describe('getCurrentUser()', () => {
    it('debería retornar el usuario actual si está logueado', () => {
      // Preparar - Simular usuario logueado
      service['currentUserSubject'].next(mockUsuario);

      // Ejecutar & Assert
      expect(service.getCurrentUser()).toEqual(mockUsuario);
    });

    it('debería retornar null si no hay usuario logueado', () => {
      // Ejecutar & Assert
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('debería retornar true si hay usuario logueado', () => {
      // Preparar - Simular usuario logueado
      service['currentUserSubject'].next(mockUsuario);

      // Ejecutar & Assert
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('debería retornar false si no hay usuario logueado', () => {
      // Ejecutar & Assert
      expect(service.isLoggedIn()).toBeFalsy();
    });
  });

  describe('isGestor()', () => {
    it('debería retornar true para usuario gestor', () => {
      // Preparar - Simular usuario gestor
      const gestorUser = { ...mockUsuario, investigador: false };
      service['currentUserSubject'].next(gestorUser);

      // Ejecutar & Assert
      expect(service.isGestor()).toBeTruthy();
    });

    it('debería retornar false para usuario investigador', () => {
      // Preparar - Simular usuario investigador
      const investigadorUser = { ...mockUsuario, investigador: true };
      service['currentUserSubject'].next(investigadorUser);

      // Ejecutar & Assert
      expect(service.isGestor()).toBeFalsy();
    });

    it('debería retornar false si no hay usuario logueado', () => {
      // Ejecutar & Assert
      expect(service.isGestor()).toBeFalsy();
    });
  });

  describe('getToken()', () => {
    it('debería retornar el token almacenado', () => {
      // Preparar
      const testToken = 'test-token-123';
      localStorageMock.store['gestionCSIC_auth_token'] = testToken;

      // Ejecutar & Assert
      expect(service.getToken()).toBe(testToken);
    });

    it('debería retornar null cuando no hay token', () => {
      // Ejecutar & Assert
      expect(service.getToken()).toBeNull();
    });
  });

  describe('Integración localStorage', () => {
    it('debería persistir y recuperar datos correctamente', () => {
      // Preparar
      const testToken = 'integration-test-token';
      localStorageMock.store['gestionCSIC_user'] = JSON.stringify(mockUsuario);
      localStorageMock.store['gestionCSIC_auth_token'] = testToken;
      
      // Ejecutar - Simular carga desde localStorage
      service['loadStoredUser']();

      // Verificar
      expect(service.getCurrentUser()).toEqual(mockUsuario);
      expect(service.getToken()).toBe(testToken);
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('debería manejar datos corruptos en localStorage', () => {
      // Preparar
      localStorageMock.store['gestionCSIC_user'] = 'invalid-json';

      // Ejecutar - Intentar cargar datos corruptos
      service['loadStoredUser']();

      // Verificar
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
    });
  });

  describe('Casos edge', () => {
    it('debería manejar respuesta HTTP vacía en login', (done) => {
      // Preparar
      const login = 'testuser';
      const password = 'testpass';

      // Ejecutar
      service.login(login, password).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error de autenticación. Por favor, verifica tus credenciales.');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      req.flush(null);
    });

    it('debería manejar múltiples usuarios en respuesta', (done) => {
      // Preparar
      const login = 'testuser';
      const password = 'testpass';
      const mockResponse = [mockUsuario, { ...mockUsuario, dni: '87654321B' }];

      // Ejecutar
      service.login(login, password).subscribe({
        next: (user) => {
          // Verificar - Debería tomar el primer usuario
          expect(user).toEqual(mockUsuario);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Usuario?login=eq.${login}&password=eq.${password}`);
      req.flush(mockResponse);
    });
  });
}); 