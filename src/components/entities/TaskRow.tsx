import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/Badge";
import { PriorityBadge } from "./StatusBadge";
import { formatDate, isOverdue } from "@/utils/date";
import { cn } from "@/utils/cn";

interface TaskRowProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);
  const project = useAppStore((s) => s.projects.find((p) => p.id === task.relatedProjectId));
  const overdue = task.status !== "done" && isOverdue(task.dueDate);

  return (
    <div className="group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5">
      <input
        type="checkbox"
        checked={task.status === "done"}
        onChange={() => toggleTaskDone(task.id)}
        className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
        aria-label={`Mark "${task.title}" done`}
      />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <Badge tone={overdue ? "destructive" : "muted"}>{overdue ? "Overdue " : ""}{formatDate(task.dueDate)}</Badge>
          )}
          {project && <Badge tone="primary">{project.title}</Badge>}
          {task.tags.map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit task">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete task">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
