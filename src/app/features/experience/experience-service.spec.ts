import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ExperienceService } from './experience-service';
import { MOCK_EXPERIENCES } from '@rxp/core/mocks/experience.mock';

describe('ExperienceService', () => {
  let service: ExperienceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service  = TestBed.inject(ExperienceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('search() calls the correct endpoint with params', () => {
    service.search({ keyword: 'lavender', page: 0 })
      .subscribe(response => {
        expect(response.content.length).toBe(3);
      });

    const req = httpMock.expectOne(r =>
      r.url.includes('/experiences') &&
      r.params.get('keyword') === 'lavender'
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      content: MOCK_EXPERIENCES,
      page: 0, size: 12,
      totalElements: 3, totalPages: 1,
      first: true, last: true,
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
      error: (err: Error) => {
        expect(err.message).toContain('could not be found');
      },
    });

    const req = httpMock.expectOne('/api/v1/experiences/999');
    req.flush(
      { message: 'Experience not found' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  it('search() retries once on failure', () => {
    service.search({}).subscribe({ error: () => {} });

    httpMock.expectOne(r => r.url.includes('/experiences'))
      .error(new ProgressEvent('error'));

    httpMock.expectOne(r => r.url.includes('/experiences'))
      .error(new ProgressEvent('error'));
  });
});
