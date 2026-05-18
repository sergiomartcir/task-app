import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonItemSliding, IonItem, IonBadge, IonItemOptions, IonItemOption,
  IonIcon 
} from '@ionic/angular/standalone';
import { Task } from '../../../interfaces/task.interface';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, trashOutline } from 'ionicons/icons';


@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonItemSliding, IonItem, IonBadge, 
    IonItemOptions, IonItemOption, IonIcon
  ]
})
export class TaskCardComponent {
  // Recibimos la tarea individual
  @Input({ required: true }) task!: Task;

  // Emitimos eventos hacia el componente padre (task-list)
  @Output() taskClick = new EventEmitter<number>();
  @Output() toggleComplete = new EventEmitter<{id: number, slidingItem: IonItemSliding}>();
  @Output() delete = new EventEmitter<{id: number, slidingItem: IonItemSliding}>();

  constructor() { 
    addIcons({
      trashOutline,
      checkmarkCircleOutline, 
      closeCircleOutline
    });
  }

  // --- COLORES DE LA UI DE LAS TASKS ---

  // color de cada una de las prioridades
  public getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'alta': 'danger',
      'media': 'warning',
      'baja': 'success'
    };
    
    return colors[priority] || 'primary';
  }

  // color de cada una de las categorías
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
