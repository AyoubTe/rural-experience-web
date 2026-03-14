// ==========================================
// ENUMS / TYPES
// ==========================================

export type Role = 'EXPLORER' | 'HOST' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export type ExperienceStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export type NotificationType = 'NEW_BOOKING' | 'BOOKING_CONFIRMED' | 'REVIEW_RECEIVED' | 'SYSTEM_ALERT';

// ==========================================
// PAGINATION
// ==========================================

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ==========================================
// AUTHENTICATION
// ==========================================

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // usually 'Bearer'
  expiresIn: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

// ==========================================
// CATEGORY
// ==========================================

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  iconUrl?: string;
  sortOrder: number;
  active: boolean;
}

// ==========================================
// EXPERIENCE & MEDIA
// ==========================================

export interface PhotoResponse {
  id: number;
  url: string;
  altText?: string;
  sortOrder: number;
  uploadedAt: string; // ISO-8601 string
}

export interface AgendaItemResponse {
  id: number;
  dayNumber: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface ExperienceSummaryResponse {
  id: number;
  title: string;
  shortDescription: string;
  pricePerPerson: number;
  durationDays: number;
  maxGuests: number;
  location: string;
  status: ExperienceStatus;
  averageRating: number;
  reviewCount: number;
  coverPhotoUrl?: string;
  categoryName: string;
  categoryEmoji?: string;
  hostFirstName: string;
  hostLastName: string;
  hostVerified: boolean;
}

export interface ExperienceResponse {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  pricePerPerson: number;
  durationDays: number;
  maxGuests: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: ExperienceStatus;
  averageRating: number;
  reviewCount: number;
  coverPhotoUrl?: string;
  categoryId: number;
  categoryName: string;
  categoryEmoji?: string;
  hostId: number;
  hostFirstName: string;
  hostLastName: string;
  hostAvatarUrl?: string;
  hostVerified: boolean;
  photos: PhotoResponse[];
  agendaItems: AgendaItemResponse[];
  createdAt: string; // ISO-8601 string
  updatedAt: string; // ISO-8601 string
}

// ==========================================
// BOOKING
// ==========================================

export interface BookingResponse {
  id: number;
  experienceId: number;
  experienceTitle: string;
  experienceCoverPhoto?: string;
  experienceLocation: string;
  explorerId: number;
  explorerFirstName: string;
  explorerLastName: string;
  explorerEmail: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  hostMessage?: string;
  cancellationReason?: string;
  canCancel: boolean;
  canReview: boolean;
  createdAt: string; // ISO-8601 string
  updatedAt: string; // ISO-8601 string
}

// ==========================================
// USER & PROFILES
// ==========================================

export interface HostProfileResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  totalEarnings: number;
  websiteUrl?: string;
  createdAt: string; // ISO-8601 string
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  read: boolean;
  createdAt: string; // ISO-8601 string
  readAt?: string; // ISO-8601 string
}

export interface ReviewResponse {
  id: number;
  bookingId: number;
  experienceId: number;
  explorerId: number;
  explorerFirstName: string;
  explorerLastName: string;
  rating: number;
  comment?: string;
  hostReply?: string;
  hostRepliedAt?: string;
  createdAt: string;
}
