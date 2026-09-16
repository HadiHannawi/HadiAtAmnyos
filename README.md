# Hadi OS

A personal work operating system for organizing projects, tasks, documents, meetings, ideas and people at Amnyos. Runs entirely in your browser — no backend, no database, no account. Everything is saved to your browser's LocalStorage.

## Quick start

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. Build for production with `npm run build` (output goes to `dist/`).

## Stack, and why

| Choice | Why |
|---|---|
| **Vite** | Instant dev server + a static `dist/` build with zero server code — exactly what a backend-less app deploys as. |
| **React + TypeScript** | Requested stack; TypeScript catches shape mismatches across the six entity types before they become runtime bugs. |
| **Tailwind CSS** | Utility classes keep styling co-located with markup — no separate CSS files to keep in sync as components change. |
| **Zustand** | A `useAppStore()` hook with no Provider wrapper, no boilerplate reducers/actions/dispatch — a good fit for one person's app state. Its `persist` middleware is *why* LocalStorage sync required zero custom code. |
| **lucide-react** | Icon set; tree-shakes to just the icons actually imported. |
| **clsx** | Tiny helper for conditional Tailwind classes (`cn()` in `utils/`) — avoids string-concatenation bugs in components with many style states. |
| **react-router-dom** | Client-side routing for a single-page app — `/projects/:id` needs to work without a server. |

No backend framework, ORM, or auth library — the brief was explicit that none of this should exist, and a real second brain shouldn't need a login screen between you and your own notes.

## Architecture

```
src/
  types/        Domain model — Project, Task, AppDocument, Meeting, Idea, Person.
                 Every other layer is built on these six shapes.
  store/        Zustand slices (one file per entity) combined into one
                 persisted store. Also uiStore.ts for theme, kept separate
                 from data on purpose (see below).
  services/     Talks to something outside the store: sampleData.ts seeds a
                 demo workspace.
  utils/        Pure functions — exportData.ts/importData.ts (backup),
                 id.ts, date.ts, cn.ts.
  hooks/        useSearch.ts — the one piece of cross-cutting logic (global
                 search spans all six entities).
  components/
    ui/         Generic, content-agnostic primitives (Button, Card, Modal,
                 Input...) — none of them know what a "Project" is.
    entities/   Domain components — ProjectForm, TaskRow, etc. — each one
                 does know about a specific entity type.
    layout/     Sidebar, Topbar, AppShell — the chrome around every page.
    search/     GlobalSearch — the search dropdown in the topbar.
  pages/        One file per route, composed from the above.
```

**Why slices, not one big reducer:** each entity (`projectsSlice.ts`, `tasksSlice.ts`, ...) owns its own state and CRUD actions, but all six are typed against one combined `AppState` (`store/types.ts`). That's what lets `deleteProject` reach into `tasks`/`documents`/`meetings`/`people` to clear dangling `relatedProjectId` references in the same `set()` call, without the slice files importing each other.

**Why theme lives in a separate store (`uiStore.ts`):** it's a browser preference, not workspace data. Keeping it out of `useAppStore` means a backup export is exactly "your projects and tasks," not "your projects, tasks, and which color scheme you happened to have on."

**Why `ui/` and `entities/` are split:** `ui/` components are reused by every entity and could be lifted into a design-system package tomorrow. `entities/` components encode business rules (a Project has a `status`; a Task doesn't) and would need to change if the data model changes. Mixing them would make neither reusable.

## Persistence

`useAppStore` is wrapped in Zustand's `persist` middleware, which mirrors every state change to `localStorage["hadi-os:data"]` as JSON. There's no explicit "save" step — creating, editing or deleting anything writes through automatically, and a page refresh rehydrates from that same key.

Because everything lives in one browser's storage, it disappears if you clear site data or switch browsers/machines. That's what Backup & Restore (below) is for.

## Backup & Restore

**Where:** Settings → Backup & Restore.

**Export flow** (`src/utils/exportData.ts`): `buildBackupPayload()` reads the six entity arrays out of `useAppStore` plus the current theme out of `uiStore`, and wraps them in:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-09-16T...",
  "settings": { "theme": "dark" },
  "data": { "projects": [...], "tasks": [...], "documents": [...], "meetings": [...], "ideas": [...], "people": [...] },
  "tags": ["Azure", "Client", ...]
}
```
`tags` is a computed, de-duplicated list across all entities — included for readability when you open the file, not needed for restore, since every entity already carries its own `tags` array.

- **Export JSON** downloads this as `hadi-os-backup-YYYY-MM-DD.json`.
- **Copy JSON** puts the same content on the clipboard, for pasting directly into another machine's "Import JSON Text" box without a file transfer at all.

**Restore flow** (`src/utils/importData.ts`): both **Import JSON File** and **Import JSON Text** call `validateBackup()`, which:
1. Confirms the input is valid JSON and has the expected `schemaVersion` / `data` shape (each `data.*` key must be an array if present) — anything else surfaces as a specific error message rather than a crash.
2. Runs the result through `migrate()`, which walks a `migrations` map from the backup's `schemaVersion` up to `CURRENT_SCHEMA_VERSION`. Today that map is empty because schema v1 is the only version that has ever existed; when the shape changes in the future, a `1: migrateV1toV2` entry gets added there and old backups keep importing.

If validation passes, a confirmation modal shows exactly what will be replaced (counts per entity, and the backup's export date) before anything touches the store — restoring is a full overwrite of the current workspace, so it's the one destructive action in the app that asks first. Confirming calls `restoreBackup()`, which replaces the six arrays via `useAppStore.setState()` and applies the backup's saved theme.

**How to use it to move machines:** on the old machine, Settings → Export JSON (or Copy JSON). On the new machine, `npm install && npm run dev`, open Settings, and either drop the file on Import JSON File or paste the copied text into Import JSON Text. Confirm the restore, and the workspace — projects, tasks, documents, meetings, ideas, people — matches the export exactly.

## Deploying to Netlify

`netlify.toml` is already set up: build command `npm run build`, publish directory `dist`, and a catch-all redirect to `index.html` (needed because this is a client-routed SPA — without it, refreshing on `/projects` would 404 on Netlify's server, since no such file exists on disk).

Connect the repo in Netlify and it deploys with no further configuration.

## What's intentionally not here

No backend, API, database, or auth — per the brief, this is a single-user, browser-only tool. "Documents" are references (title, path, URL) that Hadi OS tracks but never opens; it doesn't need file-system or cloud-storage access to do that.
