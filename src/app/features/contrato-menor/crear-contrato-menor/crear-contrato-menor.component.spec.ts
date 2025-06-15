import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearContratoMenorComponent } from './crear-contrato-menor.component';

describe('CrearContratoMenorComponent', () => {
  let component: CrearContratoMenorComponent;
  let fixture: ComponentFixture<CrearContratoMenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearContratoMenorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearContratoMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
