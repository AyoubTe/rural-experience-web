import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { MatMenuModule }     from '@angular/material/menu';
import { MatDividerModule }  from '@angular/material/divider';
import { MatBadgeModule }    from '@angular/material/badge';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {AuthService} from '@rxp/core/auth/auth-service';
import {Store} from '@ngrx/store';
import * as BookingSelectors from '@rxp/features/booking/store/booking.selectors';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatBadgeModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('rural-experience-web');
  readonly currentYear = new Date().getFullYear();

  private breakpointObserver = inject(BreakpointObserver);
  authService = inject(AuthService);
  store = inject(Store);


  /** True on mobile — sidenav becomes an overlay drawer */
  isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  /** Controls sidenav open/close state on mobile */
  sidenavOpen = signal(false);

  toggleSidenav(): void {
    this.sidenavOpen.update(open => !open);
  }

  closeSidenav(): void {
    this.sidenavOpen.set(false);
  }

  // Only relevant for hosts — selector returns 0 otherwise
  pendingBookingCount = toSignal(
    this.store.select(
      BookingSelectors.selectPendingHostBookingCount
    ),
    { initialValue: 0 }
  );
}
