export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_DECLINED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'NEW_REVIEW'
  | 'BOOKING_REQUEST'       // Host receives this
  | 'SYSTEM';

export interface AppNotification {
  id:          string;       // UUID
  type:        NotificationType;
  title:       string;
  message:     string;
  relatedId:   number | null; // bookingId, experienceId, etc.
  relatedType: 'Booking' | 'Experience' | 'Review' | null;
  read:        boolean;
  createdAt:   string;       // ISO 8601
}
