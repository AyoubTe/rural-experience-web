import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingCard } from './booking-card';
import { BookingResponse } from '@rxp/core/models/responses.model';
import { HostProfileResponse } from '@rxp/core/models/responses.model';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

const mockHost: HostProfileResponse = {
  id:           20,
  userId:       5,
  firstName:    'Jean',
  lastName:     'Martin',
  location:     'Provence',
  totalEarnings: 0,
  verified:     true,
  createdAt:    '2025-01-01T00:00:00Z',
};

const pendingBooking: BookingResponse = {
  id:                   42,
  experienceId:         1,
  experienceTitle:      'Three-Day Lavender Harvest',
  experienceCoverPhoto: '',
  experienceLocation:   'Valensole',
  explorerId:           10,
  explorerFirstName:    'Marie',
  explorerLastName:     'Dupont',
  explorerEmail:        'marie@test.com',
  startDate:            '2025-07-01',
  endDate:              '2025-07-04',
  numberOfGuests:       2,
  totalPrice:           720,
  status:               'PENDING',
  specialRequests:      '',
  hostMessage:          '',
  cancellationReason:   '',
  canCancel:            true,
  canReview:            false,
  createdAt:            '2025-06-01T10:00:00Z',
  updatedAt:            '2025-06-01T10:00:00Z',
};

describe('BookingCard', () => {
  let component: BookingCard;
  let fixture: ComponentFixture<BookingCard>;

  async function setup(
    booking: BookingResponse = pendingBooking,
    isCancelling = false
  ) {
    await TestBed.configureTestingModule({
      imports: [BookingCard],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCard);
    component = fixture.componentInstance;

    // Set required inputs via the component reference
    fixture.componentRef.setInput('booking', booking);
    fixture.componentRef.setInput('host', mockHost);
    fixture.componentRef.setInput('isCancelling', isCancelling);

    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, component };
  }

  // ── Rendering ────────────────────────────────────────────────

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('displays experience title', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Three-Day Lavender Harvest');
  });

  it('displays location', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Valensole');
  });

  it('displays host name', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Jean Martin');
  });

  it('displays total price', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('720');
  });

  it('displays number of guests', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2');
  });

  // ── Status ───────────────────────────────────────────────────

  it('applies cancelled CSS class for CANCELLED status', async () => {
    await setup({ ...pendingBooking, status: 'CANCELLED' });
    const card = fixture.nativeElement.querySelector('.booking-card');
    expect(card?.classList).toContain('booking-card--cancelled');
  });

  it('applies cancelled CSS class for DECLINED status', async () => {
    await setup({ ...pendingBooking, status: 'DECLINED' });
    const card = fixture.nativeElement.querySelector('.booking-card');
    expect(card?.classList).toContain('booking-card--cancelled');
  });

  it('does NOT apply cancelled CSS class for PENDING status', async () => {
    await setup();
    const card = fixture.nativeElement.querySelector('.booking-card');
    expect(card?.classList).not.toContain('booking-card--cancelled');
  });

  // ── Cancel button ─────────────────────────────────────────────

  it('shows Cancel button when canCancel is true', async () => {
    await setup({ ...pendingBooking, canCancel: true });
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('cancel')
    );
    expect(cancelBtn).toBeTruthy();
  });

  it('does NOT show Cancel button when canCancel is false', async () => {
    await setup({ ...pendingBooking, canCancel: false });
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('cancel')
    );
    expect(cancelBtn).toBeFalsy();
  });

  it('shows Cancelling state when isCancelling is true', async () => {
    await setup(pendingBooking, true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.toLowerCase()).toContain('cancelling');
  });

  // ── Review button ─────────────────────────────────────────────

  it('shows Write Review button when canReview is true', async () => {
    await setup({ ...pendingBooking, canReview: true });
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const reviewBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('review')
    );
    expect(reviewBtn).toBeTruthy();
  });

  it('does NOT show Review button when canReview is false', async () => {
    await setup({ ...pendingBooking, canReview: false });
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const reviewBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('review')
    );
    expect(reviewBtn).toBeFalsy();
  });

  // ── Outputs ──────────────────────────────────────────────────

  it('emits cancel output when Cancel button clicked', async () => {
    await setup({ ...pendingBooking, canCancel: true });

    let emittedId: number | undefined;
    component.cancel.subscribe((id: number) => { emittedId = id; });

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('cancel')
    ) as HTMLButtonElement;

    cancelBtn.click();
    fixture.detectChanges();

    expect(emittedId).toBe(42);
  });

  it('emits review output when Write Review button clicked', async () => {
    await setup({ ...pendingBooking, canReview: true });

    let emitted = false;
    component.review.subscribe(() => { emitted = true; });

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const reviewBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('review')
    ) as HTMLButtonElement;

    reviewBtn.click();
    fixture.detectChanges();

    expect(emitted).toBeTrue();
  });

  // ── Special requests ──────────────────────────────────────────

  it('shows special requests when present', async () => {
    await setup({
      ...pendingBooking,
      specialRequests: 'Vegetarian meals please'
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Vegetarian meals please');
  });

  it('does NOT show special requests section when null', async () => {
    await setup({ ...pendingBooking, specialRequests: '' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Vegetarian meals');
  });
});
