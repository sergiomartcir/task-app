import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskFiltersComponent } from './task-filters.component';

describe('TaskFiltersComponent', () => {
  let component: TaskFiltersComponent;
  let fixture: ComponentFixture<TaskFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
