import type { StateCreator } from "zustand";
import type { Task, TaskStatus, Priority } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewTaskInput {
  title: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  relatedProjectId: string | null;
  tags: string[];
}

export interface TasksSlice {
  tasks: Task[];
  addTask: (input: NewTaskInput) => Task;
  updateTask: (id: string, patch: Partial<NewTaskInput>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
}

export const createTasksSlice: StateCreator<AppState, [], [], TasksSlice> = (set) => ({
  tasks: [],

  addTask: (input) => {
    const now = new Date().toISOString();
    const task: Task = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: (id, patch) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  toggleTaskDone: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done", updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },
});
