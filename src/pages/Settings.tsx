import { useRef, useState, type ChangeEvent } from "react";
import { Download, Copy, Upload, ClipboardPaste, Check, AlertTriangle, Moon, Sun, Sparkles, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/uiStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { downloadBackup, copyBackupToClipboard } from "@/utils/exportData";
import { validateBackup, validateBackupFile, restoreBackup, type ValidationResult } from "@/utils/importData";
import type { BackupPayload } from "@/utils/exportData";
import { loadSampleData } from "@/services/sampleData";
import { formatDateTime } from "@/utils/date";

type PendingImport = { payload: BackupPayload; source: "file" | "paste" };
type CopyStatus = "idle" | "copied" | "error";

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
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteErrors, setPasteErrors] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await copyBackupToClipboard();
      setCopyStatus("copied");
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
    setPending({ payload: result.payload, source });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await validateBackupFile(file);
    applyResult(result, "file");
  };

  const handlePasteImport = () => {
    if (!pasteValue.trim()) {
      setPasteErrors(["Paste a backup JSON first."]);
      return;
    }
    applyResult(validateBackup(pasteValue), "paste");
  };

  const confirmRestore = () => {
    if (!pending) return;
    restoreBackup(pending.payload);
    setRestoredAt(new Date().toISOString());
    setPasteValue("");
    setPending(null);
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
            <p className="mt-1 text-xs text-muted-foreground">Everything below lives only in this browser's LocalStorage.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-6">
            {Object.entries(counts).map(([key, value]) => (
              <div key={key} className="rounded-md bg-muted px-3 py-2">
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
              Move your workspace between machines — export a JSON file here, import it on another browser.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Export</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={downloadBackup}>
                <Download size={14} /> Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copyStatus === "copied" ? <Check size={14} /> : <Copy size={14} />}
                {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy JSON"}
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
              placeholder='{"schemaVersion": 1, ...}'
              className="min-h-[120px] font-mono text-xs"
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={handlePasteImport}>
              <ClipboardPaste size={14} /> Import JSON Text
            </Button>
            <ErrorList errors={pasteErrors} />
          </div>

          {restoredAt && (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <Check size={14} /> Workspace restored at {formatDateTime(restoredAt)}
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

      <ConfirmDialog
        open={!!pending}
        title="Restore workspace"
        description={
          pendingCounts && (
            <div className="space-y-2">
              <p>
                This replaces your <strong>entire current workspace</strong> with the {pending?.source === "file" ? "imported file" : "pasted"} backup
                {pending?.payload.exportedAt ? ` (exported ${formatDateTime(pending.payload.exportedAt)})` : ""}. This can't be undone.
              </p>
              <ul className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                <li>{pendingCounts.projects} projects</li>
                <li>{pendingCounts.tasks} tasks</li>
                <li>{pendingCounts.documents} documents</li>
                <li>{pendingCounts.meetings} meetings</li>
                <li>{pendingCounts.ideas} ideas</li>
                <li>{pendingCounts.people} people</li>
              </ul>
            </div>
          )
        }
        confirmLabel="Replace workspace"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={confirmRestore}
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
