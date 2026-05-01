import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { UserManagement } from './user-management';
import { AdminService } from '@rxp/features/admin/admin-service';
import { NotificationService } from '@rxp/features/notification/notification-service';
import { AdminUser } from '@rxp/core/models/admin.model';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

describe('UserManagement', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;

  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  // 1. PERFECTLY MATCHED MOCK DATA
  const mockUserActive: AdminUser = {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@rxp.com',
    role: 'EXPLORER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T10:00:00Z',
    bookingCount: 5,
    reviewCount: 2
  };

  const mockUserSuspended: AdminUser = {
    id: 2,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@rxp.com',
    role: 'HOST',
    status: 'SUSPENDED',
    createdAt: '2026-02-01T10:00:00Z',
    bookingCount: 12,
    reviewCount: 10
  };

  const mockPaginatedResponse = {
    content: [mockUserActive, mockUserSuspended],
    totalElements: 2,
    page: 0,
    size: 25,
    totalPages: 1,
    last: true,
    first: true,
    numberOfElements: 2,
    number: 0
  };

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['getUsers', 'updateUserRole', 'updateUserStatus']);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    adminServiceSpy.getUsers.and.returnValue(of(mockPaginatedResponse));

    await TestBed.configureTestingModule({
      imports: [UserManagement, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
  });

  it('should create and load initial users on init', () => {
    fixture.detectChanges(); // Triggers ngOnInit

    expect(component).toBeTruthy();
    expect(adminServiceSpy.getUsers).toHaveBeenCalledWith({
      page: 0,
      size: 25,
      sort: 'createdAt',
      order: 'desc',
      search: undefined,
      role: undefined,
      status: undefined
    });

    expect(component.users().length).toBe(2);
    expect(component.total()).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  describe('Search and Filters', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Run init
      adminServiceSpy.getUsers.calls.reset(); // Clear initial load call
    });

    it('should reload users when search input changes (with debounce)', fakeAsync(() => {
      // Act: Type in the search box
      component.searchCtrl.setValue('Jane');

      // Fast-forward time to bypass the debounceTime(400)
      tick(400);

      // Assert
      expect(component.pageIndex()).toBe(0); // Should reset to page 0
      expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({
        search: 'Jane',
        page: 0
      }));
    }));

    it('should reset page and reload when role or status filter changes', () => {
      // Act
      component.pageIndex.set(2); // Simulate being on page 2
      component.roleFilter.set('HOST');
      component.onFilterChange();

      // Assert
      expect(component.pageIndex()).toBe(0); // Reset to 0
      expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({
        role: 'HOST',
        page: 0
      }));
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
      adminServiceSpy.getUsers.calls.reset();
    });

    it('should update parameters and reload on sort change', () => {
      const sortEvent: Sort = { active: 'email', direction: 'asc' };

      component.onSortChange(sortEvent);

      expect(component.sortField()).toBe('email');
      expect(component.sortOrder()).toBe('asc');
      expect(component.pageIndex()).toBe(0);
      expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({
        sort: 'email',
        order: 'asc',
        page: 0
      }));
    });

    it('should update parameters and reload on page change', () => {
      const pageEvent: PageEvent = { pageIndex: 1, pageSize: 50, length: 100 };

      component.onPageChange(pageEvent);

      expect(component.pageIndex()).toBe(1);
      expect(component.pageSize()).toBe(50);
      expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({
        page: 1,
        size: 50
      }));
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should promote user to HOST and update the list', () => {
      const promotedUser = { ...mockUserActive, role: 'HOST' as const };
      adminServiceSpy.updateUserRole.and.returnValue(of(promotedUser));

      component.onPromoteToHost(mockUserActive);

      expect(adminServiceSpy.updateUserRole).toHaveBeenCalledWith(1, 'HOST');
      expect(notificationSpy.success).toHaveBeenCalledWith('Jane Doe is now a host.');
      // Verify the list was updated
      expect(component.users()[0].role).toBe('HOST');
    });

    it('should suspend an active user after dialog confirmation', () => {
      const suspendedUser = { ...mockUserActive, status: 'SUSPENDED' as const };

      // Simulate clicking "Suspend" in the dialog
      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
      adminServiceSpy.updateUserStatus.and.returnValue(of(suspendedUser));

      component.onSuspend(mockUserActive);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(adminServiceSpy.updateUserStatus).toHaveBeenCalledWith(1, 'SUSPENDED');
      expect(notificationSpy.success).toHaveBeenCalledWith('Jane Doe suspended.');
      expect(component.users()[0].status).toBe('SUSPENDED');
    });

    it('should unsuspend a suspended user after dialog confirmation', () => {
      const activatedUser = { ...mockUserSuspended, status: 'ACTIVE' as const };

      // Simulate clicking "Unsuspend" in the dialog
      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
      adminServiceSpy.updateUserStatus.and.returnValue(of(activatedUser));

      component.onSuspend(mockUserSuspended);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(adminServiceSpy.updateUserStatus).toHaveBeenCalledWith(2, 'ACTIVE');
      expect(notificationSpy.success).toHaveBeenCalledWith('John Smith unsuspended.');
      expect(component.users()[1].status).toBe('ACTIVE');
    });

    it('should do nothing if the suspend dialog is cancelled', () => {
      // Simulate clicking "Cancel" in the dialog
      dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

      component.onSuspend(mockUserActive);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(adminServiceSpy.updateUserStatus).not.toHaveBeenCalled();
    });

    it('should show error notification if action fails', () => {
      adminServiceSpy.updateUserRole.and.returnValue(throwError(() => new Error('API Error')));

      component.onPromoteToHost(mockUserActive);

      expect(notificationSpy.error).toHaveBeenCalledWith('API Error');
    });
  });
});
