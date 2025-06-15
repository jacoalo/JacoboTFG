import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaContratosProyectoComponent } from './lista-contratos-proyecto.component';

describe('ListaContratosProyectoComponent', () => {
  let component: ListaContratosProyectoComponent;
  let fixture: ComponentFixture<ListaContratosProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaContratosProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaContratosProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
