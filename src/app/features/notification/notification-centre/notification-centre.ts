import {
  Component, ChangeDetectionStrategy,
  inject, computed
} from '@angular/core';
import { DatePipe }         from '@angular/common';
import { RouterLink }       from '@angular/router';
import { Store }            from '@ngrx/store';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatMenuModule }    from '@angular/material/menu';
import { MatBadgeModule }   from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal }         from '@angular/core/rxjs-interop';

import * as NotifActions    from '../store/notification.actions';
import * as NotifSelectors  from '../store/notification.selectors';
import { AppNotification } from '@rxp/core/models/notification.model';

@Component({
  selector: 'rxp-notification-centre',
  standalone: true,
  templateUrl: './notification-centre.html',
  styleUrl:    './notification-centre.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatBadgeModule, MatDividerModule, MatTooltipModule,
  ],
})
export class NotificationCentre {

  private store = inject(Store);

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
