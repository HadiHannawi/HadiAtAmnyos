import type { StateCreator } from "zustand";
import type { Idea, Priority } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewIdeaInput {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  tags: string[];
}

export interface IdeasSlice {
  ideas: Idea[];
  addIdea: (input: NewIdeaInput) => Idea;
  updateIdea: (id: string, patch: Partial<NewIdeaInput>) => void;
  deleteIdea: (id: string) => void;
}

export const createIdeasSlice: StateCreator<AppState, [], [], IdeasSlice> = (set) => ({
  ideas: [],

  addIdea: (input) => {
    const now = new Date().toISOString();
    const idea: Idea = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ ideas: [idea, ...state.ideas] }));
    return idea;
  },

  updateIdea: (id, patch) => {
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i)),
    }));
  },

  deleteIdea: (id) => {
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));
  },
});
