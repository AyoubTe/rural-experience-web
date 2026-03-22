import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {AdminService} from '@rxp/features/admin/admin-service';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {AdminExperience} from '@rxp/core/models/admin.model';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {ConfirmDialog} from '@rxp/shared/components/confirm-dialog/confirm-dialog';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatChip} from '@angular/material/chips';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'rxp-moderation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatIcon,
    MatProgressBar,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCheckbox,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatChip,
    CurrencyPipe,
    DatePipe,
    MatIconButton,
    RouterLink,
    MatTooltip,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatPaginator
  ],
  templateUrl: './moderation.html',
  styleUrl: './moderation.scss',
})
export class Moderation implements OnInit {
  private adminSvc = inject(AdminService);
  private dialog   = inject(MatDialog);
  private notify   = inject(NotificationService);

  // ── State ─────────────────────────────────────────────────────
  pending       = signal<AdminExperience[]>([]);
  total         = signal(0);
  currentPage   = signal(0);
  isLoading     = signal(true);
  selectedIds   = signal<Set<number>>(new Set());

  // ── Table columns ─────────────────────────────────────────────
  displayedColumns = [
    'select', 'title', 'host', 'category',
    'location', 'price', 'submittedAt', 'actions'
  ];

  // ── Derived ───────────────────────────────────────────────────
  allSelected = computed(() =>
    this.pending().length > 0 &&
    this.pending().every(e => this.selectedIds().has(e.id))
  );

  someSelected = computed(() =>
    this.selectedIds().size > 0 && !this.allSelected()
  );

  ngOnInit(): void {
    this.load(0);
  }

  private load(page: number): void {
    this.isLoading.set(true);
    this.adminSvc.getPendingReview(page, 20).subscribe({
      next: resp => {
        this.pending.set(resp.content);
        this.total.set(resp.totalElements);
        this.currentPage.set(resp.page);
        this.isLoading.set(false);
        this.selectedIds.set(new Set()); // Clear selection on page change
      },
      error: err => {
        this.notify.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  // ── Selection ─────────────────────────────────────────────────
  toggleAll(change: MatCheckboxChange): void {
    this.selectedIds.set(
      change.checked
        ? new Set(this.pending().map(e => e.id))
        : new Set()
    );
  }

  toggleOne(id: number): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  // ── Single actions ────────────────────────────────────────────
  onApprove(exp: AdminExperience): void {
    this.adminSvc.moderateExperience({
      experienceId: exp.id,
      action: 'APPROVE',
    }).subscribe({
      next: () => {
        this.pending.update(list =>
          list.filter(e => e.id !== exp.id)
        );
        this.notify.success(`"${exp.title}" approved and live!`);
      },
      error: err => this.notify.error(err.message),
    });
  }

  onReject(exp: AdminExperience): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title:       'Reject Experience',
        message:     `Reject "${exp.title}"? ` +
          `The host will be notified.`,
        confirmText: 'Reject',
        cancelText:  'Cancel',
        danger:      true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.adminSvc.moderateExperience({
        experienceId: exp.id,
        action: 'REJECT',
      }).subscribe({
        next: () => {
          this.pending.update(list =>
            list.filter(e => e.id !== exp.id)
          );
          this.notify.info(`"${exp.title}" rejected.`);
        },
        error: err => this.notify.error(err.message),
      });
    });
  }

  // ── Bulk actions ──────────────────────────────────────────────
  onBulkApprove(): void {
    const ids    = [...this.selectedIds()];
    const count  = ids.length;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title:       `Approve ${count} Experiences`,
        message:     `All ${count} selected experiences will go live immediately.`,
        confirmText: `Approve ${count}`,
        cancelText:  'Cancel',
        danger:      false,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      const actions = ids.map(id => ({
        experienceId: id, action: 'APPROVE' as const
      }));
      this.adminSvc.bulkModerate(actions).subscribe({
        next: () => {
          this.pending.update(list =>
            list.filter(e => !this.selectedIds().has(e.id))
          );
          this.selectedIds.set(new Set());
          this.notify.success(`${count} experiences approved.`);
        },
        error: err => this.notify.error(err.message),
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.load(event.pageIndex);
  }
}
