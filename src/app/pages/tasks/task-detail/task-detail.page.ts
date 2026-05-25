import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { TaskService } from 'src/app/services/task.service';
import { QrScannerService } from 'src/app/services/qr-scanner.service';
import { Task, TaskCategory, TaskPriority } from 'src/app/interfaces/task.interface';
import { TaskLocation } from 'src/app/interfaces/task-location.interface';
import { TaskCameraComponent } from 'src/app/shared/components/task-camera/task-camera.component';
import { TaskMapComponent } from 'src/app/shared/components/task-map/task-map.component';
import { addIcons } from 'ionicons';
import { saveOutline, qrCodeOutline, linkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonIcon, TaskCameraComponent, TaskMapComponent]
})
export class TaskDetailPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private qrScannerService = inject(QrScannerService);
  
  // Señal para saber si la vista está en modo edición o creación
  public isEditMode = signal<boolean>(false);
  // señal para la imagen capturada con el dispositivo
  public capturedImage = signal<string | undefined>(undefined);
  public selectedLocation = signal<TaskLocation | undefined>(undefined);
  public isMapVisible = signal<boolean>(false);

  // Guardamos el ID actual si estamos editando
  private currentTaskId: number | null = null;
  // guardamos el estado original de la tarea para no perderlo al editar
  private isTaskCompleted: boolean = false;

  // inicializamos el formulario con sus validaciones
  public taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    deadline: ['', Validators.required],
    priority: ['media' as TaskPriority, Validators.required],
    category: ['otros' as TaskCategory, Validators.required]
  });

  constructor() {
    addIcons({ 
      saveOutline,
      qrCodeOutline,
      linkOutline,
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
      this.capturedImage.set(task.image);  //Guardamos la image
      this.selectedLocation.set(task.location);
      
      // rellenamos el formulario con los datos existentes
      this.taskForm.patchValue({
        title: task.title,
        description: task.description || '',
        deadline: task.deadline,
        priority: task.priority,
        category: task.category
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
        category: formValues.category,
        image: this.capturedImage(),
        location: this.selectedLocation(),
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

  // -- FUNCIONALIDAD DE CAMERA --

  // actualiza la señal para recibir la imagen de task-camera
  public updateCapturedImage(newImage: string | undefined): void {
    this.capturedImage.set(newImage);
  }

  // -- FUNCIONALIDAD DE ESCÁNER QR -- 

  public async scanQRCode(): Promise<void> {
    // llamamos a nuestro servicio limpio
    const qrText = await this.qrScannerService.scanQRCode();

    // Si nos ha devuelto algo, actualizamos el formulario
    if (qrText) {
      const currentDescription = this.taskForm.value.description;
      
      this.taskForm.patchValue({
        description: currentDescription 
          ? `${currentDescription}\n${qrText}`
          : qrText
      });
    }
  }

  // Este "getter" se ejecuta en tiempo real cada vez que cambia el texto de la descripción
  public get detectedLinks(): string[] {
    const text = this.taskForm.get('description')?.value || '';
    // Esta fórmula matemática (RegEx) busca cualquier texto que empiece por http o https
    const urlRegex = /(https?:\/\/[^\s]+)/g; 
    
    // Devuelve un array con todos los enlaces encontrados, o un array vacío si no hay ninguno
    return text.match(urlRegex) || [];
  }

  // -- FUNCIONALIDAD DEL MAPA --

  public toggleMap(): void {
    this.isMapVisible.update(v => !v);
  }

  public onLocationSelected(location: TaskLocation): void {
    this.selectedLocation.set(location);
    this.isMapVisible.set(false); // Ocultamos el mapa al seleccionar para limpiar la vista
  }

  public clearLocation(): void {
    this.selectedLocation.set(undefined);
    this.isMapVisible.set(true); // Opcional: Reabrimos el mapa por si quiere elegir otra
  }

}