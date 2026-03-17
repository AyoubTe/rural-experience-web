import {
  ApplicationConfig,
  isDevMode,
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

export const appConfig: ApplicationConfig = {
  providers: [
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
    provideEffects([BookingEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
]
};
