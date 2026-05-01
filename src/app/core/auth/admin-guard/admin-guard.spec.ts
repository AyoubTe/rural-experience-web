import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import {adminGuard} from '@rxp/core/auth/admin-guard/admin-guard';

describe('adminGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
