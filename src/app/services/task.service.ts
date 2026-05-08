import { Injectable, signal, effect} from '@angular/core';
import { Task } from '../interfaces/task.interface';

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
    let initialTasks: Task[] = [
      {
        id: 1,
        title: 'Tarea 1',
        description: 'Hola',
        deadline: '2026-05-02',
        priority: 'alta',
        completed: true
      },
      {
        id: 2,
        title: 'Tarea 2',
        description: 'Revisar',
        deadline: '2026-05-8',
        priority: 'baja',
        completed: false
      },
      {
        id: 3,
        title: 'Tarea 3',
        description: 'Revisar la documentación oficial',
        deadline: '2026-06-01',
        priority: 'media',
        completed: false
      },
      {
        id: 4,
        title: 'Tarea 4',
        deadline: '2026-04-06',
        priority: 'alta',
        completed: true
      }
    ];

    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
      initialTasks = JSON.parse(savedTasks);
    }
    
    return initialTasks;
  }
  
  // métodos CRUD
  public getTaskById(id: number): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);;
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
