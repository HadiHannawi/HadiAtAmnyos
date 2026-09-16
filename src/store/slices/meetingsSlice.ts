import type { StateCreator } from "zustand";
import type { Meeting, MeetingAction } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewMeetingInput {
  title: string;
  date: string;
  notes: string;
  relatedProjectId: string | null;
  actions: MeetingAction[];
  tags: string[];
}

export interface MeetingsSlice {
  meetings: Meeting[];
  addMeeting: (input: NewMeetingInput) => Meeting;
  updateMeeting: (id: string, patch: Partial<NewMeetingInput>) => void;
  deleteMeeting: (id: string) => void;
  toggleMeetingAction: (meetingId: string, actionId: string) => void;
}

export const createMeetingsSlice: StateCreator<AppState, [], [], MeetingsSlice> = (set) => ({
  meetings: [],

  addMeeting: (input) => {
    const now = new Date().toISOString();
    const meeting: Meeting = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ meetings: [meeting, ...state.meetings] }));
    return meeting;
  },

  updateMeeting: (id, patch) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },

  deleteMeeting: (id) => {
    set((state) => ({ meetings: state.meetings.filter((m) => m.id !== id) }));
  },

  toggleMeetingAction: (meetingId, actionId) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              actions: m.actions.map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
    }));
  },
});
