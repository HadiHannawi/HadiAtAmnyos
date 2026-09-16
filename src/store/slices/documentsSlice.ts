import type { StateCreator } from "zustand";
import type { AppDocument, DocumentType } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";

export interface NewDocumentInput {
  title: string;
  type: DocumentType;
  description: string;
  localPath: string;
  url: string;
  relatedProjectId: string | null;
  tags: string[];
}

export interface DocumentsSlice {
  documents: AppDocument[];
  addDocument: (input: NewDocumentInput) => AppDocument;
  updateDocument: (id: string, patch: Partial<NewDocumentInput>) => void;
  deleteDocument: (id: string) => void;
}

export const createDocumentsSlice: StateCreator<AppState, [], [], DocumentsSlice> = (set) => ({
  documents: [],

  addDocument: (input) => {
    const now = new Date().toISOString();
    const document: AppDocument = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    set((state) => ({ documents: [document, ...state.documents] }));
    return document;
  },

  updateDocument: (id, patch) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      projects: state.projects.map((p) => ({
        ...p,
        relatedDocumentIds: p.relatedDocumentIds.filter((docId) => docId !== id),
      })),
    }));
  },
});
