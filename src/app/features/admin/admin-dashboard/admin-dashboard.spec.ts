import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminService } from '@rxp/features/admin/admin-service';
import { PlatformStats } from '@rxp/core/models/admin.model';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  // Dummy data to return from our mock service
  const mockStats: PlatformStats = {
    totalUsers: 205,
    totalExplorers: 150,
    totalHosts: 50,
    publishedCount: 120,
    totalExperiences: 130,
    pendingReview: 10,
    totalBookings: 300,
    totalRevenue: 5000,
    reviewsThisMonth: 45,
    avgRating: 4.8
  };

  beforeEach(async () => {
    // 1. Create a mock for the AdminService
    const spy = jasmine.createSpyObj('AdminService', ['getStats']);

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        // Provide our mock service instead of the real one
        { provide: AdminService, useValue: spy },
        // Provide an empty router configuration for RouterLink
        provideRouter([])
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  });

  describe('Successful Initialization', () => {
    beforeEach(() => {
      // Tell the mock service to return our dummy data successfully
      adminServiceSpy.getStats.and.returnValue(of(mockStats));

      // Create the component and trigger ngOnInit
      fixture = TestBed.createComponent(AdminDashboard);
      component = fixture.componentInstance;
      fixture.detectChanges(); // This triggers ngOnInit()
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call getStats on init', () => {
      expect(adminServiceSpy.getStats).toHaveBeenCalledTimes(1);
    });

    it('should populate stats signal and turn off loading', () => {
      // Check that the signals updated correctly
      expect(component.isLoading()).toBeFalse();
      expect(component.stats()).toEqual(mockStats);
      expect(component.error()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Tell the mock service to simulate a network/server error
      const mockError = new Error('Server unavailable');
      adminServiceSpy.getStats.and.returnValue(throwError(() => mockError));

      // Create the component and trigger ngOnInit
      fixture = TestBed.createComponent(AdminDashboard);
      component = fixture.componentInstance;
      fixture.detectChanges(); // This triggers ngOnInit()
    });

    it('should capture the error message and turn off loading', () => {
      // Check that the error was caught and signals updated correctly
      expect(component.isLoading()).toBeFalse();
      expect(component.stats()).toBeNull();
      expect(component.error()).toBe('Server unavailable');
    });
  });
});
