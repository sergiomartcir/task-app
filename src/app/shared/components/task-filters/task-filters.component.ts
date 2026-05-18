import { Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { StatusFilter, PriorityFilter, CategoryFilter, DateSort } from 'src/app/pages/tasks/task-list/task-list.page';

@Component({
  selector: 'app-task-filters',
  templateUrl: './task-filters.component.html',
  styleUrls: ['./task-filters.component.scss'],
  standalone: true,
  imports: [CommonModule, IonSelect, IonSelectOption, IonButton, IonIcon]
})
export class TaskFiltersComponent {
  // Entrada de datos (lo que nos manda el padre)
  @Input({ required: true }) status!: StatusFilter;
  @Input({ required: true }) priority!: PriorityFilter;
  @Input({ required: true }) category!: CategoryFilter;
  @Input({ required: true }) sort!: DateSort;

  // salida de datos (lo que le decimos al padre que ha cambiado)
  @Output() statusChange = new EventEmitter<StatusFilter>();
  @Output() priorityChange = new EventEmitter<PriorityFilter>();
  @Output() categoryChange = new EventEmitter<CategoryFilter>();
  @Output() sortChange = new EventEmitter<DateSort>();
  @Output() clear = new EventEmitter<void>();

  constructor() { 
    addIcons({
      refreshOutline
    });
  }

  // Métodos auxiliares para emitir solo el valor limpio, en lugar de todo el evento nativo
  public onStatusChange(event: CustomEvent): void { 
    this.statusChange.emit(event.detail.value); 
  }

  public onPriorityChange(event: CustomEvent): void { 
    this.priorityChange.emit(event.detail.value); 
  }

  public onCategoryChange(event: CustomEvent): void { 
    this.categoryChange.emit(event.detail.value); 
  }

  public onSortChange(event: CustomEvent): void { 
    this.sortChange.emit(event.detail.value); 
  }

}
