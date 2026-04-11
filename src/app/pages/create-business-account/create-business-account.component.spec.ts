import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBusinessAccountComponent } from './create-business-account.component';

describe('CreateBusinessAccountComponent', () => {
  let component: CreateBusinessAccountComponent;
  let fixture: ComponentFixture<CreateBusinessAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBusinessAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBusinessAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
