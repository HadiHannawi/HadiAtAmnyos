// Central domain model for Hadi OS. Every entity is plain, JSON-serializable
// data — that's what lets the whole store round-trip through LocalStorage
// with zero transformation logic.

export type Priority = "low" | "medium" | "high";

export type ProjectStatus = "idea" | "in-progress" | "waiting" | "done";
export const PROJECT_STATUSES: ProjectStatus[] = ["idea", "in-progress", "waiting", "done"];

export type TaskStatus = "todo" | "doing" | "done";
export const TASK_STATUSES: TaskStatus[] = ["todo", "doing", "done"];

export type DocumentType = "word" | "powerpoint" | "pdf" | "excel" | "other";
export const DOCUMENT_TYPES: DocumentType[] = ["word", "powerpoint", "pdf", "excel", "other"];

/** Fields every entity shares — gives search and list views a common shape to rely on. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  notes: string;
  relatedDocumentIds: string[];
}

// Named AppDocument, not Document, to avoid shadowing the DOM's global `Document`.
export interface AppDocument extends BaseEntity {
  title: string;
  type: DocumentType;
  description: string;
  localPath: string;
  url: string;
  relatedProjectId: string | null;
}

export interface MeetingAction {
  id: string;
  text: string;
  done: boolean;
}

export interface Meeting extends BaseEntity {
  title: string;
  date: string; // ISO date
  notes: string;
  relatedProjectId: string | null;
  actions: MeetingAction[];
}

export interface Idea extends BaseEntity {
  title: string;
  description: string;
  category: string;
  priority: Priority;
}

export interface Task extends BaseEntity {
  title: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  relatedProjectId: string | null;
}

export interface Person extends BaseEntity {
  name: string;
  role: string;
  email: string;
  notes: string;
  relatedProjectId: string | null;
}

export type EntityKind = "project" | "task" | "document" | "meeting" | "idea" | "person";

export interface SearchResult {
  kind: EntityKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}
