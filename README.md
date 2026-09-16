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
| **tailwindcss-animate** | Build-time Tailwind plugin (no runtime JS) for the modal/dropdown entrance animations — matches shadcn's usual pairing. |

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
                 demo workspace, fileStorage.ts owns IndexedDB (uploaded
                 document bytes).
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

## Uploaded files (IndexedDB)

A Document's "Upload a file" field stores the actual bytes, not just a reference — but not in `localStorage`. LocalStorage is ~5-10MB total and synchronous, a poor fit for binary files; IndexedDB has no such practical limit and stores `Blob`s natively, so `src/services/fileStorage.ts` wraps it directly (no dependency — the whole wrapper is ~50 lines: `saveFile`/`getFile`/`deleteFile`/`downloadFile`).

The document entity itself only keeps a pointer: `attachment: { fileId, fileName, fileSize, fileType }`. Deleting a document deletes its blob too (`documentsSlice.ts`'s `deleteDocument`), so removing documents doesn't silently leak storage over time.

## Backup & Restore

**Where:** Settings → Backup & Restore.

**Export flow** (`src/utils/exportData.ts`): `buildBackupPayload()` reads the six entity arrays out of `useAppStore`, the current theme out of `uiStore`, and every uploaded file's bytes out of IndexedDB (base64-encoded), and wraps them in:

```json
{
  "schemaVersion": 2,
  "exportedAt": "2026-09-16T...",
  "settings": { "theme": "dark" },
  "data": { "projects": [...], "tasks": [...], "documents": [...], "meetings": [...], "ideas": [...], "people": [...] },
  "tags": ["Azure", "Client", ...],
  "files": [{ "id": "...", "name": "Landing Zone.pptx", "type": "application/...", "size": 48213, "data": "<base64>" }]
}
```
`tags` is a computed, de-duplicated list across all entities — included for readability when you open the file, not needed for restore, since every entity already carries its own `tags` array. `files` is what makes uploaded documents survive a move between machines, not just their metadata.

- **Export JSON** downloads this as `hadi-os-backup-YYYY-MM-DD.json`.
- **Copy JSON** puts the same content on the clipboard, for pasting directly into another machine's "Import JSON Text" box without a file transfer at all (fine for small workspaces; a workspace with large uploaded files is better moved as a file, since clipboard limits vary by OS).

**Import flow** (`src/utils/importData.ts`): both **Import JSON File** and **Import JSON Text** call `validateBackup()`, which checks the JSON shape, then runs it through `migrate()` — a chain that walks a backup's `schemaVersion` up to `CURRENT_SCHEMA_VERSION` (today's `1 → 2` entry back-fills the `link`/`attachment` fields older backups won't have). If that passes, a modal shows what the backup contains and offers two paths:

- **Merge (default)** — adds the backup's entities *on top of* the current workspace (`mergeBackup()`), rather than replacing it. An entity is a "duplicate" when its `id` already exists locally — the natural case when the same backup, or an overlapping one, gets imported more than once. If any are found, you pick what happens to them:
  - **Skip duplicates** — keep the local version, discard the incoming one.
  - **Replace duplicates** — the incoming version overwrites the local one.
  - **Keep both** — the incoming item is added as a separate entry with a freshly generated id.

  Items with no id collision are always added, regardless of which option you pick. Merge never touches the theme setting — importing data shouldn't silently flip your color scheme.
- **Replace entire workspace instead** — the old, fully-destructive path: wipes the current workspace and replaces it exactly with the backup (data *and* theme). Still gated by its own confirmation, since it's the one irreversible action reachable from this screen.

**How to use it to move machines:** on the old machine, Settings → Export JSON (or Copy JSON). On the new machine, `npm install && npm run dev`, open Settings, and either drop the file on Import JSON File or paste the copied text into Import JSON Text — then choose Merge (safe to import repeatedly) or Replace (start exactly from the backup).

## Deploying to Netlify

`netlify.toml` is already set up: build command `npm run build`, publish directory `dist`, and a catch-all redirect to `index.html` (needed because this is a client-routed SPA — without it, refreshing on `/projects` would 404 on Netlify's server, since no such file exists on disk).

Connect the repo in Netlify and it deploys with no further configuration.

## What's intentionally not here

No backend, API, database, or auth — per the brief, this is a single-user, browser-only tool. A Document's local path and URL fields are just references Hadi OS tracks but never opens; an *uploaded* file's bytes live in this browser's IndexedDB (see above) rather than anywhere it doesn't need to be — no cloud storage involved.
