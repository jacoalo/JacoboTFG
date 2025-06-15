import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleGastoPersonalComponent } from './detalle-gasto-personal.component';

describe('DetalleGastoPersonalComponent', () => {
  let component: DetalleGastoPersonalComponent;
  let fixture: ComponentFixture<DetalleGastoPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleGastoPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleGastoPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
