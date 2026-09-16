import { useState, type FormEvent } from "react";
import type { AppDocument, DocumentType } from "@/types";
import { DOCUMENT_TYPES } from "@/types";
import type { NewDocumentInput } from "@/store/slices/documentsSlice";
import { useAppStore } from "@/store/useAppStore";
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

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<DocumentType>(initial?.type ?? "word");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [localPath, setLocalPath] = useState(initial?.localPath ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [relatedProjectId, setRelatedProjectId] = useState(initial?.relatedProjectId ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      type,
      description,
      localPath,
      url,
      relatedProjectId: relatedProjectId || null,
      tags,
    });
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

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {initial ? "Save changes" : "Add document"}
        </Button>
      </div>
    </form>
  );
}
