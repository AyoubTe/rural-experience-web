export interface Experience {
  id: number;
  title: string;
  description: string;
  pricePerPerson: number;
  durationDays: number;
  maxGuests: number;
  averageRating: number;
  reviewCount: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  category: Category;
  host: HostSummary;
  coverPhotoUrl: string | null;
  location: string;
  country: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
}

export interface HostSummary {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  location: string;
}
