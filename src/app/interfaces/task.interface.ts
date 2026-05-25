import { TaskLocation } from "./task-location.interface";

export type TaskPriority = 'alta' | 'media' | 'baja';
export type TaskCategory = 'compra' | 'casa' | 'trabajo' | 'ocio' | 'otros';

export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    priority: TaskPriority;
    category: TaskCategory;
    image?: string;  // guardada como Base64 por el LocalStorage
    location?: TaskLocation;
    completed: boolean;
}