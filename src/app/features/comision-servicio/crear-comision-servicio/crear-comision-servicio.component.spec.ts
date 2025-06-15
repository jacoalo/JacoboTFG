import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearComisionServicioComponent } from './crear-comision-servicio.component';

describe('CrearComisionServicioComponent', () => {
  let component: CrearComisionServicioComponent;
  let fixture: ComponentFixture<CrearComisionServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearComisionServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearComisionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
