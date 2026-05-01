import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { AuditLog } from './audit-log';
import { AdminService } from '@rxp/features/admin/admin-service';
import { NotificationService } from '@rxp/features/notification/notification-service';
import { AuditLogEntry } from '@rxp/core/models/admin.model';

describe('AuditLog', () => {
  let component: AuditLog;
  let fixture: ComponentFixture<AuditLog>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  const mockEntries: AuditLogEntry[] = [
    {
      id: 1,
      action: 'EXPERIENCE_APPROVED',
      createdAt: '2026-03-01T10:00:00Z',
      performedBy: 'admin@rxp.com',
      details: '',
      entityType: "",
      entityId: 0
    },
    {
      id: 2,
      action: 'USER_SUSPENDED',
      createdAt: '2026-03-02T11:00:00Z',
      performedBy: 'admin@rxp.com',
      details: '',
      entityType: "",
      entityId: 0
    }
  ];

  const mockPaginatedResponse = {
    content: mockEntries,
    last: false,
    totalElements: 20,
    totalPages: 10,
    size: 50,
    page: 0,
    number: 0,
    first: true,
    numberOfElements: 2
  };

  beforeEach(async () => {
    // 1. Create Spies for injected services
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['getAuditLog']);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['error']);

    // Default successful response
    adminServiceSpy.getAuditLog.and.returnValue(of(mockPaginatedResponse));

    await TestBed.configureTestingModule({
      // Import the standalone component and disable animations for Material UI
      imports: [AuditLog, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLog);
    component = fixture.componentInstance;

    // Trigger initial data binding & ngOnInit
    fixture.detectChanges();
  });

  it('should create and load initial data on init', () => {
    expect(component).toBeTruthy();
    expect(adminServiceSpy.getAuditLog).toHaveBeenCalledWith({
      page: 0,
      size: 50,
      action: undefined
    });

    // Verify signals are updated correctly
    expect(component.entries().length).toBe(2);
    expect(component.currentPage).toBe(1); // Incremented after load
    expect(component.hasMore()).toBeTrue(); // Because mock response said last: false
    expect(component.isLoading()).toBeFalse();
  });

  describe('loadMore()', () => {
    it('should not fetch if currently loading', () => {
      adminServiceSpy.getAuditLog.calls.reset();

      // Force loading state to true
      component.isLoading.set(true);
      component.loadMore();

      expect(adminServiceSpy.getAuditLog).not.toHaveBeenCalled();
    });

    it('should not fetch if there is no more data (hasMore is false)', () => {
      adminServiceSpy.getAuditLog.calls.reset();

      // Force hasMore state to false
      component.hasMore.set(false);
      component.loadMore();

      expect(adminServiceSpy.getAuditLog).not.toHaveBeenCalled();
    });

    it('should handle API errors via NotificationService', () => {
      adminServiceSpy.getAuditLog.and.returnValue(throwError(() => new Error('API failure')));

      // Reset state to test a fresh load
      component.isLoading.set(false);
      component.hasMore.set(true);

      component.loadMore();

      expect(notificationSpy.error).toHaveBeenCalledWith('API failure');
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('onActionFilterChange()', () => {
    it('should reset state and trigger a new load', () => {
      adminServiceSpy.getAuditLog.calls.reset();

      // Change filter and call method
      component.actionFilter = 'USER_SUSPENDED';
      component.onActionFilterChange();

      // Verify state was reset before loading
      expect(component.currentPage).toBe(1); // 0 -> 1 after loadMore finishes
      expect(adminServiceSpy.getAuditLog).toHaveBeenCalledWith({
        page: 0,
        size: 50,
        action: 'USER_SUSPENDED'
      });
    });
  });

  describe('onScrolledIndexChange()', () => {
    it('should trigger loadMore when scrolling within 10 items of the end', () => {
      adminServiceSpy.getAuditLog.calls.reset();

      // Setup: Let's pretend we have 50 items loaded
      const mock50 = new Array(50).fill(mockEntries[0]);
      component.entries.set(mock50);
      component.hasMore.set(true);
      component.isLoading.set(false);

      // Scroll to index 35 (not within 10 items of 50)
      component.onScrolledIndexChange(35);
      expect(adminServiceSpy.getAuditLog).not.toHaveBeenCalled();

      // Scroll to index 41 (within 10 items of 50)
      component.onScrolledIndexChange(41);
      expect(adminServiceSpy.getAuditLog).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should return correct action icons', () => {
      expect(component.actionIcon('EXPERIENCE_APPROVED')).toBe('check_circle');
      expect(component.actionIcon('USER_SUSPENDED')).toBe('block');
      expect(component.actionIcon('UNKNOWN_ACTION')).toBe('info'); // Fallback
    });

    it('should return correct action colors', () => {
      expect(component.actionColor('EXPERIENCE_REJECTED')).toBe('warn');
      expect(component.actionColor('USER_SUSPENDED')).toBe('warn');
      expect(component.actionColor('BOOKING_CANCELLED')).toBe('warn');
      expect(component.actionColor('EXPERIENCE_APPROVED')).toBe('primary');
      expect(component.actionColor('USER_UNSUSPENDED')).toBe('primary');
      expect(component.actionColor('RANDOM_ACTION')).toBe(''); // Fallback
    });

    it('trackEntry should return the entry ID', () => {
      const result = component.trackEntry(0, mockEntries[0]);
      expect(result).toBe(1); // entry id is 1
    });
  });
});
