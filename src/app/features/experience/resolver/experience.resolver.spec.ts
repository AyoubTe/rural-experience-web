import { TestBed } from '@angular/core/testing';
import {RedirectCommand, ResolveFn} from '@angular/router';

import { experienceResolver } from './experience.resolver';
import {Experience} from '@rxp/core/models/experience.model';

describe('experienceResolver', () => {
  const executeResolver: ResolveFn<Experience | RedirectCommand> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => experienceResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
