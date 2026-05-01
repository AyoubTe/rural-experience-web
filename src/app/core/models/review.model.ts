export interface Review {
  id:          number;
  rating:      number;
  title:       string;
  comment:     string;
  createdAt:   string;
  reviewer:    { firstName: string; lastName: string; avatarUrl: string | null };
  experience:  { id: number; title: string };
}
