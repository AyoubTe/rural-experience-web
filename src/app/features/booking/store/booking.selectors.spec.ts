import * as BookingSelectors from './booking.selectors';
import { initialBookingState } from './booking.state';

describe('selectBookingsByStatus', () => {
  it('groups bookings by status', () => {
    const state = {
      booking: {
        ...initialBookingState,
        bookings: [
          { id: 1, status: 'PENDING'   },
          { id: 2, status: 'CONFIRMED' },
          { id: 3, status: 'CANCELLED' },
          { id: 4, status: 'CONFIRMED' },
        ] as any[],
      }
    };

    const groups = BookingSelectors
      .selectBookingsByStatus.projector(state.booking.bookings);

    expect(groups.pending.length).toBe(1);
    expect(groups.confirmed.length).toBe(2);
    expect(groups.cancelled.length).toBe(1);
  });
});
