export type ExperienceStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface AdminExperience {
  id:             number;
  title:          string;
  status:         ExperienceStatus;
  hostName:       string;
  hostEmail:      string;
  category:       string;
  location:       string;
  country:        string;
  pricePerPerson: number;
  submittedAt:    string;
  reviewCount:    number;
}

export interface AdminUser {
  id:          number;
  firstName:   string;
  lastName:    string;
  email:       string;
  role:        'EXPLORER' | 'HOST' | 'ADMIN';
  status:      'ACTIVE' | 'SUSPENDED';
  createdAt:   string;
  bookingCount: number;
  reviewCount:  number;
}

export interface AuditLogEntry {
  id:         number;
  action:     string;   // 'EXPERIENCE_APPROVED', 'USER_SUSPENDED', etc.
  entityType: string;   // 'Experience', 'User', 'Booking'
  entityId:   number;
  performedBy: string;  // Admin email
  details:    string;
  createdAt:  string;
}

export interface PlatformStats {
  totalUsers:       number;
  totalExplorers:   number;
  totalHosts:       number;
  totalExperiences: number;
  publishedCount:   number;
  pendingReview:    number;
  totalBookings:    number;
  totalRevenue:     number;
  avgRating:        number;
  reviewsThisMonth: number;
}

export interface ModerationAction {
  experienceId: number;
  action:       'APPROVE' | 'REJECT';
  reason?:      string;
}
