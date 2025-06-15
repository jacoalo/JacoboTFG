import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ListaComisionesProyectoComponent } from './lista-comisiones-proyecto.component';
import { NavigationService } from '../../../core/services';

describe('ListaComisionesProyectoComponent', () => {
  let component: ListaComisionesProyectoComponent;
  let fixture: ComponentFixture<ListaComisionesProyectoComponent>;

  beforeEach(async () => {
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    const mockActivatedRoute = {
      params: of({ id: 'PROJ001' }),
      snapshot: {
        params: { id: 'PROJ001' },
        queryParams: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: ListaComisionesProyectoComponent,
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
      imports: [ListaComisionesProyectoComponent, HttpClientTestingModule],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaComisionesProyectoComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
