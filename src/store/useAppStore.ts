import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState } from "./types";
import { createProjectsSlice } from "./slices/projectsSlice";
import { createTasksSlice } from "./slices/tasksSlice";
import { createDocumentsSlice } from "./slices/documentsSlice";
import { createMeetingsSlice } from "./slices/meetingsSlice";
import { createIdeasSlice } from "./slices/ideasSlice";
import { createPeopleSlice } from "./slices/peopleSlice";

// This is the single source of truth for every piece of user data. Zustand's
// `persist` middleware wraps `set`/`get` so every mutation is transparently
// mirrored to LocalStorage as JSON under STORAGE_KEY — that's the entire
// "database" for this app. No server round-trip, no async loading state.
export const STORAGE_KEY = "hadi-os:data";

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createProjectsSlice(...a),
      ...createTasksSlice(...a),
      ...createDocumentsSlice(...a),
      ...createMeetingsSlice(...a),
      ...createIdeasSlice(...a),
      ...createPeopleSlice(...a),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      // v1 -> v2: Project gained `link`, AppDocument gained `attachment`.
      // Old persisted data won't have these keys, so back-fill safe
      // defaults rather than letting `undefined` leak into components.
      migrate: (persisted) => {
        const state = persisted as AppState;
        return {
          ...state,
          projects: (state.projects ?? []).map((p) => ({ ...p, link: p.link ?? "" })),
          documents: (state.documents ?? []).map((d) => ({ ...d, attachment: d.attachment ?? null })),
        };
      },
    }
  )
);
