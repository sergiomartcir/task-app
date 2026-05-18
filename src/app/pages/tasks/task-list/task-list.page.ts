import { Component, inject, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonList, IonItemSliding, IonItem, IonFab, IonFabButton, IonBadge, IonItemOptions, IonItemOption, AlertController, IonSelect, IonSelectOption, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkCircleOutline, closeCircleOutline, trashOutline, refreshOutline, filterOutline } from 'ionicons/icons';

export type StatusFilter = 'todas' | 'pendientes' | 'completadas';
export type PriorityFilter = 'ninguno' | 'alta' | 'media' | 'baja';
export type CategoryFilter = 'todas' | 'compra' | 'casa' | 'trabajo' | 'ocio' | 'otros';
export type DateSort = 'ninguno' | 'asc' | 'desc';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonList, IonItemSliding, IonItem, IonFab, IonFabButton, IonBadge, IonItemOptions, IonItemOption, IonSelect, IonSelectOption, IonButtons, IonButton]
})
export class TaskListPage {

  private router = inject(Router);
  private taskService = inject(TaskService);
  private alertController = inject(AlertController);

  // la señal del service con la lista de tareas
  private allTasks = this.taskService.tasks;

  // las señales para cada uno de los desplegables de ls filtros
  public statusFilter = signal<StatusFilter>('todas');
  public priorityFilter = signal<PriorityFilter>('ninguno');
  public categoryFilter = signal<CategoryFilter>('todas');
  public dateSort = signal<DateSort>('ninguno');
  public showFilters = signal<boolean>(false);

  //señal computada que evalúa los tres filtros
  public filteredTasks = computed(() => {
    const tasks = this.allTasks();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const category = this.categoryFilter();
    const sort = this.dateSort();

    // Filtrado en una sola pasada
    let processedTasks = tasks.filter(task => {
      const matchStatus = status === 'todas' 
        || (status === 'pendientes' && !task.completed) 
        || (status === 'completadas' && task.completed);
        
      const matchPriority = priority === 'ninguno' || task.priority === priority;
      const matchCategory = category === 'todas' || task.category === category;

      return matchStatus && matchPriority && matchCategory;
    });

    // Ordenación
    if (sort !== 'ninguno') {
      processedTasks.sort((a, b) => {
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        
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
      closeCircleOutline,
      refreshOutline,
      filterOutline
    });
  }

  // --- MÉTODOS DE FILTRADO---
  public changeStatusFilter(event: CustomEvent): void {
    this.statusFilter.set(event.detail.value as StatusFilter);
  }

  public changePriorityFilter(event: CustomEvent): void {
    this.priorityFilter.set(event.detail.value as PriorityFilter);
  }

  public changeCategoryFilter(event: CustomEvent): void {
    this.categoryFilter.set(event.detail.value as CategoryFilter);
  }

  public changeDateSort(event: CustomEvent): void {
    this.dateSort.set(event.detail.value as DateSort);
  }

  public clearFilters(): void {
    this.statusFilter.set('todas');
    this.priorityFilter.set('ninguno');
    this.categoryFilter.set('todas');
    this.dateSort.set('ninguno');
  }

  // método para desplegar/ocultar el apartado de filtros
  public toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  // --- MÉTODOS DE NAVEGACIÓN Y ACCIONES ---

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

  // color de cada una de las prioridades
  public getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'compra': '#ffb703',
      'casa': '#2c9e90',
      'trabajo': '#0278b7',
      'ocio': '#e76f51',
      'otros': '#8d99ae'
    };
    
    return colors[category] || '#cccccc';
  }

}