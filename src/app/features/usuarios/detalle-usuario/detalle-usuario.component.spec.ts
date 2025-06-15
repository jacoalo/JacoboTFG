import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DetalleUsuarioComponent } from './detalle-usuario.component';
import { NavigationService } from '../../../core/services';

describe('DetalleUsuarioComponent', () => {
  let component: DetalleUsuarioComponent;
  let fixture: ComponentFixture<DetalleUsuarioComponent>;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'goBack']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ dni: '12345678A' }),
      snapshot: {
        params: { dni: '12345678A' },
        queryParams: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: DetalleUsuarioComponent,
        routeConfig: null,
        root: {} as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: {
          get: (key: string) => key === 'dni' ? '12345678A' : null,
          has: (key: string) => key === 'dni',
          getAll: (key: string) => key === 'dni' ? ['12345678A'] : [],
          keys: ['dni']
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
      imports: [DetalleUsuarioComponent, HttpClientTestingModule],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleUsuarioComponent);
    component = fixture.componentInstance;
    mockNavigationService = TestBed.inject(NavigationService) as jasmine.SpyObj<NavigationService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
