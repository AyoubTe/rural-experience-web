import { TestBed } from '@angular/core/testing';

import { HostExperienceService } from './host-experience-service';

describe('HostExperienceService', () => {
  let service: HostExperienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostExperienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
