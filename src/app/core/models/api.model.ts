/** Mirror of Spring Boot's PageResponse<T> */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

/** Mirror of Spring Boot's ErrorResponse */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ImagePreview {
  file: File;
  url: string;
}
