import { Injectable, signal, effect } from '@angular/core';
import { Task } from '../interfaces/task.interface';

// datos iniciales de la app si no hay nada
const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Revisar repositorio',
    deadline: '2026-05-02',
    priority: 'alta',
    category: 'trabajo',
    completed: true
  },
  {
    id: 2,
    title: 'Hacer la compra',
    description: 'Revisar la lista de la compra para el Mercadona',
    deadline: '2026-05-8',
    priority: 'media',
    category: 'compra',
    completed: false
  },
  {
    id: 3,
    title: 'Cortar el césped',
    description: 'Cortar el césped del jardín y quitar las malas hierbas',
    deadline: '2026-06-01',
    priority: 'baja',
    category: 'casa',
    completed: false
  },
  {
    id: 4,
    title: 'Cine',
    description: 'Comprar las entradas para la nueva película',
    deadline: '2026-04-06',
    priority: 'alta',
    category: 'ocio',
    completed: true
  }
];

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // señal con el array de tareas leyendo de LocalStorage
  private tasksSignal = signal<Task[]>(this.loadInitialTasks());

  public readonly tasks = this.tasksSignal.asReadonly();

  constructor() {
    // para la persistencia de los datos del array en el navegador
    effect(() => {
      localStorage.setItem('tasks', JSON.stringify(this.tasksSignal()));
    });
  }

  private loadInitialTasks(): Task[] {
    const savedTasks = localStorage.getItem('tasks');
    let tasks: Task[] = INITIAL_TASKS;

    if (savedTasks) {
      try {
        tasks = JSON.parse(savedTasks);
      
      } catch (error) {
        console.error('Error al parsear el LocalStorage. Se cargarán las tareas por defecto.', error);
      }
    }

    return tasks;
  }

  // -- MÉTODOS CRUD --
  
  public getTaskById(id: number): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }

  public addTask(newTask: Task): void {
    this.tasksSignal.update((currentTasks) => [...currentTasks, newTask]);
  }

  public updateTask(updatedTask: Task): void {
    this.tasksSignal.update((currentTasks) =>
      currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }

  public deleteTask(id: number): void {
    this.tasksSignal.update((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
  }

  public toggleCompletion(id: number): void {
    this.tasksSignal.update((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }
}
