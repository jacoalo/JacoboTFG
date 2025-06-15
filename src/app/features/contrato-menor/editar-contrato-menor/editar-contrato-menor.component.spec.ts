import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarContratoMenorComponent } from './editar-contrato-menor.component';

describe('EditarContratoMenorComponent', () => {
  let component: EditarContratoMenorComponent;
  let fixture: ComponentFixture<EditarContratoMenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarContratoMenorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarContratoMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
