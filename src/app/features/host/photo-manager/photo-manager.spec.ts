import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoManager } from './photo-manager';

describe('PhotoManager', () => {
  let component: PhotoManager;
  let fixture: ComponentFixture<PhotoManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
