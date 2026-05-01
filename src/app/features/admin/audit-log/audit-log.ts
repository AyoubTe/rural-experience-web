import {ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild} from '@angular/core';
import {AdminService} from '@rxp/features/admin/admin-service';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {AuditLogEntry} from '@rxp/core/models/admin.model';

import {
  CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf
} from '@angular/cdk/scrolling';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {DatePipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'rxp-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    MatIcon,
    TitleCasePipe,
    DatePipe
  ],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLog implements OnInit {
  private adminSvc = inject(AdminService);
  private notify   = inject(NotificationService);

  viewport = viewChild.required(CdkVirtualScrollViewport);

  // All loaded entries — virtual scroll renders only visible ones
  entries  = signal<AuditLogEntry[]>([]);
  isLoading = signal(false);
  hasMore   = signal(true);

  // Filter
  actionFilter = '';
  currentPage  = 0;
  readonly pageSize = 50;

  readonly ROW_HEIGHT = 60; // px — must match CSS

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.isLoading.set(true);

    this.adminSvc.getAuditLog({
      page:   this.currentPage,
      size:   this.pageSize,
      action: this.actionFilter || undefined,
    }).subscribe({
      next: resp => {
        this.entries.update(list => [...list, ...resp.content]);
        this.hasMore.set(!resp.last);
        this.currentPage++;
        this.isLoading.set(false);
      },
      error: err => {
        this.notify.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onActionFilterChange(): void {
    // Reset and reload on filter change
    this.entries.set([]);
    this.currentPage = 0;
    this.hasMore.set(true);
    this.loadMore();
  }

  // Called by the virtual scroll viewport's scrolledIndexChange
  onScrolledIndexChange(index: number): void {
    const total = this.entries().length;
    // Load more when within 10 rows of the end
    if (index >= total - 10) {
      this.loadMore();
    }
  }

  actionIcon(action: string): string {
    const icons: Record<string, string> = {
      EXPERIENCE_APPROVED: 'check_circle',
      EXPERIENCE_REJECTED: 'cancel',
      USER_SUSPENDED:      'block',
      USER_UNSUSPENDED:    'lock_open',
      USER_ROLE_CHANGED:   'manage_accounts',
      BOOKING_CANCELLED:   'event_busy',
    };
    return icons[action] ?? 'info';
  }

  actionColor(action: string): string {
    if (action.includes('REJECTED') ||
      action.includes('SUSPENDED') ||
      action.includes('CANCELLED'))  return 'warn';
    if (action.includes('APPROVED') ||
      action.includes('UNSUSPENDED')) return 'primary';
    return '';
  }

  trackEntry(index: number, entry: AuditLogEntry): number {
    return entry.id;
  }
}
