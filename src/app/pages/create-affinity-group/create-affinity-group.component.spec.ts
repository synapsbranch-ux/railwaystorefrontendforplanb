import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAffinityGroupComponent } from './create-affinity-group.component';

describe('CreateAffinityGroupComponent', () => {
  let component: CreateAffinityGroupComponent;
  let fixture: ComponentFixture<CreateAffinityGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAffinityGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAffinityGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
