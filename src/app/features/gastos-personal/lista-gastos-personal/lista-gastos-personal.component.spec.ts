import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ListaGastosPersonalComponent } from './lista-gastos-personal.component';
import { NavigationService } from '../../../core/services';

describe('ListaGastosPersonalComponent', () => {
  let component: ListaGastosPersonalComponent;
  let fixture: ComponentFixture<ListaGastosPersonalComponent>;

  beforeEach(async () => {
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['pushState']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListaGastosPersonalComponent, HttpClientTestingModule],
      providers: [
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

    fixture = TestBed.createComponent(ListaGastosPersonalComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
