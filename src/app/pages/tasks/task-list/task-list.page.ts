import { Component, inject, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonList, IonItemSliding, IonFab, IonFabButton, AlertController, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { TaskCardComponent } from 'src/app/shared/components/task-card/task-card.component';
import { TaskFiltersComponent } from 'src/app/shared/components/task-filters/task-filters.component';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline } from 'ionicons/icons';

export type StatusFilter = 'todas' | 'pendientes' | 'completadas';
export type PriorityFilter = 'ninguno' | 'alta' | 'media' | 'baja';
export type CategoryFilter = 'todas' | 'compra' | 'casa' | 'trabajo' | 'ocio' | 'otros';
export type DateSort = 'ninguno' | 'asc' | 'desc';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonIcon, IonList, IonFab, IonFabButton, IonButtons, IonButton, TaskCardComponent, TaskFiltersComponent]
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

  //señal computada que evalúa los filtros
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
      filterOutline
    });
  }

  // --- MÉTODOS DE FILTRADO---

  public changeStatusFilter(value: StatusFilter): void { 
    this.statusFilter.set(value); 
  }

  public changePriorityFilter(value: PriorityFilter): void { 
    this.priorityFilter.set(value); 
  }

  public changeCategoryFilter(value: CategoryFilter): void { 
    this.categoryFilter.set(value); 
  }

  public changeDateSort(value: DateSort): void { 
    this.dateSort.set(value); 
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

  // --- MÉTODOS DE NAVEGACIÓN ---

  // método para navegar al form de añadir nueva tarea
  public navigateToCreateTask(): void {
    this.router.navigate(['/task-detail']);
  }

  // ir a detalles de la tarea y poder editarla
  public navigateToTaskDetail(taskId: number): void {
    this.router.navigate(['/task-detail', taskId]);
  }

  // --- MÉTODOS DE ACCIONES ---

  public async toggleTaskCompletion(event: {id: number, slidingItem: IonItemSliding}): Promise<void> {
    // Esperamos a que la animación de cierre de Ionic termine por completo
    await event.slidingItem.close();
    
    // Una vez cerrada, cambiamos el estado
    this.taskService.toggleCompletion(event.id);
  }

  // eliminar la tarea y confirmarlo con el AlertController
  public async confirmDeleteTask(event: {id: number, slidingItem: IonItemSliding}): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Estás seguro de que deseas eliminar esta tarea?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            event.slidingItem.close();
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteTask(event.id);
            
            event.slidingItem.close();
          }
        }

      ]
    });

    await alert.present();
  }

}