import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services';
import { Usuario } from '../../core/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUsuario: Usuario = {
    dni: '12345678A',
    login: 'testuser',
    nombre: 'Test',
    apellido1: 'User',
    investigador: false
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, CommonModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  describe('Inicialización del componente', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar propiedades con valores por defecto', () => {
      expect(component.username).toBe('');
      expect(component.password).toBe('');
      expect(component.errorMessage).toBe('');
      expect(component.loading).toBeFalsy();
    });

    it('debería renderizar el formulario de login', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeTruthy();
      expect(compiled.querySelector('input[type="text"]')).toBeTruthy();
      expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
      expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    });
  });

  describe('Validación de formulario', () => {
    it('debería mostrar error si username está vacío', () => {
      // Preparar
      component.username = '';
      component.password = 'password123';

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('Por favor, introduce usuario y contraseña');
      expect(authServiceSpy.login).not.toHaveBeenCalled();
      expect(component.loading).toBeFalsy();
    });

    it('debería mostrar error si password está vacío', () => {
      // Preparar
      component.username = 'testuser';
      component.password = '';

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('Por favor, introduce usuario y contraseña');
      expect(authServiceSpy.login).not.toHaveBeenCalled();
      expect(component.loading).toBeFalsy();
    });

    it('debería mostrar error si ambos campos están vacíos', () => {
      // Preparar
      component.username = '';
      component.password = '';

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('Por favor, introduce usuario y contraseña');
      expect(authServiceSpy.login).not.toHaveBeenCalled();
      expect(component.loading).toBeFalsy();
    });

    it('debería proceder con login si ambos campos tienen valor', () => {
      // Preparar
      component.username = 'testuser';
      component.password = 'password123';
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  describe('Proceso de login exitoso', () => {
    beforeEach(() => {
      component.username = 'testuser';
      component.password = 'password123';
    });

    it('debería llamar al AuthService con credenciales correctas', () => {
      // Preparar
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('debería activar estado de loading durante el login', () => {
      // Preparar
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.loading).toBeTruthy();
      expect(component.errorMessage).toBe('');
    });

    it('debería navegar al dashboard después de login exitoso', () => {
      // Preparar
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('debería limpiar mensaje de error en login exitoso', () => {
      // Preparar
      component.errorMessage = 'Error previo';
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Manejo de errores en login', () => {
    beforeEach(() => {
      component.username = 'testuser';
      component.password = 'wrongpassword';
    });

    it('debería mostrar mensaje de error personalizado', () => {
      // Preparar
      const errorMessage = 'Credenciales inválidas';
      const error = new Error(errorMessage);
      authServiceSpy.login.and.returnValue(throwError(() => error));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe(errorMessage);
      expect(component.loading).toBeFalsy();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('debería mostrar mensaje de error por defecto si no hay mensaje específico', () => {
      // Preparar
      const error = new Error();
      authServiceSpy.login.and.returnValue(throwError(() => error));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('Error de autenticación. Por favor, verifica tus credenciales.');
      expect(component.loading).toBeFalsy();
    });

    it('debería desactivar loading en caso de error', () => {
      // Preparar
      const error = new Error('Error de red');
      authServiceSpy.login.and.returnValue(throwError(() => error));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.loading).toBeFalsy();
    });

    it('debería no navegar en caso de error', () => {
      // Preparar
      const error = new Error('Error de autenticación');
      authServiceSpy.login.and.returnValue(throwError(() => error));

      // Ejecutar
      component.login();

      // Verificar
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Interacción con UI', () => {
    it('debería actualizar username cuando el usuario escribe', () => {
      // Preparar
      const usernameInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;

      // Ejecutar
      usernameInput.value = 'newuser';
      usernameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Verificar
      expect(component.username).toBe('newuser');
    });

    it('debería actualizar password cuando el usuario escribe', () => {
      // Preparar
      const passwordInput = fixture.nativeElement.querySelector('input[type="password"]') as HTMLInputElement;

      // Ejecutar
      passwordInput.value = 'newpassword';
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Verificar
      expect(component.password).toBe('newpassword');
    });

    it('debería mostrar mensaje de error en la UI', () => {
      // Preparar
      component.errorMessage = 'Error de prueba';

      // Ejecutar
      fixture.detectChanges();

      // Verificar
      const errorElement = fixture.nativeElement.querySelector('.error-message, .alert-danger');
      expect(errorElement?.textContent).toContain('Error de prueba');
    });

    it('debería deshabilitar botón durante loading', () => {
      // Preparar
      component.loading = true;

      // Ejecutar
      fixture.detectChanges();

      // Verificar
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBeTruthy();
    });

    it('debería mostrar indicador de loading', () => {
      // Preparar
      component.loading = true;

      // Ejecutar
      fixture.detectChanges();

      // Verificar
      const loadingIndicator = fixture.nativeElement.querySelector('.spinner-border');
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe('Envío de formulario', () => {
    it('debería llamar a login() cuando se envía el formulario', () => {
      // Preparar
      spyOn(component, 'login');
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

      // Ejecutar
      form.dispatchEvent(new Event('submit'));

      // Verificar
      expect(component.login).toHaveBeenCalled();
    });

    it('debería prevenir envío si campos están vacíos', () => {
      // Preparar
      component.username = '';
      component.password = '';
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

      // Ejecutar
      form.dispatchEvent(new Event('submit'));

      // Verificar
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });
  });

  describe('Estados del componente', () => {
    it('debería resetear estado de error al iniciar nuevo login', () => {
      // Preparar
      component.errorMessage = 'Error anterior';
      component.username = 'testuser';
      component.password = 'password123';
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('');
    });

    it('debería mantener credenciales después de error', () => {
      // Preparar
      component.username = 'testuser';
      component.password = 'wrongpassword';
      const error = new Error('Credenciales inválidas');
      authServiceSpy.login.and.returnValue(throwError(() => error));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.username).toBe('testuser');
      expect(component.password).toBe('wrongpassword');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar espacios en blanco en credenciales', () => {
      // Preparar
      component.username = '  ';
      component.password = '  ';
      authServiceSpy.login.and.returnValue(throwError(() => new Error('No debería llamarse')));

      // Ejecutar
      component.login();

      // Verificar
      expect(component.errorMessage).toBe('Por favor, introduce usuario y contraseña');
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('debería trimear espacios en credenciales válidas', () => {
      // Preparar
      component.username = '  testuser  ';
      component.password = '  password123  ';
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar
      component.login();

      // Verificar
      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('debería manejar múltiples intentos de login', () => {
      // Preparar
      component.username = 'testuser';
      component.password = 'password123';
      authServiceSpy.login.and.returnValue(of(mockUsuario));

      // Ejecutar - Primer intento
      component.login();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);

      // Ejecutar - Segundo intento (no debería ocurrir normalmente, pero por robustez)
      component.login();

      // Verificar
      expect(authServiceSpy.login).toHaveBeenCalledTimes(2);
    });
  });
}); 