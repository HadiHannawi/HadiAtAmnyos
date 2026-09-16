import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/uiStore";
import { saveFile, deleteFile, base64ToBlob } from "@/services/fileStorage";
import { generateId } from "@/utils/id";
import type { BaseEntity } from "@/types";
import { CURRENT_SCHEMA_VERSION, type BackupData, type BackupPayload, type BackupFileEntry } from "./exportData";

const DATA_KEYS = ["projects", "tasks", "documents", "meetings", "ideas", "people"] as const;
type DataKey = (typeof DATA_KEYS)[number];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  payload?: BackupPayload;
}

/**
 * Migration chain: each entry migrates a payload FROM that key's schema
 * version to the next one. `migrate()` below walks the chain automatically,
 * so an old backup keeps importing after the shape changes — add a new
 * entry here (and bump CURRENT_SCHEMA_VERSION in exportData.ts) whenever
 * BackupData's shape changes again.
 */
type Migration = (payload: BackupPayload) => BackupPayload;
const migrations: Record<number, Migration> = {
  // v1 -> v2: Project gained `link`, AppDocument gained `attachment`.
  1: (payload) => ({
    ...payload,
    schemaVersion: 2,
    data: {
      ...payload.data,
      projects: payload.data.projects.map((p) => ({ ...p, link: p.link ?? "" })),
      documents: payload.data.documents.map((d) => ({ ...d, attachment: d.attachment ?? null })),
    },
  }),
};

function migrate(payload: BackupPayload): BackupPayload {
  let current = payload;

  if (current.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `This backup was made with a newer version of Hadi OS (schema v${current.schemaVersion}). ` +
        `Update the app before importing it.`
    );
  }

  while (current.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const step = migrations[current.schemaVersion];
    if (!step) {
      throw new Error(`Don't know how to migrate a backup from schema version ${current.schemaVersion}.`);
    }
    current = step(current);
  }

  return current;
}

/** Fills in any missing fields with safe defaults so older/partial backups still import. */
function normalize(obj: Record<string, unknown>): BackupPayload {
  const rawData = (obj.data ?? {}) as Record<string, unknown>;
  const data: BackupData = {
    projects: Array.isArray(rawData.projects) ? (rawData.projects as BackupData["projects"]) : [],
    tasks: Array.isArray(rawData.tasks) ? (rawData.tasks as BackupData["tasks"]) : [],
    documents: Array.isArray(rawData.documents) ? (rawData.documents as BackupData["documents"]) : [],
    meetings: Array.isArray(rawData.meetings) ? (rawData.meetings as BackupData["meetings"]) : [],
    ideas: Array.isArray(rawData.ideas) ? (rawData.ideas as BackupData["ideas"]) : [],
    people: Array.isArray(rawData.people) ? (rawData.people as BackupData["people"]) : [],
  };

  const rawSettings = (obj.settings ?? {}) as Record<string, unknown>;
  const theme = rawSettings.theme === "dark" ? "dark" : "light";

  return {
    schemaVersion: obj.schemaVersion as number,
    exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
    settings: { theme },
    data,
    tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
    files: Array.isArray(obj.files) ? (obj.files as BackupFileEntry[]) : [],
  };
}

/** Structural validation only — cheap checks that catch "wrong file" or "hand-edited JSON gone wrong" before we touch the store. */
export function validateBackup(raw: string): ValidationResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { valid: false, errors: ["That's not valid JSON."] };
  }

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, errors: ["A backup must be a JSON object, not an array or primitive."] };
  }

  const obj = json as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof obj.schemaVersion !== "number") {
    errors.push('Missing or invalid "schemaVersion" field.');
  }
  if (obj.data === undefined) {
    errors.push('Missing "data" field.');
  } else if (typeof obj.data !== "object" || obj.data === null || Array.isArray(obj.data)) {
    errors.push('"data" must be an object.');
  } else {
    const data = obj.data as Record<string, unknown>;
    for (const key of DATA_KEYS) {
      if (key in data && !Array.isArray(data[key])) {
        errors.push(`"data.${key}" must be an array.`);
      }
    }
  }
  if (obj.files !== undefined && !Array.isArray(obj.files)) {
    errors.push('"files" must be an array.');
  }

  if (errors.length > 0) return { valid: false, errors };

  try {
    const payload = migrate(normalize(obj));
    return { valid: true, errors: [], payload };
  } catch (e) {
    return { valid: false, errors: [e instanceof Error ? e.message : "Could not read this backup."] };
  }
}

