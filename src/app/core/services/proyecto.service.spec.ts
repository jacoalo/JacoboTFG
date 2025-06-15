import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProyectoService } from './proyecto.service';
import { AuthService } from './auth.service';
import { Proyecto, Usuario, GastosPersonal, Personal } from '../models';
import { of, throwError } from 'rxjs';

describe('ProyectoService', () => {
  let service: ProyectoService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  const API_URL = 'http://localhost:3000';

  const mockGestor: Usuario = {
    dni: '12345678A',
    login: 'gestor1',
    nombre: 'Gestor',
    apellido1: 'Test',
    investigador: false
  };

  const mockInvestigador: Usuario = {
    dni: '87654321B',
    login: 'investigador1',
    nombre: 'Investigador',
    apellido1: 'Test',
    investigador: true
  };

  const mockProyecto: Proyecto = {
    IDProyecto: 'PROJ001',
    ip: '87654321B',
    finalidad: 'Investigación en IA',
    cantidad_total: 100000,
    a2024: 25000,
    a2025: 25000,
    a2026: 25000,
    a2027: 25000,
    a2028: 0,
    icu: 'ICU001',
    cuenta_interna: 'CI001'
  };

  const mockProyectos: Proyecto[] = [
    mockProyecto,
    {
      IDProyecto: 'PROJ002',
      ip: '87654321B',
      finalidad: 'Desarrollo de software',
      cantidad_total: 75000,
      a2024: 15000,
      a2025: 20000,
      a2026: 20000,
      a2027: 20000,
      a2028: 0
    }
  ];

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProyectoService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(ProyectoService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Inicialización del servicio', () => {
    it('debería crearse correctamente', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProyectos()', () => {
    it('debería obtener todos los proyectos para un gestor', (done) => {
      // Preparar
      authServiceSpy.getCurrentUser.and.returnValue(mockGestor);

      // Ejecutar
      service.getProyectos().subscribe({
        next: (proyectos) => {
          // Verificar
          expect(proyectos).toEqual(mockProyectos);
          expect(proyectos.length).toBe(2);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProyectos);
    });

    it('debería obtener solo proyectos asignados para un investigador', (done) => {
      // Preparar
      authServiceSpy.getCurrentUser.and.returnValue(mockInvestigador);
      const proyectosInvestigador = [mockProyecto]; // Solo proyectos donde IP = DNI investigador

      // Ejecutar
      service.getProyectos().subscribe({
        next: (proyectos) => {
          // Verificar
          expect(proyectos).toEqual(proyectosInvestigador);
          expect(proyectos.length).toBe(1);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?ip=eq.${mockInvestigador.dni}`);
      expect(req.request.method).toBe('GET');
      req.flush(proyectosInvestigador);
    });

    it('debería manejar error cuando no hay usuario autenticado', (done) => {
      // Preparar
      authServiceSpy.getCurrentUser.and.returnValue(null);

      // Ejecutar
      service.getProyectos().subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Usuario no autenticado');
          done();
        }
      });
    });

    it('debería manejar errores HTTP correctamente', (done) => {
      // Preparar
      authServiceSpy.getCurrentUser.and.returnValue(mockGestor);

      // Ejecutar
      service.getProyectos().subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error al obtener proyectos');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getProyecto()', () => {
    it('debería obtener un proyecto específico por ID', (done) => {
      // Preparar
      const proyectoId = 'PROJ001';

      // Ejecutar
      service.getProyecto(proyectoId).subscribe({
        next: (proyecto) => {
          // Verificar
          expect(proyecto).toEqual(mockProyecto);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProyecto);
    });

    it('debería manejar errores al obtener proyecto específico', (done) => {
      // Preparar
      const proyectoId = 'PROJ999';

      // Ejecutar
      service.getProyecto(proyectoId).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error al obtener proyecto');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      req.error(new ErrorEvent('Not found'));
    });
  });

  describe('createProyecto()', () => {
    it('debería crear un proyecto correctamente', (done) => {
      // Preparar
      const nuevoProyecto: Proyecto = {
        IDProyecto: 'PROJ003',
        ip: '12345678A',
        finalidad: 'Nuevo proyecto de investigación',
        cantidad_total: 50000,
        a2024: 10000,
        a2025: 15000,
        a2026: 15000,
        a2027: 10000,
        a2028: 0
      };

      // Ejecutar
      service.createProyecto(nuevoProyecto).subscribe({
        next: (proyecto) => {
          // Verificar
          expect(proyecto).toEqual(nuevoProyecto);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoProyecto);
      req.flush(nuevoProyecto);
    });

    it('debería manejar errores al crear proyecto', (done) => {
      // Preparar
      const nuevoProyecto: Proyecto = {
        IDProyecto: 'PROJ003',
        ip: '12345678A',
        finalidad: 'Nuevo proyecto',
        cantidad_total: 50000,
        a2024: 10000,
        a2025: 15000,
        a2026: 15000,
        a2027: 10000,
        a2028: 0
      };

      // Ejecutar
      service.createProyecto(nuevoProyecto).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error al crear proyecto');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto`);
      req.error(new ErrorEvent('Server error'));
    });
  });

  describe('updateProyecto()', () => {
    it('debería actualizar un proyecto correctamente', (done) => {
      // Preparar
      const proyectoId = 'PROJ001';
      const datosActualizacion = { finalidad: 'Finalidad actualizada' };
      const proyectoActualizado = { ...mockProyecto, ...datosActualizacion };

      // Ejecutar
      service.updateProyecto(proyectoId, datosActualizacion).subscribe({
        next: (proyecto) => {
          // Verificar
          expect(proyecto).toEqual(proyectoActualizado);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(datosActualizacion);
      req.flush(proyectoActualizado);
    });

    it('debería manejar errores al actualizar proyecto', (done) => {
      // Preparar
      const proyectoId = 'PROJ001';
      const datosActualizacion = { finalidad: 'Finalidad actualizada' };

      // Ejecutar
      service.updateProyecto(proyectoId, datosActualizacion).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error al actualizar proyecto');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      req.error(new ErrorEvent('Update error'));
    });
  });

  describe('deleteProyecto()', () => {
    it('debería eliminar un proyecto correctamente', (done) => {
      // Preparar
      const proyectoId = 'PROJ001';

      // Ejecutar
      service.deleteProyecto(proyectoId).subscribe({
        next: (response) => {
          // Verificar
          expect(response).toBeTruthy();
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('debería manejar errores al eliminar proyecto', (done) => {
      // Preparar
      const proyectoId = 'PROJ001';

      // Ejecutar
      service.deleteProyecto(proyectoId).subscribe({
        error: (error) => {
          // Verificar
          expect(error.message).toBe('Error al eliminar proyecto');
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.${proyectoId}`);
      req.error(new ErrorEvent('Delete error'));
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar respuesta vacía en getProyectos', (done) => {
      // Preparar
      authServiceSpy.getCurrentUser.and.returnValue(mockGestor);

      // Ejecutar
      service.getProyectos().subscribe({
        next: (proyectos) => {
          // Verificar
          expect(proyectos).toEqual([]);
          expect(proyectos.length).toBe(0);
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto`);
      req.flush([]);
    });

    it('debería manejar proyecto con campos opcionales undefined', (done) => {
      // Preparar
      const proyectoMinimo: Proyecto = {
        IDProyecto: 'PROJ_MIN',
        ip: '12345678A',
        finalidad: 'Proyecto mínimo',
        cantidad_total: 1000,
        a2024: 1000,
        a2025: 0,
        a2026: 0,
        a2027: 0,
        a2028: 0
        // icu y cuenta_interna son undefined
      };

      // Ejecutar
      service.getProyecto('PROJ_MIN').subscribe({
        next: (proyecto) => {
          // Verificar
          expect(proyecto).toEqual(proyectoMinimo);
          expect(proyecto.icu).toBeUndefined();
          expect(proyecto.cuenta_interna).toBeUndefined();
          done();
        }
      });

      // Verificar HTTP request
      const req = httpMock.expectOne(`${API_URL}/Proyecto?IDProyecto=eq.PROJ_MIN`);
      req.flush(proyectoMinimo);
    });
  });

  describe('Integración con AuthService', () => {
    it('debería cambiar comportamiento según tipo de usuario', (done) => {
      let completedTests = 0;
      const checkCompletion = () => {
        completedTests++;
        if (completedTests === 2) done();
      };

      // Test para gestor
      authServiceSpy.getCurrentUser.and.returnValue(mockGestor);
      service.getProyectos().subscribe({
        next: (proyectos) => {
          expect(proyectos).toEqual([]);
          expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
          checkCompletion();
        }
      });
      let req = httpMock.expectOne(`${API_URL}/Proyecto`);
      req.flush([]);

      // Test para investigador
      authServiceSpy.getCurrentUser.and.returnValue(mockInvestigador);
      service.getProyectos().subscribe({
        next: (proyectos) => {
          expect(proyectos).toEqual([]);
          expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
          checkCompletion();
        }
      });
      req = httpMock.expectOne(`${API_URL}/Proyecto?ip=eq.${mockInvestigador.dni}`);
      req.flush([]);
    });
  });
}); 