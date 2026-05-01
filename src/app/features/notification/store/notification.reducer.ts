import { createReducer, on } from '@ngrx/store';
import * as NotifActions from './notification.actions';
import {
  NotificationState, initialNotificationState
} from './notification.state';

export const notificationReducer = createReducer(
  initialNotificationState,

  on(NotifActions.notificationReceived,
    (state, { notification }) => ({
      ...state,
      // Prepend to show newest first, cap at 50
      notifications: [notification, ...state.notifications]
        .slice(0, 50),
      unreadCount:   state.unreadCount + 1,
    })),

  on(NotifActions.markAllAsRead, (state) => ({
    ...state,
    notifications: state.notifications.map(n =>
      ({ ...n, read: true })
    ),
    unreadCount: 0,
  })),

  on(NotifActions.markAsRead, (state, { id }) => ({
    ...state,
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  on(NotifActions.clearAll, (state) => ({
    ...state,
    notifications: [],
    unreadCount:   0,
  })),

  on(NotifActions.togglePanel, (state) => ({
    ...state,
    isOpen: !state.isOpen,
  })),

  on(NotifActions.closePanel, (state) => ({
    ...state,
    isOpen: false,
  })),
);
