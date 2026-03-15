import { Booking } from '@rxp/core/models/booking.model';
import {BookingResponse} from '@rxp/core/models/responses.model';

export interface BookingState {
  /** Explorer's own my-bookings */
  bookings:       BookingResponse[];

  /** Host's incoming my-bookings */
  hostBookings:   BookingResponse[];

  /** Currently viewed booking */
  selectedBookingId: number | null;

  /** Pagination */
  totalElements:  number;
  currentPage:    number;
  pageSize:       number;

  /** Async status flags */
  loading:        boolean;
  cancelling:     boolean;
  error:          string | null;
}

export const initialBookingState: BookingState = {
  bookings:          [],
  hostBookings:      [],
  selectedBookingId: null,
  totalElements:     0,
  currentPage:       0,
  pageSize:          10,
  loading:           false,
  cancelling:        false,
  error:             null,
};
