import { bookingReducer }       from './booking.reducer';
import { initialBookingState }  from './booking.state';
import * as BookingActions      from './booking.actions';

describe('bookingReducer', () => {

  it('loadMyBookings sets loading to true', () => {
    const action = BookingActions.loadMyBookings({});
    const state  = bookingReducer(initialBookingState, action);

    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadMyBookingsSuccess stores bookings', () => {
    const action = BookingActions.loadMyBookingsSuccess({
      response: {
        content: [{ id: 1, status: 'PENDING' } as any],
        page: 0, size: 10, totalElements: 1,
        totalPages: 1, first: true, last: true,
        numberOfElements: 1,
      },
    });
    const state = bookingReducer(initialBookingState, action);

    expect(state.loading).toBeFalse();
    expect(state.bookings.length).toBe(1);
    expect(state.totalElements).toBe(1);
  });

  it('cancelBooking optimistically marks as CANCELLED', () => {
    const withBooking = {
      ...initialBookingState,
      bookings: [{ id: 42, status: 'PENDING' as const } as any],
    };
    const action = BookingActions.cancelBooking({ bookingId: 42 });
    const state  = bookingReducer(withBooking, action);

    expect(state.bookings[0].status).toBe('CANCELLED');
    expect(state.cancelling).toBeTrue();
  });

  it('cancelBookingFailure rolls back to PENDING', () => {
    const optimistic = {
      ...initialBookingState,
      bookings: [{ id: 42, status: 'CANCELLED' as const } as any],
      cancelling: true,
    };
    const action = BookingActions.cancelBookingFailure({
      bookingId: 42, error: 'Server error',
    });
    const state = bookingReducer(optimistic, action);

    expect(state.bookings[0].status).toBe('PENDING');
    expect(state.cancelling).toBeFalse();
    expect(state.error).toBe('Server error');
  });
});
