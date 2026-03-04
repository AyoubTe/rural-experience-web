import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { experienceResolver } from './experience.resolver';

describe('experienceResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => experienceResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
