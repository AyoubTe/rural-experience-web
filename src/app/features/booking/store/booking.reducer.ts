import { createReducer, on } from '@ngrx/store';
import * as BookingActions from './booking.actions';
import {
  BookingState, initialBookingState
} from './booking.state';

export const bookingReducer = createReducer(
  initialBookingState,

  // ── Load my my-bookings ──────────────────────────────────────────
  on(BookingActions.loadMyBookings, (state) => ({
    ...state,
    loading: true,
    error:   null,
  })),

  on(BookingActions.loadMyBookingsSuccess, (state, { response }) => ({
    ...state,
    loading:       false,
    bookings:      response.content,
    totalElements: response.totalElements,
    currentPage:   response.page,
  })),

  on(BookingActions.loadMyBookingsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Load host my-bookings ────────────────────────────────────────
  on(BookingActions.loadHostBookings, (state) => ({
    ...state, loading: true, error: null,
  })),

  on(BookingActions.loadHostBookingsSuccess,
    (state, { response }) => ({
      ...state,
      loading:       false,
      hostBookings:  response.content,
      totalElements: response.totalElements,
    })),

  on(BookingActions.loadHostBookingsFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),


  on(BookingActions.cancelBookingSuccess, (state) => ({
    ...state,
    cancelling: false,
  })),

  // ── Confirm booking (host) ───────────────────────────────────
  on(BookingActions.confirmBookingSuccess, (state, { booking }) => ({
    ...state,
    hostBookings: state.hostBookings.map(b =>
      b.id === booking.id ? booking : b
    ),
  })),

  // ── Decline booking (host) ───────────────────────────────────
  on(BookingActions.declineBookingSuccess, (state, { bookingId }) => ({
    ...state,
    hostBookings: state.hostBookings.map(b =>
      b.id === bookingId
        ? { ...b, status: 'DECLINED' as const }
        : b
    ),
  })),

  // ── Select booking ────────────────────────────────────────────
  on(BookingActions.selectBooking, (state, { bookingId }) => ({
    ...state,
    selectedBookingId: bookingId,
  })),

  // In cancelBooking reducer:
  on(BookingActions.cancelBooking, (state, { bookingId }) => ({
    ...state,
    cancelling: true,
    previousBookingStatus: state.bookings.find(b => b.id === bookingId)?.status ?? null,
    bookings: state.bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
    ),
  })),

  // In cancelBookingFailure reducer:
  on(BookingActions.cancelBookingFailure, (state, { bookingId, error }) => ({
    ...state,
    cancelling: false,
    error,
    previousBookingStatus: null,
    bookings: state.bookings.map(b =>
      b.id === bookingId
        ? { ...b, status: state.previousBookingStatus ?? 'PENDING' }
        : b
    ),
  })),
);
