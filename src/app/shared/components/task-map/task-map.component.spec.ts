import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskMapComponent } from './task-map.component';

describe('TaskMapComponent', () => {
  let component: TaskMapComponent;
  let fixture: ComponentFixture<TaskMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
