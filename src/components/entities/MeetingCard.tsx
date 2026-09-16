import { Pencil, Trash2, CalendarDays } from "lucide-react";
import type { Meeting } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/date";

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: () => void;
  onDelete: () => void;
}

export function MeetingCard({ meeting, onEdit, onDelete }: MeetingCardProps) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === meeting.relatedProjectId));
  const toggleMeetingAction = useAppStore((s) => s.toggleMeetingAction);
  const doneCount = meeting.actions.filter((a) => a.done).length;

  return (
    <Card className="group">
      <CardHeader>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays size={13} />
            {formatDate(meeting.date)}
          </div>
          <h3 className="mt-1 truncate text-sm font-semibold">{meeting.title}</h3>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit meeting">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete meeting">
            <Trash2 size={14} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {meeting.notes && <p className="mb-2 whitespace-pre-wrap text-sm text-muted-foreground">{meeting.notes}</p>}

        {meeting.actions.length > 0 && (
          <div className="mb-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Actions ({doneCount}/{meeting.actions.length})
            </p>
            <ul className="space-y-1">
              {meeting.actions.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={a.done}
                    onChange={() => toggleMeetingAction(meeting.id, a.id)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className={a.done ? "text-muted-foreground line-through" : ""}>{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {project && <Badge tone="primary">{project.title}</Badge>}
          {meeting.tags.map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
