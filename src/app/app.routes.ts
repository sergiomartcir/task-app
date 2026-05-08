import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then( m => m.SplashPage)
  },
  {
    path: 'task-list',
    loadComponent: () => import('./pages/tasks/task-list/task-list.page').then( m => m.TaskListPage)
  },
  {
    path: 'task-detail',
    loadComponent: () => import('./pages/tasks/task-detail/task-detail.page').then( m => m.TaskDetailPage)
  },
  {
    path: 'task-detail/:id', //para editar la tarea
    loadComponent: () => import('./pages/tasks/task-detail/task-detail.page').then( m => m.TaskDetailPage)
  }
];
