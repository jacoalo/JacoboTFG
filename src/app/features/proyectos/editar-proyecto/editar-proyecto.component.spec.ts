import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { EditarProyectoComponent } from './editar-proyecto.component';
import { ProyectoService, NavigationService } from '../../../core/services';

describe('EditarProyectoComponent', () => {
  let component: EditarProyectoComponent;
  let fixture: ComponentFixture<EditarProyectoComponent>;
  let mockProyectoService: jasmine.SpyObj<ProyectoService>;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const proyectoServiceSpy = jasmine.createSpyObj('ProyectoService', ['getProyecto', 'updateProyecto']);
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'goBack']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ id: 'PROJ001' }),
      snapshot: {
        params: { id: 'PROJ001' },
        queryParams: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: EditarProyectoComponent,
        routeConfig: null,
        root: {} as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: {
          get: (key: string) => key === 'id' ? 'PROJ001' : null,
          has: (key: string) => key === 'id',
          getAll: (key: string) => key === 'id' ? ['PROJ001'] : [],
          keys: ['id']
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
      imports: [EditarProyectoComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ProyectoService, useValue: proyectoServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarProyectoComponent);
    component = fixture.componentInstance;
    mockProyectoService = TestBed.inject(ProyectoService) as jasmine.SpyObj<ProyectoService>;
    mockNavigationService = TestBed.inject(NavigationService) as jasmine.SpyObj<NavigationService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    const mockProyecto = {
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
    };

    mockProyectoService.getProyecto.and.returnValue(of(mockProyecto));
    mockProyectoService.updateProyecto.and.returnValue(of(mockProyecto));
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
