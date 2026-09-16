import type { StateCreator } from "zustand";
import type { Person } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewPersonInput {
  name: string;
  role: string;
  email: string;
  notes: string;
  relatedProjectId: string | null;
  tags: string[];
}

export interface PeopleSlice {
  people: Person[];
  addPerson: (input: NewPersonInput) => Person;
  updatePerson: (id: string, patch: Partial<NewPersonInput>) => void;
  deletePerson: (id: string) => void;
}

export const createPeopleSlice: StateCreator<AppState, [], [], PeopleSlice> = (set) => ({
  people: [],

  addPerson: (input) => {
    const now = new Date().toISOString();
    const person: Person = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ people: [person, ...state.people] }));
    return person;
  },

  updatePerson: (id, patch) => {
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    }));
  },

  deletePerson: (id) => {
    set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
  },
});
