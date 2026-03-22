import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store }           from '@ngrx/store';
import { EMPTY }           from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

import { RxStompService } from '@rxp/core/websocket/rxstomp-service';
import { AuthService } from '@rxp/core/auth/auth-service';
import * as NotifActions from './notification.actions';
import * as BookingActions from '../../booking/store/booking.actions';
import {AppNotification} from '@rxp/core/models/notification.model';
import {toObservable} from '@angular/core/rxjs-interop';

@Injectable()
export class NotificationEffects {

  private actions$  = inject(Actions);
  private wsService = inject(RxStompService);
  private auth      = inject(AuthService);
  private store     = inject(Store);

  /**
   * When the user is authenticated, subscribe to the WebSocket
   * notification stream. Each incoming notification is dispatched
   * to the Store. switchMap ensures only one subscription at a time
   * (reconnects cleanly on re-authentication).
   */
  listenToNotifications$ = createEffect(() =>
      toObservable(this.auth.isAuthenticated).pipe(
        switchMap(isAuth => {
          if (!isAuth) return EMPTY;

          return this.wsService.notifications$.pipe(
            tap(notification => {
              // Dispatch the notification to the Store
              this.store.dispatch(
                NotifActions.notificationReceived({ notification })
              );

              // Also update the booking state when relevant
              this.syncBookingState(notification);
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    { dispatch: false }
  );

  /**
   * When a booking-related notification arrives, dispatch the
   * appropriate booking action so the booking state is updated
   * without a full page reload.
   */
  private syncBookingState(
    notification: AppNotification
  ): void {
    if (!notification.relatedId) return;

    switch (notification.type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_DECLINED':
      case 'BOOKING_CANCELLED':
        // Reload that explorer's bookings to get fresh status
        this.store.dispatch(
          BookingActions.loadMyBookings({})
        );
        break;

      case 'BOOKING_REQUEST':
        // Host received a new request — reload host bookings
        this.store.dispatch(
          BookingActions.loadHostBookings({})
        );
        break;

      default:
        break;
    }
  }
}
