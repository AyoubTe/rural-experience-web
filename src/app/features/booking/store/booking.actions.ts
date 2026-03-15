import { createAction, props } from '@ngrx/store';
import { PageResponse } from '@rxp/core/models/api.model';
import {BookingResponse} from '@rxp/core/models/responses.model';

// ── Load explorer's my-bookings ────────────────────────────────────
export const loadMyBookings = createAction(
  '[Booking] Load My Bookings',
  props<{ page?: number; size?: number }>()
);

export const loadMyBookingsSuccess = createAction(
  '[Booking] Load My Bookings Success',
  props<{ response: PageResponse<BookingResponse> }>()
);

export const loadMyBookingsFailure = createAction(
  '[Booking] Load My Bookings Failure',
  props<{ error: string }>()
);

// ── Load host's incoming my-bookings ────────────────────────────────
export const loadHostBookings = createAction(
  '[Booking] Load Host Bookings',
  props<{ page?: number }>()
);

export const loadHostBookingsSuccess = createAction(
  '[Booking] Load Host Bookings Success',
  props<{ response: PageResponse<BookingResponse> }>()
);

export const loadHostBookingsFailure = createAction(
  '[Booking] Load Host Bookings Failure',
  props<{ error: string }>()
);

// ── Cancel booking (explorer) ────────────────────────────────────
export const cancelBooking = createAction(
  '[Booking] Cancel Booking',
  props<{ bookingId: number }>()
);

export const cancelBookingSuccess = createAction(
  '[Booking] Cancel Booking Success',
  props<{ bookingId: number }>()
);

export const cancelBookingFailure = createAction(
  '[Booking] Cancel Booking Failure',
  props<{ bookingId: number; error: string }>()
);

// ── Confirm booking (host) ────────────────────────────────────────
export const confirmBooking = createAction(
  '[Booking] Confirm Booking',
  props<{ bookingId: number }>()
);

export const confirmBookingSuccess = createAction(
  '[Booking] Confirm Booking Success',
  props<{ booking: BookingResponse }>()
);

export const confirmBookingFailure = createAction(
  '[Booking] Confirm Booking Failure',
  props<{ bookingId: number; error: string }>()
);

// ── Decline booking (host) ────────────────────────────────────────
export const declineBooking = createAction(
  '[Booking] Decline Booking',
  props<{ bookingId: number; reason?: string }>()
);

export const declineBookingSuccess = createAction(
  '[Booking] Decline Booking Success',
  props<{ bookingId: number }>()
);

export const declineBookingFailure = createAction(
  '[Booking] Decline Booking Failure',
  props<{ bookingId: number; error: string }>()
);

// ── Select a booking ──────────────────────────────────────────────
export const selectBooking = createAction(
  '[Booking] Select Booking',
  props<{ bookingId: number | null }>()
);
