import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, EMPTY } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { AuthService, ProyectoService, NavigationService } from '../../core/services';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockProyectoService: jasmine.SpyObj<ProyectoService>;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isGestor', 'logout']);
    const proyectoServiceSpy = jasmine.createSpyObj('ProyectoService', ['getProyectos']);
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'clearStack']);
    
    const mockActivatedRoute = {
      params: of({}),
      snapshot: {
        params: {},
        queryParams: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: DashboardComponent,
        routeConfig: null,
        root: {} as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: {
          get: () => null,
          has: () => false,
          getAll: () => [],
          keys: []
        },
        queryParamMap: {
          get: () => null,
          has: () => false,
          getAll: () => [],
          keys: []
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent, 
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProyectoService, useValue: proyectoServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockProyectoService = TestBed.inject(ProyectoService) as jasmine.SpyObj<ProyectoService>;
    mockNavigationService = TestBed.inject(NavigationService) as jasmine.SpyObj<NavigationService>;
    httpMock = TestBed.inject(HttpTestingController);

    const mockUser = {
      dni: '12345678A',
      login: 'testuser',
      nombre: 'Test',
      apellido1: 'User',
      apellido2: 'Apellido2',
      investigador: false
    };

    const mockProyectos = [
      {
        IDProyecto: 'PROJ001',
        ip: '12345678A',
        finalidad: 'Investigación en IA',
        cantidad_total: 50000,
        a2024: 20000,
        a2025: 15000,
        a2026: 10000,
        a2027: 5000,
        a2028: 0,
        icu: 'ICU001',
        cuenta_interna: 'CI001'
      }
    ];

    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockAuthService.isGestor.and.returnValue(true);
    mockProyectoService.getProyectos.and.returnValue(of(mockProyectos));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

      it('debería inicializar con usuario actual', () => {
    // Ejecutar
    component.ngOnInit();
    
    // Simular petición HTTP para investigadores
    const req = httpMock.expectOne('http://localhost:3000/Usuario?investigador=eq.true');
    req.flush([]);
    
    // Verificar
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(component.currentUser).toBeTruthy();
    expect(mockNavigationService.clearStack).toHaveBeenCalled();
    expect(mockNavigationService.pushState).toHaveBeenCalledWith('/dashboard', 'Dashboard');
  });

      it('debería cargar proyectos', () => {
    // Ejecutar
    component.ngOnInit();
    
    // Simular petición HTTP para investigadores
    const reqInvestigadores = httpMock.expectOne('http://localhost:3000/Usuario?investigador=eq.true');
    reqInvestigadores.flush([]);
    
    // Verificar
    expect(mockProyectoService.getProyectos).toHaveBeenCalled();
    expect(component.proyectos.length).toBe(1);
  });

      it('debería verificar si el usuario es gestor', () => {
    // Ejecutar
    const result = component.isGestor();
    
    // Verificar
    expect(mockAuthService.isGestor).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

      it('debería cerrar sesión y navegar al login', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
}); 