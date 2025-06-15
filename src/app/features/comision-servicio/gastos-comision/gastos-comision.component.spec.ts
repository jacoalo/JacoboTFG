import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastosComisionComponent } from './gastos-comision.component';

describe('GastosComisionComponent', () => {
  let component: GastosComisionComponent;
  let fixture: ComponentFixture<GastosComisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastosComisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastosComisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
