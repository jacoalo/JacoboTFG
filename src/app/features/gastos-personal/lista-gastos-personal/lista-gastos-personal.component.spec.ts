import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaGastosPersonalComponent } from './lista-gastos-personal.component';

describe('ListaGastosPersonalComponent', () => {
  let component: ListaGastosPersonalComponent;
  let fixture: ComponentFixture<ListaGastosPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaGastosPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaGastosPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
