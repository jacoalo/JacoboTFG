import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarComisionServicioComponent } from './editar-comision-servicio.component';

describe('EditarComisionServicioComponent', () => {
  let component: EditarComisionServicioComponent;
  let fixture: ComponentFixture<EditarComisionServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarComisionServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarComisionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
