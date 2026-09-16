import { useAppStore } from "@/store/useAppStore";
import { useUiStore, type Theme } from "@/store/uiStore";
import type { Project, Task, AppDocument, Meeting, Idea, Person, BaseEntity } from "@/types";

// Bumped whenever the shape of BackupData or BackupSettings changes.
// importData.ts's migration chain walks a backup's schemaVersion up to this
// number before trusting it — see the `migrations` map there.
export const CURRENT_SCHEMA_VERSION = 1;

export interface BackupData {
  projects: Project[];
  tasks: Task[];
  documents: AppDocument[];
  meetings: Meeting[];
  ideas: Idea[];
  people: Person[];
}

export interface BackupSettings {
  theme: Theme;
}

/**
 * The full shape of a `.json` backup file. This is the entire contract
 * between "what Hadi OS exports" and "what Hadi OS can import" — everything
 * needed to reconstruct the workspace on another machine lives in here.
 */
export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  settings: BackupSettings;
  data: BackupData;
  /** Unique tags across every entity, included for human-readability when
   *  inspecting a backup file — on import, tags are restored implicitly
   *  because each entity already carries its own `tags` array. */
  tags: string[];
}

function collectTags(data: BackupData): string[] {
  const lists: BaseEntity[][] = [
    data.projects,
    data.tasks,
    data.documents,
    data.meetings,
    data.ideas,
    data.people,
  ];
  const set = new Set<string>();
  for (const list of lists) {
    for (const entity of list) {
      for (const tag of entity.tags) set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function buildBackupPayload(): BackupPayload {
  const { projects, tasks, documents, meetings, ideas, people } = useAppStore.getState();
  const data: BackupData = { projects, tasks, documents, meetings, ideas, people };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: { theme: useUiStore.getState().theme },
    data,
    tags: collectTags(data),
  };
}

export function backupFileName(date = new Date()): string {
  return `hadi-os-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function serializeBackup(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup(): void {
  const json = serializeBackup(buildBackupPayload());
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFileName();
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyBackupToClipboard(): Promise<void> {
  await navigator.clipboard.writeText(serializeBackup(buildBackupPayload()));
}
