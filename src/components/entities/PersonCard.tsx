import { Pencil, Trash2, Mail } from "lucide-react";
import type { Person } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PersonCardProps {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}

export function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === person.relatedProjectId));

  return (
    <Card className="group">
      <CardHeader>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {person.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{person.name}</h3>
            {person.role && <p className="truncate text-xs text-muted-foreground">{person.role}</p>}
          </div>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit person">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete person">
            <Trash2 size={14} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {person.email && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> {person.email}
          </p>
        )}
        {person.notes && <p className="mb-2 text-sm text-muted-foreground">{person.notes}</p>}
        <div className="flex flex-wrap items-center gap-1.5">
          {project && <Badge tone="primary">{project.title}</Badge>}
          {person.tags.map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
