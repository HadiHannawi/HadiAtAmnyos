import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import type { Meeting, MeetingAction } from "@/types";
import type { NewMeetingInput } from "@/store/slices/meetingsSlice";
import { useAppStore } from "@/store/useAppStore";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "./TagInput";
import { generateId } from "@/utils/id";

interface MeetingFormProps {
  initial?: Meeting;
  onSubmit: (input: NewMeetingInput) => void;
  onCancel: () => void;
}

export function MeetingForm({ initial, onSubmit, onCancel }: MeetingFormProps) {
  const projects = useAppStore((s) => s.projects);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [relatedProjectId, setRelatedProjectId] = useState(initial?.relatedProjectId ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [actions, setActions] = useState<MeetingAction[]>(initial?.actions ?? []);
  const [actionDraft, setActionDraft] = useState("");

  const addAction = () => {
    const text = actionDraft.trim();
    if (!text) return;
    setActions((prev) => [...prev, { id: generateId(), text, done: false }]);
    setActionDraft("");
  };

  const onActionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAction();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes,
      relatedProjectId: relatedProjectId || null,
      tags,
      actions,
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
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div>
        <Label>Actions</Label>
        {actions.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {actions.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={a.done}
                  onChange={() =>
                    setActions((prev) => prev.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))
                  }
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className={a.done ? "flex-1 text-muted-foreground line-through" : "flex-1"}>{a.text}</span>
                <button
                  type="button"
                  onClick={() => setActions((prev) => prev.filter((x) => x.id !== a.id))}
                  className="rounded p-0.5 text-muted-foreground hover:bg-accent"
                  aria-label="Remove action"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            value={actionDraft}
            onChange={(e) => setActionDraft(e.target.value)}
            onKeyDown={onActionKeyDown}
            placeholder="Add an action item and press Enter"
          />
          <Button type="button" variant="outline" size="sm" onClick={addAction}>
            <Plus size={14} />
          </Button>
        </div>
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
          {initial ? "Save changes" : "Create meeting"}
        </Button>
      </div>
    </form>
  );
}
