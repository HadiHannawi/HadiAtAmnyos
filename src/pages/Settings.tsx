import { useRef, useState, type ChangeEvent } from "react";
import {
  Download,
  Copy,
  Upload,
  ClipboardPaste,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Sparkles,
  Trash2,
  SkipForward,
  Replace,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/uiStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea, Label } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { downloadBackup, copyBackupToClipboard, type BackupPayload } from "@/utils/exportData";
import {
  validateBackup,
  validateBackupFile,
  restoreBackup,
  previewMerge,
  mergeBackup,
  type ValidationResult,
  type MergePreview,
  type DuplicateStrategy,
} from "@/utils/importData";
import { loadSampleData } from "@/services/sampleData";
import { formatDateTime } from "@/utils/date";

type PendingImport = { payload: BackupPayload; preview: MergePreview; source: "file" | "paste" };
type Status = "idle" | "busy" | "done" | "error";

const entityLabel: Record<string, string> = {
  projects: "projects",
  tasks: "tasks",
  documents: "documents",
  meetings: "meetings",
  ideas: "ideas",
  people: "people",
};

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      <ul className="list-disc space-y-0.5 pl-4">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Settings() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const counts = useAppStore((s) => ({
    projects: s.projects.length,
    tasks: s.tasks.length,
    documents: s.documents.length,
    meetings: s.meetings.length,
    ideas: s.ideas.length,
    people: s.people.length,
  }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportStatus, setExportStatus] = useState<Status>("idle");
  const [copyStatus, setCopyStatus] = useState<Status>("idle");
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteErrors, setPasteErrors] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const handleExport = async () => {
    setExportStatus("busy");
    try {
      await downloadBackup();
      setExportStatus("idle");
    } catch {
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 3000);
    }
  };

  const handleCopy = async () => {
    setCopyStatus("busy");
    try {
      await copyBackupToClipboard();
      setCopyStatus("done");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
    }
  };

  const applyResult = (result: ValidationResult, source: "file" | "paste") => {
    if (!result.valid || !result.payload) {
      if (source === "file") setFileErrors(result.errors);
      else setPasteErrors(result.errors);
      return;
    }
    if (source === "file") setFileErrors([]);
    else setPasteErrors([]);
    setResultMessage(null);
    setPending({ payload: result.payload, preview: previewMerge(result.payload), source });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    applyResult(await validateBackupFile(file), "file");
  };

  const handlePasteImport = () => {
    if (!pasteValue.trim()) {
      setPasteErrors(["Paste a backup JSON first."]);
      return;
    }
    applyResult(validateBackup(pasteValue), "paste");
  };

  const closeImport = () => {
    setPending(null);
    setPasteValue("");
  };

  const handleMerge = async (strategy: DuplicateStrategy) => {
    if (!pending) return;
    setImportBusy(true);
    await mergeBackup(pending.payload, strategy);
    setImportBusy(false);
    setResultMessage(`Added ${pending.preview.totalNew + pending.preview.totalDuplicates} items to your workspace.`);
    closeImport();
  };

  const handleReplace = async () => {
    if (!pending) return;
    setImportBusy(true);
    await restoreBackup(pending.payload);
    setImportBusy(false);
    setResultMessage("Workspace replaced with the imported backup.");
    setReplaceConfirmOpen(false);
    closeImport();
  };

  const pendingCounts = pending
    ? {
        projects: pending.payload.data.projects.length,
        tasks: pending.payload.data.tasks.length,
        documents: pending.payload.data.documents.length,
        meetings: pending.payload.data.meetings.length,
        ideas: pending.payload.data.ideas.length,
        people: pending.payload.data.people.length,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Appearance and data for your workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Appearance</h2>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold">Workspace</h2>
            <p className="mt-1 text-xs text-muted-foreground">Everything below lives only in this browser's storage.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-6">
            {Object.entries(counts).map(([key, value]) => (
              <div key={key} className="rounded-md bg-muted px-3 py-2.5 transition-colors hover:bg-accent">
                <p className="text-base font-semibold">{value}</p>
                <p className="text-xs capitalize text-muted-foreground">{key}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold">Backup &amp; Restore</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Move your workspace between machines — export a JSON file here (uploaded files included), import it on another browser.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Export</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleExport} disabled={exportStatus === "busy"}>
                <Download size={14} /> {exportStatus === "busy" ? "Preparing…" : "Export JSON"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={copyStatus === "busy"}>
                {copyStatus === "done" ? <Check size={14} /> : <Copy size={14} />}
                {copyStatus === "busy" ? "Copying…" : copyStatus === "done" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy JSON"}
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Import from file</p>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Import JSON File
            </Button>
            <ErrorList errors={fileErrors} />
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Import from pasted text</p>
            <Label htmlFor="paste">Paste backup JSON</Label>
            <Textarea
              id="paste"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder='{"schemaVersion": 2, ...}'
              className="min-h-[120px] font-mono text-xs"
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={handlePasteImport}>
              <ClipboardPaste size={14} /> Import JSON Text
            </Button>
            <ErrorList errors={pasteErrors} />
          </div>

          {resultMessage && (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <Check size={14} /> {resultMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Danger zone</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">Load sample workspace</p>
            <p className="text-xs text-muted-foreground">Adds a few example projects, tasks and documents.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadSampleData()}>
            <Sparkles size={14} /> Load sample data
          </Button>
        </CardContent>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm">Clear all data</p>
            <p className="text-xs text-muted-foreground">Permanently erases everything in this workspace.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setClearOpen(true)}>
            <Trash2 size={14} /> Clear workspace
          </Button>
        </CardContent>
      </Card>

      <Modal open={!!pending} onClose={closeImport} title="Import backup" wide>
        {pending && pendingCounts && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Backup from {formatDateTime(pending.payload.exportedAt)} — {pending.preview.totalNew + pending.preview.totalDuplicates} items total.
            </p>

            <ul className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {Object.entries(pendingCounts).map(([key, value]) => (
                <li key={key}>
                  {value} {entityLabel[key]}
                </li>
              ))}
            </ul>

            {pending.preview.totalDuplicates > 0 ? (
              <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm">
                <p className="flex items-center gap-1.5 font-medium text-warning">
                  <AlertTriangle size={14} /> {pending.preview.totalDuplicates} item{pending.preview.totalDuplicates === 1 ? "" : "s"} already in your workspace
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pending.preview.totalNew} new item{pending.preview.totalNew === 1 ? "" : "s"} will be added either way. Choose what happens to the duplicates:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={importBusy} onClick={() => handleMerge("skip")}>
                    <SkipForward size={13} /> Skip duplicates
                  </Button>
                  <Button size="sm" variant="outline" disabled={importBusy} onClick={() => handleMerge("replace")}>
                    <Replace size={13} /> Replace duplicates
                  </Button>
                  <Button size="sm" variant="outline" disabled={importBusy} onClick={() => handleMerge("keep-both")}>
                    <Layers size={13} /> Keep both
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" disabled={importBusy} onClick={() => handleMerge("skip")}>
                {importBusy ? "Importing…" : `Add ${pending.preview.totalNew} item${pending.preview.totalNew === 1 ? "" : "s"} to workspace`}
              </Button>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setReplaceConfirmOpen(true)}
                className="text-xs text-destructive hover:underline"
              >
                Replace entire workspace instead
              </button>
              <Button variant="ghost" size="sm" onClick={closeImport} disabled={importBusy}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={replaceConfirmOpen}
        title="Replace entire workspace"
        description={
          pendingCounts && (
            <div className="space-y-2">
              <p>
                This deletes everything currently in your workspace and replaces it with the{" "}
                {pending?.source === "file" ? "imported file" : "pasted"} backup. This can't be undone.
              </p>
            </div>
          )
        }
        confirmLabel="Replace workspace"
        destructive
        onCancel={() => setReplaceConfirmOpen(false)}
        onConfirm={handleReplace}
      />

      <ConfirmDialog
        open={clearOpen}
        title="Clear workspace"
        description="This permanently deletes every project, task, document, meeting, idea and person in this browser. This can't be undone."
        confirmLabel="Clear everything"
        destructive
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          useAppStore.setState({
            projects: [],
            tasks: [],
            documents: [],
            meetings: [],
            ideas: [],
            people: [],
          });
          setClearOpen(false);
        }}
      />
    </div>
  );
}
