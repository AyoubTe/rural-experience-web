import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceDetail } from './experience-detail';

describe('ExperienceDetail', () => {
  let component: ExperienceDetail;
  let fixture: ComponentFixture<ExperienceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
