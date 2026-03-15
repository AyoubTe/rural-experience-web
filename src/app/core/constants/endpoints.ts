export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },

  EXPERIENCES: {
    BASE: '/experiences', // GET all, POST new
    GET_BY_ID: (id: number | string) => `/experiences/${id}`,
    UPDATE: (id: number | string) => `/experiences/${id}`,
  },

  CATEGORIES: {
    BASE: '/categories', // GET all
    GET_BY_ID: (id: number | string) => `/categories/${id}`,
  },

  BOOKINGS: {
    BASE: '/my-bookings', // POST new booking
    MY_BOOKINGS: '/my-bookings/my',
    HOST_BOOKINGS: '/my-bookings/host',
    GET_BY_ID: (id: number | string) => `/bookings/${id}`,
    CONFIRM: (id: number | string) => `/bookings/${id}/confirm`,
    DECLINE: (id: number | string) => `/bookings/${id}/decline`,
    CANCEL: (id: number | string) => `/bookings/${id}/cancel`,
  },

  WISHLIST: {
    BASE: '/wishlist', // GET all wishlist items
    ADD: (experienceId: number | string) => `/wishlist/${experienceId}`,
    REMOVE: (experienceId: number | string) => `/wishlist/${experienceId}`,
    STATUS: (experienceId: number | string) => `/wishlist/${experienceId}/status`,
  },

  REVIEWS: {
    BASE: '/reviews', // POST new review
    BY_EXPERIENCE: (experienceId: number | string) => `/reviews/experience/${experienceId}`,
    REPLY: (id: number | string) => `/reviews/${id}/reply`,
  },

  NOTIFICATIONS: {
    BASE: '/notifications', // GET all
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read',
  },

  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    PENDING_EXPERIENCES: '/admin/experiences/pending',
    ENABLE_USER: (id: number | string) => `/admin/users/${id}/enable`,
    DISABLE_USER: (id: number | string) => `/admin/users/${id}/disable`,
    APPROVE_EXPERIENCE: (id: number | string) => `/admin/experiences/${id}/approve`,
    REJECT_EXPERIENCE: (id: number | string) => `/admin/experiences/${id}/reject`,
  }
} as const;
