import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acertos } from './acertos';

describe('Acertos', () => {
  let component: Acertos;
  let fixture: ComponentFixture<Acertos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acertos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acertos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
