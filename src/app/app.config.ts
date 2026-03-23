import {
  ApplicationConfig,
  isDevMode, LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {provideRouter, TitleStrategy, withInMemoryScrolling, withViewTransitions} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {RxpTitleStrategy} from '@rxp/core/routing/rxp-title.strategy';
import {authInterceptor} from '@rxp/core/auth/interceptors/auth-interceptor';
import {refreshInterceptor} from '@rxp/core/auth/interceptors/refresh-interceptor';
import {provideState, provideStore} from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {bookingReducer} from '@rxp/features/booking/store/booking.reducer';
import {BookingEffects} from '@rxp/features/booking/store/booking.effects';
import {provideEffects} from '@ngrx/effects';
import {NotificationEffects} from '@rxp/features/notification/store/notification.effects';
import {notificationReducer} from '@rxp/features/notification/store/notification.reducer';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(localeFr, 'fr', localeFrExtra);


export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr',
    },
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions(), withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
    })),
    provideHttpClient(withFetch(), withInterceptors([
        authInterceptor,
        refreshInterceptor
    ])),
    {
        provide: TitleStrategy,
        useClass: RxpTitleStrategy,
    },
    provideStore(reducers, { metaReducers }),
    provideState('booking', bookingReducer),
    provideState('notifications', notificationReducer),
    provideEffects(BookingEffects, NotificationEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
]
};
