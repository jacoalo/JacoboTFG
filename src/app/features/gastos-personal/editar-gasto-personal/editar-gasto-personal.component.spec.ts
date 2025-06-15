import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { EditarGastoPersonalComponent } from './editar-gasto-personal.component';
import { NavigationService } from '../../../core/services';

describe('EditarGastoPersonalComponent', () => {
  let component: EditarGastoPersonalComponent;
  let fixture: ComponentFixture<EditarGastoPersonalComponent>;

  beforeEach(async () => {
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState', 'goBack']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    const mockActivatedRoute = {
      params: of({ id: '1' }),
      snapshot: {
        params: { id: '1' },
        queryParams: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: EditarGastoPersonalComponent,
        routeConfig: null,
        root: {} as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: {
          get: (key: string) => key === 'id' ? '1' : null,
          has: (key: string) => key === 'id',
          getAll: (key: string) => key === 'id' ? ['1'] : [],
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
      imports: [EditarGastoPersonalComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarGastoPersonalComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
