import { useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Upload, X, FileUp, AlertTriangle } from "lucide-react";
import type { AppDocument, DocumentType, DocumentAttachment } from "@/types";
import { DOCUMENT_TYPES } from "@/types";
import type { NewDocumentInput } from "@/store/slices/documentsSlice";
import { useAppStore } from "@/store/useAppStore";
import { saveFile, deleteFile } from "@/services/fileStorage";
import { generateId } from "@/utils/id";
import { formatBytes } from "@/utils/bytes";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/Button";

interface DocumentFormProps {
  initial?: AppDocument;
  onSubmit: (input: NewDocumentInput) => void;
  onCancel: () => void;
}

const typeLabel: Record<DocumentType, string> = {
  word: "Word",
  powerpoint: "PowerPoint",
  pdf: "PDF",
  excel: "Excel",
  other: "Other",
};

export function DocumentForm({ initial, onSubmit, onCancel }: DocumentFormProps) {
  const projects = useAppStore((s) => s.projects);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<DocumentType>(initial?.type ?? "word");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [localPath, setLocalPath] = useState(initial?.localPath ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [relatedProjectId, setRelatedProjectId] = useState(initial?.relatedProjectId ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  // Attachment handling is deferred: nothing touches IndexedDB until submit,
  // so cancelling the form never orphans a saved file or loses a removed one.
  const originalAttachment = initial?.attachment ?? null;
  const [attachment, setAttachment] = useState<DocumentAttachment | null>(originalAttachment);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setNewFile(file);
    setAttachment(null);
  };

  const removeAttachment = () => {
    setNewFile(null);
    setAttachment(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let finalAttachment = attachment;

      if (newFile) {
        const fileId = generateId();
        await saveFile(fileId, newFile);
        finalAttachment = {
          fileId,
          fileName: newFile.name,
          fileSize: newFile.size,
          fileType: newFile.type || "application/octet-stream",
        };
      }

      // Clean up the old blob if it was replaced or removed.
      if (originalAttachment && originalAttachment.fileId !== finalAttachment?.fileId) {
        deleteFile(originalAttachment.fileId).catch(() => {});
      }

      onSubmit({
        title: title.trim(),
        type,
        description,
        localPath,
        url,
        relatedProjectId: relatedProjectId || null,
        attachment: finalAttachment,
        tags,
      });
    } catch {
      setError("Couldn't save the file to local storage. It may be too large for your browser's available space.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="project">Related project</Label>
          <Select id="project" value={relatedProjectId} onChange={(e) => setRelatedProjectId(e.target.value)}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <Label>File</Label>
        <input ref={fileInputRef} type="file" onChange={handleFilePick} className="hidden" />
        {newFile ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <FileUp size={15} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{newFile.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(newFile.size)}</span>
            <button type="button" onClick={removeAttachment} className="shrink-0 rounded p-0.5 hover:bg-accent" aria-label="Remove selected file">
              <X size={14} />
            </button>
          </div>
        ) : attachment ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
            <FileUp size={15} className="shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(attachment.fileSize)}</span>
            <button type="button" onClick={removeAttachment} className="shrink-0 rounded p-0.5 hover:bg-accent" aria-label="Remove attachment">
              <X size={14} />
            </button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Upload a file
          </Button>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          Optional — stores the file itself in this browser so you can download it again later.
        </p>
      </div>

      <div>
        <Label htmlFor="localPath">Local path</Label>
        <Input
          id="localPath"
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
          placeholder="C:\Users\...\file.docx"
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add document"}
        </Button>
      </div>
    </form>
  );
}
