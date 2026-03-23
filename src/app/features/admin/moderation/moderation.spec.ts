import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Moderation } from './moderation';
import { AdminService } from '@rxp/features/admin/admin-service';
import { NotificationService } from '@rxp/features/notification/notification-service';
import { AdminExperience } from '@rxp/core/models/admin.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PageEvent } from '@angular/material/paginator';

describe('Moderation', () => {
  let component: Moderation;
  let fixture: ComponentFixture<Moderation>;

  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  // 1. PERFECTLY MATCHED MOCK
  const mockExperiences: AdminExperience[] = [
    {
      id: 1,
      title: 'Test Exp 1',
      status: 'PENDING_REVIEW',
      hostName: 'Host A',
      hostEmail: 'host.a@rxp.com',
      category: 'Nature',
      location: 'Paris',
      country: 'France',
      pricePerPerson: 50,
      submittedAt: '2026-01-01T00:00:00Z',
      reviewCount: 0
    },
    {
      id: 2,
      title: 'Test Exp 2',
      status: 'PENDING_REVIEW',
      hostName: 'Host B',
      hostEmail: 'host.b@rxp.com',
      category: 'Food',
      location: 'Lyon',
      country: 'France',
      pricePerPerson: 60,
      submittedAt: '2026-01-02T00:00:00Z',
      reviewCount: 0
    }
  ];

  const mockPaginatedResponse = {
    content: mockExperiences,
    totalElements: 2,
    page: 0,
    size: 20,
    totalPages: 1,
    last: true,
    first: true,
    numberOfElements: 2
  };

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['getPendingReview', 'moderateExperience', 'bulkModerate']);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    adminServiceSpy.getPendingReview.and.returnValue(of(mockPaginatedResponse));

    await TestBed.configureTestingModule({
      imports: [Moderation, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Moderation);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create and load pending experiences on init', () => {
    expect(component).toBeTruthy();
    expect(adminServiceSpy.getPendingReview).toHaveBeenCalledWith(0, 20);

    expect(component.pending().length).toBe(2);
    expect(component.total()).toBe(2);
    expect(component.currentPage()).toBe(0);
    expect(component.isLoading()).toBeFalse();
  });

  describe('Selection Logic', () => {
    it('should toggle all items', () => {
      component.toggleAll({ checked: true } as MatCheckboxChange);
      expect(component.selectedIds().size).toBe(2);
      expect(component.allSelected()).toBeTrue();

      component.toggleAll({ checked: false } as MatCheckboxChange);
      expect(component.selectedIds().size).toBe(0);
      expect(component.allSelected()).toBeFalse();
    });

    it('should toggle a single item', () => {
      component.toggleOne(1);
      expect(component.selectedIds().has(1)).toBeTrue();
      expect(component.someSelected()).toBeTrue();
      expect(component.allSelected()).toBeFalse();

      component.toggleOne(1);
      expect(component.selectedIds().has(1)).toBeFalse();
    });
  });

  describe('Single Actions', () => {
    it('should approve a single experience and update list', () => {
      // FIX: Return a mocked AdminExperience instead of an empty {}
      adminServiceSpy.moderateExperience.and.returnValue(of(mockExperiences[0]));

      component.onApprove(mockExperiences[0]);

      expect(adminServiceSpy.moderateExperience).toHaveBeenCalledWith({ experienceId: 1, action: 'APPROVE' });
      expect(component.pending().length).toBe(1);
      expect(notificationSpy.success).toHaveBeenCalled();
    });

    it('should reject an experience after dialog confirmation', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

      // FIX: Return a mocked AdminExperience instead of an empty {}
      adminServiceSpy.moderateExperience.and.returnValue(of(mockExperiences[0]));

      component.onReject(mockExperiences[0]);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(adminServiceSpy.moderateExperience).toHaveBeenCalledWith({ experienceId: 1, action: 'REJECT' });
      expect(component.pending().length).toBe(1);
      expect(notificationSpy.info).toHaveBeenCalled();
    });

    it('should NOT reject if dialog is cancelled', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

      component.onReject(mockExperiences[0]);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(adminServiceSpy.moderateExperience).not.toHaveBeenCalled();
      expect(component.pending().length).toBe(2);
    });
  });

  describe('Bulk Actions', () => {
    it('should bulk approve selected experiences after dialog confirmation', () => {
      component.toggleAll({ checked: true } as MatCheckboxChange);

      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

      // FIX: Return of(undefined) to correctly match Observable<void>
      adminServiceSpy.bulkModerate.and.returnValue(of(undefined));

      component.onBulkApprove();

      expect(adminServiceSpy.bulkModerate).toHaveBeenCalledWith([
        { experienceId: 1, action: 'APPROVE' },
        { experienceId: 2, action: 'APPROVE' }
      ]);
      expect(component.pending().length).toBe(0);
      expect(component.selectedIds().size).toBe(0);
      expect(notificationSpy.success).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should load new page on page change', () => {
      adminServiceSpy.getPendingReview.calls.reset();

      const pageEvent = { pageIndex: 2, pageSize: 20, length: 50 } as PageEvent;
      component.onPageChange(pageEvent);

      expect(adminServiceSpy.getPendingReview).toHaveBeenCalledWith(2, 20);
    });
  });
});
