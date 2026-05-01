import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStatusBadge } from './booking-status-badge';

describe('BookingStatusBadge', () => {
  let component: BookingStatusBadge;
  let fixture: ComponentFixture<BookingStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingStatusBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingStatusBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
