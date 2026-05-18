import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskCameraComponent } from './task-camera.component';

describe('TaskCameraComponent', () => {
  let component: TaskCameraComponent;
  let fixture: ComponentFixture<TaskCameraComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskCameraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
