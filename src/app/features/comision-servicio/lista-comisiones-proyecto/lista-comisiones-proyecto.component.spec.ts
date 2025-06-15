import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaComisionesProyectoComponent } from './lista-comisiones-proyecto.component';

describe('ListaComisionesProyectoComponent', () => {
  let component: ListaComisionesProyectoComponent;
  let fixture: ComponentFixture<ListaComisionesProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaComisionesProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaComisionesProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
