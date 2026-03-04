import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostShell } from './host-shell';

describe('HostShell', () => {
  let component: HostShell;
  let fixture: ComponentFixture<HostShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
