import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthShell } from './auth-shell';

describe('AuthShell', () => {
  let component: AuthShell;
  let fixture: ComponentFixture<AuthShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthShell],
      providers: [
        // Provide an empty routing array so RouterLink and RouterOutlet don't crash
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AuthShell);
    component = fixture.componentInstance;

    // Trigger initial data binding
    fixture.detectChanges();
  });

  it('should create the auth shell', () => {
    expect(component).toBeTruthy();
  });
});
