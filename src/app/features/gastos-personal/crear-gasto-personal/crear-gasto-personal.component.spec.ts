import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGastoPersonalComponent } from './crear-gasto-personal.component';

describe('CrearGastoPersonalComponent', () => {
  let component: CrearGastoPersonalComponent;
  let fixture: ComponentFixture<CrearGastoPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGastoPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearGastoPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
