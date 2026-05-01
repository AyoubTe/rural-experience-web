import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ExperienceService } from './experience-service';
import { MOCK_EXPERIENCES } from '@rxp/core/mocks/experience.mock';

describe('ExperienceService', () => {
  let service: ExperienceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExperienceService,
        // 1. Modern Angular HTTP testing providers (Replaces HttpClientTestingModule)
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ExperienceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // 2. Always verify that there are no outstanding HTTP requests after each test
  afterEach(() => {
    httpMock.verify();
  });

  it('search() calls the correct endpoint with params', () => {
    // Act: Call the service
    service.search({ keyword: 'lavender', page: 0 }).subscribe(response => {
      // Assert: Verify the mocked response was received
      expect(response.content.length).toBe(3);
      expect(response.totalElements).toBe(3);
    });

    // Assert: Check the exact URL and parameters sent to the server
    const req = httpMock.expectOne(r =>
      r.url.includes('/experiences') &&
      r.params.get('keyword') === 'lavender'
    );
    expect(req.request.method).toBe('GET');

    // Act: Flush the mock data back to the service
    req.flush({
      content: MOCK_EXPERIENCES,
      page: 0,
      size: 12,
      totalElements: 3,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 3,
    });
  });

  it('getById() returns a single experience', () => {
    const mockExp = MOCK_EXPERIENCES[0];

    service.getById(1).subscribe(exp => {
      expect(exp.id).toBe(1);
      expect(exp.title).toBe(mockExp.title);
    });

    const req = httpMock.expectOne('/api/v1/experiences/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockExp);
  });

  it('getById() returns user-friendly message on 404', () => {
    service.getById(999).subscribe({
      next: () => fail('Should have failed with a 404 error'),
      error: (err: Error) => {
        // Checking if your service correctly maps the 404 to a readable error message
        expect(err.message).toContain('could not be found');
      },
    });

    const req = httpMock.expectOne('/api/v1/experiences/999');

    // Simulate a 404 Not Found response from the backend
    req.flush(
      { message: 'Experience not found' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  it('search() retries once on failure', () => {
    service.search({}).subscribe({
      next: () => fail('Should have failed after retries'),
      error: () => {
        // Successfully caught the error after retries are exhausted
        expect(true).toBeTrue();
      }
    });

    // First attempt fails
    const req1 = httpMock.expectOne(r => r.url.includes('/experiences'));
    req1.error(new ProgressEvent('error'));

    // Because your service uses retry(1), it should immediately make a second request
    const req2 = httpMock.expectOne(r => r.url.includes('/experiences'));
    req2.error(new ProgressEvent('error'));
  });
});
