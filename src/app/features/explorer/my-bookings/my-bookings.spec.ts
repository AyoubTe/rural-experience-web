import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBookings } from './my-bookings';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import * as BookingSelectors from '../../booking/store/booking.selectors';
import * as BookingActions   from '../../booking/store/booking.actions';
import { BookingResponse }   from '@rxp/core/models/responses.model';

const pendingBooking: BookingResponse = {
  id:                   1,
  experienceId:         1,
  experienceTitle:      'Farm Visit',
  experienceCoverPhoto: '',
  experienceLocation:   'Lyon',
  explorerId:           10,
  explorerFirstName:    'Alice',
  explorerLastName:     'Wonder',
  explorerEmail:        'alice@test.com',
  startDate:            '2025-08-01',
  endDate:              '2025-08-04',
  numberOfGuests:       2,
  totalPrice:           480,
  status:               'PENDING',
  specialRequests:      '',
  hostMessage:          '',
  cancellationReason:   '',
  canCancel:            true,
  canReview:            false,
  createdAt:            '2025-07-01T10:00:00Z',
  updatedAt:            '2025-07-01T10:00:00Z',
};

const completedBooking: BookingResponse = {
  ...pendingBooking,
  id:     2,
  status: 'COMPLETED',
  canCancel: false,
  canReview: true,
};

const cancelledBooking: BookingResponse = {
  ...pendingBooking,
  id:     3,
  status: 'CANCELLED',
  canCancel: false,
};

const confirmedBooking: BookingResponse = {
  ...pendingBooking,
  id:     4,
  status: 'CONFIRMED',
};

// ── Default store state ──────────────────────────────────────────
const defaultSelectorValues = {
  [BookingSelectors.selectBookingsByStatus.projector.name]: {
    pending:   [pendingBooking],
    confirmed: [confirmedBooking],
    completed: [completedBooking],
    cancelled: [cancelledBooking],
  },
  bookingLoading:  false,
  bookingError:    null,
  totalElements:   4,
  currentPage:     0,
  bookingSummary: {
    totalBookings:    4,
    upcoming:         1,
    awaitingResponse: 1,
    experiencesHad:   1,
  },
};

