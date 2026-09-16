import type { StateCreator } from "zustand";
import type { Project, ProjectStatus, Priority } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewProjectInput {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  notes: string;
  link: string;
  tags: string[];
  relatedDocumentIds: string[];
}

export interface ProjectsSlice {
  projects: Project[];
  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, patch: Partial<NewProjectInput>) => void;
  deleteProject: (id: string) => void;
}

export const createProjectsSlice: StateCreator<AppState, [], [], ProjectsSlice> = (set) => ({
  projects: [],

  addProject: (input) => {
    const now = new Date().toISOString();
    const project: Project = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: (id, patch) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  // Cascades: a deleted project shouldn't leave orphaned references dangling
  // in other entities, so we clear them here rather than deleting the
  // referencing tasks/documents/etc. outright.
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.map((t) => (t.relatedProjectId === id ? { ...t, relatedProjectId: null } : t)),
      documents: state.documents.map((d) =>
        d.relatedProjectId === id ? { ...d, relatedProjectId: null } : d
      ),
      meetings: state.meetings.map((m) =>
        m.relatedProjectId === id ? { ...m, relatedProjectId: null } : m
      ),
      people: state.people.map((p) => (p.relatedProjectId === id ? { ...p, relatedProjectId: null } : p)),
    }));
  },
});
