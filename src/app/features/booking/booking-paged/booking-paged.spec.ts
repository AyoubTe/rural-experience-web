import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPaged } from './booking-paged';

describe('BookingPaged', () => {
  let component: BookingPaged;
  let fixture: ComponentFixture<BookingPaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPaged]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPaged);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
