import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mecanicos } from './mecanicos';

describe('Mecanicos', () => {
  let component: Mecanicos;
  let fixture: ComponentFixture<Mecanicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mecanicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mecanicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
