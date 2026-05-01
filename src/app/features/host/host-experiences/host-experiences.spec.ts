import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostExperiences } from './host-experiences';

describe('HostExperiences', () => {
  let component: HostExperiences;
  let fixture: ComponentFixture<HostExperiences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostExperiences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostExperiences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
