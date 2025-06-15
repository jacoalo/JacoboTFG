import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CrearProyectoComponent } from './crear-proyecto.component';
import { ProyectoService, NavigationService } from '../../../core/services';

describe('CrearProyectoComponent', () => {
  let component: CrearProyectoComponent;
  let fixture: ComponentFixture<CrearProyectoComponent>;
  let mockProyectoService: jasmine.SpyObj<ProyectoService>;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const proyectoServiceSpy = jasmine.createSpyObj('ProyectoService', ['createProyecto']);
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'goBack']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CrearProyectoComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ProyectoService, useValue: proyectoServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { 
          provide: ActivatedRoute, 
          useValue: {
            snapshot: { params: {}, queryParams: {}, url: [], fragment: null, data: {} },
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearProyectoComponent);
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
      a2028: 0
    };

    mockProyectoService.createProyecto.and.returnValue(of(mockProyecto));
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
