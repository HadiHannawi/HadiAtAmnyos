import { Pencil, Trash2, Lightbulb } from "lucide-react";
import type { Idea } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriorityBadge } from "./StatusBadge";

interface IdeaCardProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
}

export function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  return (
    <Card className="group">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-2">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-warning" />
          <h3 className="truncate text-sm font-semibold">{idea.title}</h3>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit idea">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete idea">
            <Trash2 size={14} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {idea.description && <p className="mb-2 text-sm text-muted-foreground">{idea.description}</p>}
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={idea.priority} />
          {idea.category && <Badge tone="default">{idea.category}</Badge>}
          {idea.tags.map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
