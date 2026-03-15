export interface Booking {
  id:               number;
  status:           BookingStatus;
  startDate:        string;
  endDate:          string;
  numberOfGuests:   number;
  totalPrice:       number;
  specialRequests:  string | null;
  createdAt:        string;
  experience:       BookingExperienceSummary;
  explorer:         BookingUserSummary;
  host:             BookingUserSummary;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface BookingExperienceSummary {
  id:            number;
  title:         string;
  coverPhotoUrl: string | null;
  location:      string;
}

export interface BookingUserSummary {
  id:        number;
  firstName: string;
  lastName:  string;
  avatarUrl: string | null;
}

export interface CreateBookingRequest {
  experienceId:    number;
  startDate:       string;
  endDate:         string;
  numberOfGuests:  number;
  specialRequests?: string;
}
