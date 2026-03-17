import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclineDialog } from './decline-dialog';

describe('DeclineDialog', () => {
  let component: DeclineDialog;
  let fixture: ComponentFixture<DeclineDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclineDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclineDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
