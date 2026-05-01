import { TestBed } from '@angular/core/testing';

import { ExperienceFilterService } from './experience-filter';

describe('ExperienceFilter', () => {
  let service: ExperienceFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExperienceFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
