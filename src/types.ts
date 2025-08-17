export type Project = {
    id: number;
    name: string;
    description: string;
    status: string;          // "todo" | "in_progress" | "done" (бэк может не валидировать строго)
    created_at: string;      // ISO строка
};

export type Task = {
    id: number;
    project_id: number;
    title: string;
    is_done: boolean;
    created_at: string;      // ISO строка
};

export type ProjectWithTasks = {
    project: Project;
    tasks: Task[];
};