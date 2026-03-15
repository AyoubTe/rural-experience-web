import { createFeatureSelector, createSelector }
  from '@ngrx/store';
import { BookingState } from './booking.state';

// Feature selector — selects the 'booking' slice of the root state
export const selectBookingState =
  createFeatureSelector<BookingState>('booking');

// ── Basic selectors ────────────────────────────────────────────
export const selectMyBookings = createSelector(
  selectBookingState,
  (state) => state.bookings
);

export const selectHostBookings = createSelector(
  selectBookingState,
  (state) => state.hostBookings
);

export const selectBookingLoading = createSelector(
  selectBookingState,
  (state) => state.loading
);

export const selectBookingError = createSelector(
  selectBookingState,
  (state) => state.error
);

export const selectTotalElements = createSelector(
  selectBookingState,
  (state) => state.totalElements
);

export const selectCurrentPage = createSelector(
  selectBookingState,
  (state) => state.currentPage
);

export const selectSelectedBookingId = createSelector(
  selectBookingState,
  (state) => state.selectedBookingId
);

// ── Composed selectors ────────────────────────────────────────
export const selectSelectedBooking = createSelector(
  selectMyBookings,
  selectSelectedBookingId,
  (bookings, id) =>
    id !== null
      ? bookings.find(b => b.id === id) ?? null
      : null
);

/** Bookings grouped by status for the explorer dashboard */
export const selectBookingsByStatus = createSelector(
  selectMyBookings,
  (bookings) => ({
    pending:   bookings.filter(b => b.status === 'PENDING'),
    confirmed: bookings.filter(b => b.status === 'CONFIRMED'),
    completed: bookings.filter(b => b.status === 'COMPLETED'),
    cancelled: bookings.filter(b => b.status === 'CANCELLED'),
  })
);

/** Pending host my-bookings that need action */
export const selectPendingHostBookings = createSelector(
  selectHostBookings,
  (bookings) => bookings.filter(b => b.status === 'PENDING')
);

export const selectPendingHostBookingCount = createSelector(
  selectPendingHostBookings,
  (pending) => pending.length
);

export const selectBookingCancelling = createSelector(
  selectBookingState,
  (state) => state.cancelling
);


export const selectBookingSummary = createSelector(
  selectBookingsByStatus,
  (groups) => ({
    totalBookings:    Object.values(groups)
      .reduce((sum, list) => sum + list.length, 0),
    upcoming:         groups.confirmed.length,
    awaitingResponse: groups.pending.length,
    experiencesHad:   groups.completed.length,
  })
);
