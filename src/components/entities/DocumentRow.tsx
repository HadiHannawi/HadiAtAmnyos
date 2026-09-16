import { Pencil, Trash2, ExternalLink, FileText, Presentation, FileSpreadsheet, File, type LucideIcon } from "lucide-react";
import type { AppDocument, DocumentType } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/Badge";

const typeIcon: Record<DocumentType, LucideIcon> = {
  word: FileText,
  pdf: FileText,
  powerpoint: Presentation,
  excel: FileSpreadsheet,
  other: File,
};

interface DocumentRowProps {
  doc: AppDocument;
  onEdit: () => void;
  onDelete: () => void;
}

export function DocumentRow({ doc, onEdit, onDelete }: DocumentRowProps) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === doc.relatedProjectId));
  const Icon = typeIcon[doc.type];

  return (
    <div className="group flex items-start gap-3 rounded-md border border-border bg-card px-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{doc.title}</p>
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Open URL"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        {doc.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{doc.description}</p>}
        {doc.localPath && <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.localPath}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="default">{doc.type}</Badge>
          {project && <Badge tone="primary">{project.title}</Badge>}
          {doc.tags.map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit document">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete document">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
