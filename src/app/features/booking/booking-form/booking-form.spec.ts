import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingForm } from './booking-form';

describe('BookingForm', () => {
  let component: BookingForm;

  beforeEach(() => {
    // Reactive forms test with NO DOM — just the TypeScript class
    component = new BookingForm();
  });

  it('form is invalid when empty', () => {
    expect(component.bookingForm.valid).toBeFalse();
  });

  it('startDate is required', () => {
    const ctrl = component.bookingForm.get('startDate');
    ctrl?.setValue(null);
    expect(ctrl?.hasError('required')).toBeTrue();
  });

  it('rejects a past start date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    component.bookingForm.get('startDate')?.setValue(yesterday);
    expect(component.bookingForm.get('startDate')?.hasError('notInPast'))
      .toBeTrue();
  });

  it('rejects end date before start date', () => {
    const tomorrow  = new Date();
    const yesterday = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    yesterday.setDate(yesterday.getDate() - 1);

    component.bookingForm.patchValue({
      startDate: tomorrow,
      endDate:   tomorrow,   // same day — not after
    });

    expect(component.bookingForm.hasError('endAfterStart'))
      .toBeTrue();
  });

  it('computes total price correctly', () => {
    const start = new Date();
    const end   = new Date();
    end.setDate(start.getDate() + 3);  // 3 days

    component.bookingForm.patchValue({
      startDate:      start,
      endDate:        end,
      numberOfGuests: 2,
    });

    // price × guests × days = 120 × 2 × 3 = 720
    // (assumes experience().pricePerPerson === 120)
    expect(component.totalPrice()).toBe(720);
  });

  it('markAllAsTouched on invalid submit', () => {
    spyOn(component.bookingForm, 'markAllAsTouched');
    component.onSubmit();
    expect(component.bookingForm.markAllAsTouched)
      .toHaveBeenCalled();
  });
});
