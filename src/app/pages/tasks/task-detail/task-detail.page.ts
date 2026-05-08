import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { TaskService } from 'src/app/services/task.service';
import { Task, TaskPriority } from 'src/app/interfaces/task.interface';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonIcon
  ]
})
export class TaskDetailPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  
  // Señal para saber si la vista está en modo edición o creación
  public isEditMode = signal<boolean>(false);
  
  // Guardamos el ID actual si estamos editando
  private currentTaskId: number | null = null;
  // guardamos el estado original de la tarea para no perderlo al editar
  private isTaskCompleted: boolean = false;

  // inicializamos el formulario con sus validaciones
  public taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    deadline: ['', Validators.required],
    priority: ['media' as TaskPriority, Validators.required]
  });

  constructor() {
    addIcons({ 
      saveOutline 
    });
  }

  ngOnInit(): void {
    this.checkIfEditMode();
  }

  private checkIfEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.currentTaskId = Number(idParam);
      
      this.isEditMode.set(true);
      this.loadTaskData(this.currentTaskId);
    }
  }

  private loadTaskData(id: number): void {
    const task = this.taskService.getTaskById(id);
    
    if (task) {
      // Guardamos el estado completado para no sobreescribirlo accidentalmente
      this.isTaskCompleted = task.completed;
      
      // rellenamos el formulario con los datos existentes
      this.taskForm.patchValue({
        title: task.title,
        description: task.description || '',
        deadline: task.deadline,
        priority: task.priority
      });
    }
  }

  public saveTask(): void {
    if (this.taskForm.valid) {
      // getRawValue() extrae los valores con sus tipos exactos sin posibilidad de nulos
      const formValues = this.taskForm.getRawValue();
      
      const taskData: Task = {
        // Si editamos, usamos el id que ya tenía
        id: this.isEditMode() && this.currentTaskId ? this.currentTaskId : Date.now(),
        title: formValues.title,
        description: formValues.description,
        deadline: formValues.deadline,
        priority: formValues.priority,
        completed: this.isTaskCompleted 
      };

      if (this.isEditMode()) {
        this.taskService.updateTask(taskData);
      } else {
        this.taskService.addTask(taskData);
      }

      // Volvemos al listado
      this.router.navigate(['/task-list']);
    
    } else {
      // Si el formulario es inválido, forzamos a que se muestren los errores
      this.taskForm.markAllAsTouched();
    }
  }

  // Método auxiliar puro para el HTML
  public isFieldInvalid(field: string): boolean {
    const control = this.taskForm.get(field);
    const isInvalid = !!(control && control.invalid && (control.dirty || control.touched));
    
    return isInvalid;
  }
}