describe('MyBookings', () => {
  let component: MyBookings;
  let fixture: ComponentFixture<MyBookings>;
  let store: MockStore;

  async function setup(overrides: {
    pending?:   BookingResponse[];
    confirmed?: BookingResponse[];
    completed?: BookingResponse[];
    cancelled?: BookingResponse[];
  } = {}) {
    const pending   = overrides.pending   ?? [pendingBooking];
    const confirmed = overrides.confirmed ?? [confirmedBooking];
    const completed = overrides.completed ?? [completedBooking];
    const cancelled = overrides.cancelled ?? [cancelledBooking];

    await TestBed.configureTestingModule({
      imports: [MyBookings],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [
            {
              selector: BookingSelectors.selectBookingsByStatus,
              value: { pending, confirmed, completed, cancelled },
            },
            {
              selector: BookingSelectors.selectBookingLoading,
              value: false,
            },
            {
              selector: BookingSelectors.selectBookingError,
              value: null,
            },
            {
              selector: BookingSelectors.selectTotalElements,
              value: pending.length + confirmed.length +
                     completed.length + cancelled.length,
            },
            {
              selector: BookingSelectors.selectCurrentPage,
              value: 0,
            },
            {
              selector: BookingSelectors.selectBookingSummary,
              value: {
                totalBookings:    4,
                upcoming:         confirmed.length,
                awaitingResponse: pending.length,
                experiencesHad:   completed.length,
              },
            },
            {
              selector: BookingSelectors.selectBookingCancelling,
              value: false,
            },
          ],
        }),
        {
          provide:  MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(true) }),
          },
        },
      ],
    }).compileComponents();

    store     = TestBed.inject(MockStore);
    fixture   = TestBed.createComponent(MyBookings);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, component, store };
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── Creation ──────────────────────────────────────────────────

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  // ── Init dispatch ─────────────────────────────────────────────

  it('dispatches loadMyBookings on init', async () => {
    const { store } = await setup();
    const dispatched = store.scannedActions$;
    let called = false;
    dispatched.subscribe(action => {
      if (action.type === '[Booking] Load My Bookings') called = true;
    });
    expect(called).toBeTrue();
  });

  // ── Rendering ─────────────────────────────────────────────────

  it('renders experience title in pending tab', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Farm Visit');
  });

  it('shows summary stat — awaiting response count', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1');
  });

  // ── Empty states ──────────────────────────────────────────────

  it('shows empty state when no upcoming bookings', async () => {
    await setup({ pending: [], confirmed: [] });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Browse Experiences');
  });

  it('shows empty message when no pending bookings', async () => {
    await setup({ pending: [] });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No pending requests');
  });

  it('shows empty message when no completed bookings', async () => {
    await setup({ completed: [] });
    const el = fixture.nativeElement as HTMLElement;
    // Switch to completed tab first
    const tabs = el.querySelectorAll('.mat-mdc-tab');
    const completedTab = Array.from(tabs).find(t =>
      t.textContent?.toLowerCase().includes('completed')
    ) as HTMLElement;
    completedTab?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.textContent).toContain('No completed bookings');
  });

  it('shows empty message when no cancelled bookings', async () => {
    await setup({ cancelled: [] });
    const el = fixture.nativeElement as HTMLElement;
    const tabs = el.querySelectorAll('.mat-mdc-tab');
    const cancelledTab = Array.from(tabs).find(t =>
      t.textContent?.toLowerCase().includes('cancelled')
    ) as HTMLElement;
    cancelledTab?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.textContent).toContain('No cancelled bookings');
  });

  // ── Cancel flow ───────────────────────────────────────────────

  it('dispatches cancelBooking when cancel confirmed via dialog', async () => {
    const { store } = await setup();
    spyOn(store, 'dispatch');

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('cancel')
    ) as HTMLButtonElement;

    cancelBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.dispatch).toHaveBeenCalledWith(
      BookingActions.cancelBooking({ bookingId: 1 })
    );
  });

  it('does NOT dispatch cancelBooking when dialog is dismissed', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MyBookings],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [
            {
              selector: BookingSelectors.selectBookingsByStatus,
              value: {
                pending:   [pendingBooking],
                confirmed: [],
                completed: [],
                cancelled: [],
              },
            },
            { selector: BookingSelectors.selectBookingLoading, value: false },
            { selector: BookingSelectors.selectBookingError,   value: null },
            { selector: BookingSelectors.selectTotalElements,  value: 1 },
            { selector: BookingSelectors.selectCurrentPage,    value: 0 },
            { selector: BookingSelectors.selectBookingSummary, value: {
              totalBookings: 1, upcoming: 0,
              awaitingResponse: 1, experiencesHad: 0,
            }},
            { selector: BookingSelectors.selectBookingCancelling, value: false },
          ],
        }),
        // Dialog returns false — user dismissed
        {
          provide:  MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(false) }) },
        },
      ],
    }).compileComponents();

    store   = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MyBookings);
    fixture.detectChanges();
    await fixture.whenStable();

    spyOn(store, 'dispatch');

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(b =>
      b.textContent?.toLowerCase().includes('cancel')
    ) as HTMLButtonElement;

    cancelBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: '[Booking] Cancel Booking' })
    );
  });

  // ── Loading state ─────────────────────────────────────────────

  it('shows progress bar when loading is true', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MyBookings],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [
            {
              selector: BookingSelectors.selectBookingsByStatus,
              value: { pending: [], confirmed: [], completed: [], cancelled: [] },
            },
            { selector: BookingSelectors.selectBookingLoading, value: true },
            { selector: BookingSelectors.selectBookingError,   value: null },
            { selector: BookingSelectors.selectTotalElements,  value: 0 },
            { selector: BookingSelectors.selectCurrentPage,    value: 0 },
            { selector: BookingSelectors.selectBookingSummary, value: {
              totalBookings: 0, upcoming: 0,
              awaitingResponse: 0, experiencesHad: 0,
            }},
            { selector: BookingSelectors.selectBookingCancelling, value: false },
          ],
        }),
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookings);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const progressBar = el.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });
});
