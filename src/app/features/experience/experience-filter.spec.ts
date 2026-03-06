import { TestBed } from '@angular/core/testing';

import { ExperienceFilter } from './experience-filter';

describe('ExperienceFilter', () => {
  let service: ExperienceFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExperienceFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
