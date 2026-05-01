import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCentre } from './notification-centre';

describe('NotificationCentre', () => {
  let component: NotificationCentre;
  let fixture: ComponentFixture<NotificationCentre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCentre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationCentre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
