// ==========================================
// ENUMS
// ==========================================

export type Role = 'EXPLORER' | 'HOST' | 'ADMIN';

// ==========================================
// AUTHENTICATION REQUESTS
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;       // min: 8, max: 100
  firstName: string;      // min: 2, max: 50
  lastName: string;       // min: 2, max: 50
  role: Role;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==========================================
// EXPERIENCE REQUESTS
// ==========================================

export interface AgendaItemRequest {
  dayNumber: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateExperienceRequest {
  title: string;                  // min: 5, max: 150
  shortDescription: string;       // min: 20, max: 500
  fullDescription: string;
  pricePerPerson: number;         // min: 1.00
  durationDays: number;           // min: 1, max: 30
  maxGuests: number;              // min: 1, max: 50
  location: string;
  latitude?: number;
  longitude?: number;
  categoryId: number;
  agendaItems?: AgendaItemRequest[];
}

// ==========================================
// BOOKING REQUESTS
// ==========================================

export interface CreateBookingRequest {
  experienceId: number;
  startDate: string;              // Format: YYYY-MM-DD
  endDate: string;                // Format: YYYY-MM-DD
  numberOfGuests: number;         // positive
  specialRequests?: string;       // max: 1000
}

// ==========================================
// REVIEW & HOST REQUESTS
// ==========================================

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;                 // min: 1, max: 5
  comment?: string;               // min: 10, max: 2000
}

export interface HostReplyRequest {
  reply: string;                  // min: 10, max: 1000
}

export interface UpdateHostProfileRequest {
  location: string;               // min: 2, max: 100
  bio?: string;                   // max: 2000
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
}
