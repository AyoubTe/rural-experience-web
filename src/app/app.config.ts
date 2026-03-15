import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import {provideRouter, TitleStrategy, withInMemoryScrolling, withViewTransitions} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {RxpTitleStrategy} from '@rxp/core/routing/rxp-title.strategy';
import {authInterceptor} from '@rxp/core/auth/interceptors/auth-interceptor';
import {refreshInterceptor} from '@rxp/core/auth/interceptors/refresh-interceptor';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';

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
    provideStore(reducers, { metaReducers })
]
};
