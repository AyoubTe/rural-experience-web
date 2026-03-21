import {ModerationAction} from '@rxp/core/models/admin.model';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },

  EXPERIENCES: {
    BASE: '/experiences', // GET all, POST new
    GET_HOST_EXPERIENCES: '/experiences/host-experiences',
    GET_BY_ID: (id: number | string) => `/experiences/${id}`,
    DELETE: (id: number | string) => `/experiences/${id}`,
    GET_PHOTOS: (id: number | string) => `/experiences/${id}/photos`,
    UPDATE: (id: number | string) => `/experiences/${id}`,
    UPDATE_STATUS: (id: number | string) => `/experiences/${id}/status`,
    DELETE_PHOTO: (expId: number, photoId: number) => `/experiences/${expId}/photos/${photoId}`,
    UPLOAD_PHOTO:   (id: number) => `/experiences/${id}/photos`,
    REORDER_PHOTOS: (id: number) => `/experiences/${id}/photos/reorder`,
    SUBMIT: (id: number | string) => `/experiences/${id}/submit`,
  },

  CATEGORIES: {
    BASE: '/categories', // GET all
    GET_BY_ID: (id: number | string) => `/categories/${id}`,
  },

  BOOKINGS: {
    BASE: '/bookings', // POST new booking
    MY_BOOKINGS: '/bookings/my',
    HOST_BOOKINGS: '/bookings/host',
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
    AUDIT_LOG: '/admin/audit',
    PENDING_EXPERIENCES: '/admin/experiences/pending',
    MODERATE: '/admin/experiences/moderate',
    ENABLE_USER: (id: number | string) => `/admin/users/${id}/enable`,
    DISABLE_USER: (id: number | string) => `/admin/users/${id}/disable`,
    UPDATE_USER_ROLE:   (id: number | string) => `/admin/users/${id}/role`,
    UPDATE_USER_STATUS: (id: number | string) => `/admin/users/${id}/status`,
    APPROVE_EXPERIENCE: (id: number | string) => `/admin/experiences/${id}/approve`,
    REJECT_EXPERIENCE: (id: number | string) => `/admin/experiences/${id}/reject`,
  }
} as const;
