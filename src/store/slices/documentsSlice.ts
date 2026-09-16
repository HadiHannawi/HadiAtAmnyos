import type { StateCreator } from "zustand";
import type { AppDocument, DocumentType, DocumentAttachment } from "@/types";
import type { AppState } from "../types";
import { generateId } from "@/utils/id";
import { deleteFile } from "@/services/fileStorage";

export interface NewDocumentInput {
  title: string;
  type: DocumentType;
  description: string;
  localPath: string;
  url: string;
  relatedProjectId: string | null;
  attachment: DocumentAttachment | null;
  tags: string[];
}

export interface DocumentsSlice {
  documents: AppDocument[];
  addDocument: (input: NewDocumentInput) => AppDocument;
  updateDocument: (id: string, patch: Partial<NewDocumentInput>) => void;
  deleteDocument: (id: string) => void;
}

export const createDocumentsSlice: StateCreator<AppState, [], [], DocumentsSlice> = (set, get) => ({
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

  // Best-effort: also frees the attachment's bytes out of IndexedDB so
  // deleting a document doesn't silently leak storage forever.
  deleteDocument: (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (doc?.attachment) {
      deleteFile(doc.attachment.fileId).catch(() => {});
    }
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      projects: state.projects.map((p) => ({
        ...p,
        relatedDocumentIds: p.relatedDocumentIds.filter((docId) => docId !== id),
      })),
    }));
  },
});
