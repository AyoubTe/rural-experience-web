import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState } from './notification.state';

export const selectNotificationState =
  createFeatureSelector<NotificationState>('notifications');

export const selectNotifications = createSelector(
  selectNotificationState, s => s.notifications
);

export const selectUnreadCount = createSelector(
  selectNotificationState, s => s.unreadCount
);

export const selectIsPanelOpen = createSelector(
  selectNotificationState, s => s.isOpen
);

export const selectUnreadNotifications = createSelector(
  selectNotifications,
  notifs => notifs.filter(n => !n.read)
);
