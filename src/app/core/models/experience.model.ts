// experience.model.ts
export interface Experience {
  id: number;
  title: string;
  shortDescription: string;   // was: description
  pricePerPerson: number;
  durationDays: number;
  maxGuests: number;
  location: string;
  status: string;
  averageRating: number;
  reviewCount: number;
  coverPhotoUrl: string | null;
  categoryName: string;        // flat, not nested
  categoryEmoji: string;       // flat, not nested
  hostFirstName: string;       // flat, not nested
  hostLastName: string;        // flat, not nested
  hostVerified: boolean;       // flat, not nested
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

export interface ExperienceSearchParams {
  keyword?:    string;
  categoryId?: number;
  minPrice?:   number;
  maxPrice?:   number;
  minDays?:    number;
  maxDays?:    number;
  country?:    string;
  page?:       number;
  size?:       number;
  sort?:       string;
}