export async function validateBackupFile(file: File): Promise<ValidationResult> {
  if (!file.name.toLowerCase().endsWith(".json")) {
    return { valid: false, errors: ["Please select a .json file."] };
  }
  const text = await file.text();
  return validateBackup(text);
}

async function restoreFiles(entries: BackupFileEntry[]): Promise<void> {
  for (const entry of entries) {
    await saveFile(entry.id, base64ToBlob(entry.data, entry.type));
  }
}

/** Replaces the entire workspace with the given backup. Irreversible — callers must confirm with the user first. */
export async function restoreBackup(payload: BackupPayload): Promise<void> {
  const oldDocuments = useAppStore.getState().documents;
  const oldFileIds = new Set(oldDocuments.filter((d) => d.attachment).map((d) => d.attachment!.fileId));
  const newFileIds = new Set(payload.data.documents.filter((d) => d.attachment).map((d) => d.attachment!.fileId));

  useAppStore.setState({ ...payload.data });
  useUiStore.setState({ theme: payload.settings.theme });
  useUiStore.getState().applyTheme();

  await restoreFiles(payload.files);
  for (const id of oldFileIds) {
    if (!newFileIds.has(id)) deleteFile(id).catch(() => {});
  }
}

// ---- Merge import: "adds on top of what's already there" ----

export interface MergePreview {
  newCounts: Record<DataKey, number>;
  duplicateCounts: Record<DataKey, number>;
  totalNew: number;
  totalDuplicates: number;
}

/** A "duplicate" is an incoming entity whose `id` already exists locally — the natural
 *  signal when the same backup (or an overlapping one) gets imported more than once. */
export function previewMerge(payload: BackupPayload): MergePreview {
  const state = useAppStore.getState();
  const newCounts = {} as Record<DataKey, number>;
  const duplicateCounts = {} as Record<DataKey, number>;
  let totalNew = 0;
  let totalDuplicates = 0;

  for (const key of DATA_KEYS) {
    const existingIds = new Set(state[key].map((e) => e.id));
    let fresh = 0;
    let dup = 0;
    for (const item of payload.data[key]) {
      if (existingIds.has(item.id)) dup++;
      else fresh++;
    }
    newCounts[key] = fresh;
    duplicateCounts[key] = dup;
    totalNew += fresh;
    totalDuplicates += dup;
  }

  return { newCounts, duplicateCounts, totalNew, totalDuplicates };
}

export type DuplicateStrategy = "skip" | "replace" | "keep-both";

function mergeList<T extends BaseEntity>(existing: T[], incoming: T[], strategy: DuplicateStrategy): T[] {
  const existingIds = new Set(existing.map((e) => e.id));
  const result = [...existing];

  for (const item of incoming) {
    if (!existingIds.has(item.id)) {
      result.push(item);
      continue;
    }
    if (strategy === "skip") continue; // keep the local version, discard incoming
    if (strategy === "replace") {
      const idx = result.findIndex((e) => e.id === item.id);
      if (idx !== -1) result[idx] = item; // incoming overwrites the local version
      continue;
    }
    result.push({ ...item, id: generateId() }); // keep-both: add as a new, separate entry
  }

  return result;
}

/** Adds the backup's entities on top of the current workspace instead of replacing it.
 *  `strategy` decides what happens to entities whose id already exists locally. Doesn't
 *  touch theme — merging data shouldn't silently flip an unrelated UI preference. */
export async function mergeBackup(payload: BackupPayload, strategy: DuplicateStrategy): Promise<void> {
  const state = useAppStore.getState();

  useAppStore.setState({
    projects: mergeList(state.projects, payload.data.projects, strategy),
    tasks: mergeList(state.tasks, payload.data.tasks, strategy),
    documents: mergeList(state.documents, payload.data.documents, strategy),
    meetings: mergeList(state.meetings, payload.data.meetings, strategy),
    ideas: mergeList(state.ideas, payload.data.ideas, strategy),
    people: mergeList(state.people, payload.data.people, strategy),
  });

  await restoreFiles(payload.files);
}
