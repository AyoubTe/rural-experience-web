import { createAction, props } from '@ngrx/store';
import { AppNotification } from '@rxp/core/models/notification.model';

export const notificationReceived = createAction(
  '[Notification] Received',
  props<{ notification: AppNotification }>()
);

export const markAllAsRead = createAction(
  '[Notification] Mark All As Read'
);

export const markAsRead = createAction(
  '[Notification] Mark As Read',
  props<{ id: string }>()
);

export const clearAll = createAction(
  '[Notification] Clear All'
);

export const togglePanel = createAction(
  '[Notification] Toggle Panel'
);

export const closePanel = createAction(
  '[Notification] Close Panel'
);
