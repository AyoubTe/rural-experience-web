import { notificationReducer } from './notification.reducer';
import { initialNotificationState } from './notification.state';
import * as NotifActions from './notification.actions';

const mockNotif = (id: string) => ({
  id, type: 'BOOKING_CONFIRMED' as const,
  title: 'Test', message: 'Test message',
  relatedId: 1, relatedType: 'Booking' as const,
  read: false, createdAt: new Date().toISOString(),
});

describe('notificationReducer', () => {

  it('adds notification to front of list', () => {
    const n = mockNotif('notif-1');
    const state = notificationReducer(
      initialNotificationState,
      NotifActions.notificationReceived({ notification: n })
    );
    expect(state.notifications[0]).toEqual(n);
    expect(state.unreadCount).toBe(1);
  });

  it('caps notifications at 50', () => {
    // Pre-load 50 notifications
    let state = initialNotificationState;
    for (let i = 0; i < 50; i++) {
      state = notificationReducer(
        state,
        NotifActions.notificationReceived({
          notification: mockNotif(`n-${i}`)
        })
      );
    }
    // Add one more
    state = notificationReducer(
      state,
      NotifActions.notificationReceived({
        notification: mockNotif('overflow')
      })
    );
    expect(state.notifications.length).toBe(50);
    expect(state.notifications[0].id).toBe('overflow');
  });

  it('markAllAsRead clears unread count', () => {
    const withUnread = {
      ...initialNotificationState,
      notifications: [mockNotif('a'), mockNotif('b')],
      unreadCount: 2,
    };
    const state = notificationReducer(
      withUnread, NotifActions.markAllAsRead()
    );
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every(n => n.read)).toBeTrue();
  });

  it('clearAll removes all notifications', () => {
    const withNotifs = {
      ...initialNotificationState,
      notifications: [mockNotif('a')],
      unreadCount: 1,
    };
    const state = notificationReducer(
      withNotifs, NotifActions.clearAll()
    );
    expect(state.notifications.length).toBe(0);
    expect(state.unreadCount).toBe(0);
  });
});
