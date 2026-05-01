import {Component, computed, inject, signal} from '@angular/core';
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
import * as NotifSelectors from '@rxp/features/notification/store/notification.selectors';
import * as NotifActions from '@rxp/features/notification/store/notification.actions';
import {AppNotification} from '@rxp/core/models/notification.model';
import {NotificationCentre} from '@rxp/features/notification/notification-centre/notification-centre';
import {ConnectionBanner} from '@rxp/core/websocket/connection-banner/connection-banner';
import {LanguageSwitcher} from '@rxp/shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatBadgeModule, NotificationCentre, ConnectionBanner, LanguageSwitcher,
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

  notifications = toSignal(
    this.store.select(NotifSelectors.selectNotifications),
    { initialValue: [] }
  );

  unreadCount = toSignal(
    this.store.select(NotifSelectors.selectUnreadCount),
    { initialValue: 0 }
  );

  hasUnread = computed(() => this.unreadCount() > 0);

  onMarkAllRead(): void {
    this.store.dispatch(NotifActions.markAllAsRead());
  }

  onMarkRead(id: string): void {
    this.store.dispatch(NotifActions.markAsRead({ id }));
  }

  onClearAll(): void {
    this.store.dispatch(NotifActions.clearAll());
  }

  notificationIcon(type: AppNotification['type']): string {
    const icons: Record<AppNotification['type'], string> = {
      BOOKING_CONFIRMED:  'check_circle',
      BOOKING_DECLINED:   'cancel',
      BOOKING_CANCELLED:  'event_busy',
      BOOKING_COMPLETED:  'verified',
      NEW_REVIEW:         'star',
      BOOKING_REQUEST:    'book_online',
      SYSTEM:             'info',
    };
    return icons[type] ?? 'notifications';
  }

  notificationLink(n: AppNotification): string[] | null {
    if (!n.relatedId) return null;
    switch (n.relatedType) {
      case 'Booking':    return ['/my-bookings', String(n.relatedId)];
      case 'Experience': return ['/experiences',  String(n.relatedId)];
      default:           return null;
    }
  }
}
