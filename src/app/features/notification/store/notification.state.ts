import {AppNotification} from '@rxp/core/models/notification.model';

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount:   number;
  isOpen:        boolean;    // Notification panel open
}

export const initialNotificationState: NotificationState = {
  notifications: [],
  unreadCount:   0,
  isOpen:        false,
};
