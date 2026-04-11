import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoModeComponent } from './video-mode.component';

describe('VideoModeComponent', () => {
  let component: VideoModeComponent;
  let fixture: ComponentFixture<VideoModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
