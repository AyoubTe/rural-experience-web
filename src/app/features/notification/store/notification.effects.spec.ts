import { TestBed }             from '@angular/core/testing';
import { provideMockActions }  from '@ngrx/effects/testing';
import { provideMockStore }    from '@ngrx/store/testing';
import { NotificationEffects } from './notification.effects';
import { RxStompService }      from '@rxp/core/websocket/rxstomp-service';
import { AuthService }         from '@rxp/core/auth/auth-service';
import { Subject, of, EMPTY }  from 'rxjs';
import { AppNotification } from '@rxp/core/models/notification.model';
import * as NotifActions from './notification.actions';
import { signal }        from '@angular/core';
import {Store} from '@ngrx/store';

describe('NotificationEffects', () => {
  let effects:           NotificationEffects;
  let wsService:         jasmine.SpyObj<RxStompService>;
  let notifSubject:      Subject<AppNotification>;

  beforeEach(() => {
    notifSubject = new Subject<AppNotification>();

    const wsSpy = jasmine.createSpyObj('RxStompService', [], {
      notifications$: notifSubject.asObservable(),
    });

    const authSpy = {
      isAuthenticated: signal(true),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationEffects,
        provideMockActions(() => EMPTY),
        provideMockStore(),
        { provide: RxStompService, useValue: wsSpy },
        { provide: AuthService,    useValue: authSpy },
      ],
    });

    effects   = TestBed.inject(NotificationEffects);
    wsService = TestBed.inject(RxStompService) as jasmine.SpyObj<RxStompService>;
  });

  it('dispatches notificationReceived for each WS message', done => {
    const mockNotif: AppNotification = {
      id:          'abc-123',
      type:        'BOOKING_CONFIRMED',
      title:       'Booking confirmed!',
      message:     'Your lavender harvest booking is confirmed.',
      relatedId:   42,
      relatedType: 'Booking',
      read:        false,
      createdAt:   new Date().toISOString(),
    };

    // Subscribe to the effect (it's { dispatch: false })
    // Instead, verify the Store dispatch via a spy
    const store = TestBed.inject(Store);
    spyOn(store, 'dispatch');

    // Emit a notification from the WebSocket mock
    notifSubject.next(mockNotif);

    // Give the effect time to process
    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        NotifActions.notificationReceived({ notification: mockNotif })
      );
      done();
    }, 10);
  });
});
