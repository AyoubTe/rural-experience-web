import {Component, inject, OnInit, signal} from '@angular/core';
import {AdminService} from '@rxp/features/admin/admin-service';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {AdminUser} from '@rxp/core/models/admin.model';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ConfirmDialog} from '@rxp/shared/components/confirm-dialog/confirm-dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatChip} from '@angular/material/chips';
import {DatePipe} from '@angular/common';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'rxp-user-management',
  imports: [
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    MatInput,
    FormsModule,
    MatSelect,
    MatOption,
    MatTable,
    MatProgressBar,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatChip,
    DatePipe,
    MatMenuTrigger,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private adminSvc = inject(AdminService);
  private dialog   = inject(MatDialog);
  private notify   = inject(NotificationService);

  // ── Table config ───────────────────────────────────────────────
  displayedColumns = [
    'name', 'email', 'role', 'status',
    'bookingCount', 'createdAt', 'actions'
  ];

  // ── State signals ──────────────────────────────────────────────
  users       = signal<AdminUser[]>([]);
  total       = signal(0);
  isLoading   = signal(true);

  // ── Filters ────────────────────────────────────────────────────
  searchCtrl  = new FormControl('');
  roleFilter  = signal<string>('');
  statusFilter = signal<string>('');

  // ── Sort and pagination state ──────────────────────────────────
  sortField   = signal('createdAt');
  sortOrder   = signal<'asc' | 'desc'>('desc');
  pageIndex   = signal(0);
  pageSize    = signal(25);

  ngOnInit(): void {
    // React to search input with debounce
    this.searchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.pageIndex.set(0);
      this.loadUsers();
    });

    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.adminSvc.getUsers({
      page:   this.pageIndex(),
      size:   this.pageSize(),
      sort:   this.sortField(),
      order:  this.sortOrder(),
      search: this.searchCtrl.value ?? undefined,
      role:   this.roleFilter() || undefined,
      status: this.statusFilter() || undefined,
    }).subscribe({
      next: resp => {
        this.users.set(resp.content);
        this.total.set(resp.totalElements);
        this.isLoading.set(false);
      },
      error: err => {
        this.notify.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  // ── Sort event (server-side) ───────────────────────────────────
  onSortChange(sort: Sort): void {
    this.sortField.set(sort.active || 'createdAt');
    this.sortOrder.set((sort.direction as 'asc' | 'desc') || 'desc');
    this.pageIndex.set(0);
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadUsers();
  }

  // ── Actions ────────────────────────────────────────────────────
  onPromoteToHost(user: AdminUser): void {
    this.adminSvc.updateUserRole(user.id, 'HOST').subscribe({
      next: updated => {
        this.users.update(list =>
          list.map(u => u.id === updated.id ? updated : u)
        );
        this.notify.success(
          `${user.firstName} ${user.lastName} is now a host.`
        );
      },
      error: err => this.notify.error(err.message),
    });
  }

  onSuspend(user: AdminUser): void {
    const isSuspended = user.status === 'SUSPENDED';
    const action      = isSuspended ? 'Unsuspend' : 'Suspend';

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title:       `${action} User`,
        message:     `${action} ${user.firstName} ${user.lastName}?` +
          (isSuspended ? '' :
            ' They will lose access to RuralXperience.'),
        confirmText: action,
        cancelText:  'Cancel',
        danger:      !isSuspended,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      const newStatus =
        isSuspended ? 'ACTIVE' : 'SUSPENDED';

      this.adminSvc.updateUserStatus(user.id, newStatus).subscribe({
        next: updated => {
          this.users.update(list =>
            list.map(u => u.id === updated.id ? updated : u)
          );
          this.notify.success(
            `${user.firstName} ${user.lastName} ` +
            (newStatus === 'ACTIVE' ? 'unsuspended.' : 'suspended.')
          );
        },
        error: err => this.notify.error(err.message),
      });
    });
  }

  ngAfterViewInit(): void {
    // If we had a ViewChild sort, we'd wire it here for client-side.
    // Our sort is server-side — we handle it in onSortChange().
  }
}
