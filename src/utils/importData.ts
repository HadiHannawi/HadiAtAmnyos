import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/uiStore";
import { CURRENT_SCHEMA_VERSION, type BackupData, type BackupPayload } from "./exportData";

const DATA_KEYS = ["projects", "tasks", "documents", "meetings", "ideas", "people"] as const;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  payload?: BackupPayload;
}

/**
 * Migration chain: each entry migrates a payload FROM that key's schema
 * version to the next one. Empty today because schema v1 is all that has
 * ever existed — when the shape changes, add e.g. `1: migrateV1toV2` and
 * bump CURRENT_SCHEMA_VERSION in exportData.ts. `migrate()` below walks the
 * chain automatically, so older backups keep importing after future changes.
 */
type Migration = (payload: BackupPayload) => BackupPayload;
const migrations: Record<number, Migration> = {};

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

/** Replaces the entire workspace with the given backup. Irreversible — callers must confirm with the user first. */
export function restoreBackup(payload: BackupPayload): void {
  useAppStore.setState({ ...payload.data });
  useUiStore.setState({ theme: payload.settings.theme });
  useUiStore.getState().applyTheme();
}
