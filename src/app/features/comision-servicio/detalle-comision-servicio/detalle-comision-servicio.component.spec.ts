import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleComisionServicioComponent } from './detalle-comision-servicio.component';

describe('DetalleComisionServicioComponent', () => {
  let component: DetalleComisionServicioComponent;
  let fixture: ComponentFixture<DetalleComisionServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleComisionServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleComisionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
