export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    priority: TaskPriority;
    completed: boolean;
}

export type TaskPriority = 'alta' | 'media' | 'baja';