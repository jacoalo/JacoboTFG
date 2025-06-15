import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CrearContratoMenorComponent } from './crear-contrato-menor.component';
import { NavigationService } from '../../../core/services';

describe('CrearContratoMenorComponent', () => {
  let component: CrearContratoMenorComponent;
  let fixture: ComponentFixture<CrearContratoMenorComponent>;

  beforeEach(async () => {
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'goBack']);
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
        component: CrearContratoMenorComponent,
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
      imports: [CrearContratoMenorComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearContratoMenorComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
