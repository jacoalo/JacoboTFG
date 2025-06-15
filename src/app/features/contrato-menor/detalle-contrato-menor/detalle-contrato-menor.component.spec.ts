import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleContratoMenorComponent } from './detalle-contrato-menor.component';

describe('DetalleContratoMenorComponent', () => {
  let component: DetalleContratoMenorComponent;
  let fixture: ComponentFixture<DetalleContratoMenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleContratoMenorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleContratoMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
