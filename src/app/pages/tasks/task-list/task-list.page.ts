import { Component, inject, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonList, IonItemSliding, IonItem, IonFab, IonFabButton, IonBadge, IonItemOptions, IonItemOption, AlertController, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkCircleOutline, closeCircleOutline, trashOutline } from 'ionicons/icons';

export type StatusFilter = 'todas' | 'pendientes' | 'completadas';
export type PriorityFilter = 'ninguno' | 'alta' | 'media' | 'baja';
export type DateSort = 'ninguno' | 'asc' | 'desc';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonList, IonItemSliding, IonItem, IonFab, IonFabButton, IonBadge, IonItemOptions, IonItemOption, IonSelect, IonSelectOption]
})
export class TaskListPage {

  private router = inject(Router);
  private taskService = inject(TaskService);
  private alertController = inject(AlertController);

  // la señal del service con la lista de tareas
  private allTasks = this.taskService.tasks;

  // las tres señales para cada uno de los desplegables de ls filtros
  public statusFilter = signal<StatusFilter>('todas');
  public priorityFilter = signal<PriorityFilter>('ninguno');
  public dateSort = signal<DateSort>('ninguno');

  //señal computada que evalúa y cruza los tres fltros
  public filteredTasks = computed(() => {
    const tasks = this.allTasks();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const sort = this.dateSort();

    // Hacemos una copia del array para no mutar el original
    let processedTasks = [...tasks];

    // 1. Filtrar por Estado
    if (status === 'pendientes') {
      processedTasks = processedTasks.filter(task => !task.completed);
    } else if (status === 'completadas') {
      processedTasks = processedTasks.filter(task => task.completed);
    }

    // 2. Filtrar por Prioridad
    if (priority !== 'ninguno') {
      processedTasks = processedTasks.filter(task => task.priority === priority);
    }

    // 3. Ordenar por Fecha
    if (sort !== 'ninguno') {
      processedTasks.sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        
        // desc (mayor a menor) | asc (menor a mayor)
        return sort === 'desc' ? timeB - timeA : timeA - timeB;
      });
    }

    return processedTasks; 
  });

  constructor() { 
    addIcons({ 
      addOutline,
      trashOutline,
      checkmarkCircleOutline, 
      closeCircleOutline
    });
  }

  // métodos para actualizar pr el filtro
  public changeStatusFilter(event: any): void {
    this.statusFilter.set(event.detail.value);
  }

  public changePriorityFilter(event: any): void {
    this.priorityFilter.set(event.detail.value);
  }

  public changeDateSort(event: any): void {
    this.dateSort.set(event.detail.value);
  }

  // método para navegar al form de añadir nueva tarea
  public navigateToCreateTask(): void {
    this.router.navigate(['/task-detail']);
  }

  // ir a detalles de la tarea y poder editarla
  public navigateToTaskDetail(taskId: number): void {
    this.router.navigate(['/task-detail', taskId]);
  }

  public async toggleTaskCompletion(taskId: number, slidingItem: IonItemSliding): Promise<void> {
    // Esperamos a que la animación de cierre de Ionic termine por completo
    await slidingItem.close();
    
    // Una vez cerrada, cambiamos el estado
    this.taskService.toggleCompletion(taskId);
  }

  // eliminar la tarea y confirmarlo con el AlertController
  public async confirmDeleteTask(taskId: number, slidingItem: IonItemSliding): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Estás seguro de que deseas eliminar esta tarea?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            slidingItem.close();
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteTask(taskId);
            
            slidingItem.close();
          }
        }

      ]
    });

    await alert.present();
  }

  // color de cada una de las prioridades
  public getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'alta': 'danger',
      'media': 'warning',
      'baja': 'success'
    };
    
    return colors[priority] || 'primary';
  }

}
