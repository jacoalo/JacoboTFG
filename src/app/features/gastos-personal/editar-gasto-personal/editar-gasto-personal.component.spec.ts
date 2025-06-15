import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGastoPersonalComponent } from './editar-gasto-personal.component';

describe('EditarGastoPersonalComponent', () => {
  let component: EditarGastoPersonalComponent;
  let fixture: ComponentFixture<EditarGastoPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarGastoPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarGastoPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
