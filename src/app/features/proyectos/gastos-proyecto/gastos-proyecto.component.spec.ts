import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastosProyectoComponent } from './gastos-proyecto.component';

describe('GastosProyectoComponent', () => {
  let component: GastosProyectoComponent;
  let fixture: ComponentFixture<GastosProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastosProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastosProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
