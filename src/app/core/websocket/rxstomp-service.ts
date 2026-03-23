import { Injectable, inject, OnDestroy } from '@angular/core';
import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { AppNotification } from '../models/notification.model';
import {environment} from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RxStompService implements OnDestroy {

  private rxStomp  = new RxStomp();
  private destroyed$ = new Subject<void>();

  /**
   * Establish (or re-establish) the WebSocket connection.
   * Called once after the user logs in.
   */
  connect(token: string): void {
    if (!token) return;

    const config: RxStompConfig = {
      // Spring Boot WebSocket endpoint
      brokerURL: `${environment.WS_BASE_URL}/ws`,
      // webSocketFactory: () => new SockJS(`${environment.WS_BASE_URL}/ws`),

      // Pass JWT in the STOMP CONNECT frame headers
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heartbeat: keep the connection alive
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20_000,

      // Reconnect automatically after 5 seconds on drop
      reconnectDelay: 5_000,

      // Log STOMP frames only in development
      debug: environment.production
        ? () => {}
        : (msg) => console.debug('[STOMP]', msg),
    };

    this.rxStomp.configure(config);
    this.rxStomp.activate();
  }

  /**
   * Subscribe to a STOMP destination.
   * Returns an Observable of the raw message body as T.
   * Automatically unsubscribes when the Observable is unsubscribed.
   */
  watch<T>(destination: string): Observable<T> {
    return this.rxStomp.watch(destination).pipe(
      map(msg => JSON.parse(msg.body) as T)
    );
  }

  /**
   * Stream of user notifications from the server.
   * Filters to only fire when the connection is active.
   */
  get notifications$(): Observable<AppNotification> {
    return this.rxStomp
      .watch('/user/queue/notifications')
      .pipe(
        filter(() => this.rxStomp.connected()),
        map(msg => JSON.parse(msg.body) as AppNotification)
      );
  }

  /**
   * Connection state as an Observable.
   * Useful for showing a reconnecting banner.
   */
  get connectionState$() {
    return this.rxStomp.connectionState$;
  }

  disconnect(): void {
    this.rxStomp.deactivate();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
