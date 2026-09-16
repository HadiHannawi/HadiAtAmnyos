import { useState, type FormEvent } from "react";
import type { Task, TaskStatus, Priority } from "@/types";
import { TASK_STATUSES } from "@/types";
import type { NewTaskInput } from "@/store/slices/tasksSlice";
import { useAppStore } from "@/store/useAppStore";
import { Input, Select, Label } from "@/components/ui/Input";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/Button";

interface TaskFormProps {
  initial?: Task;
  onSubmit: (input: NewTaskInput) => void;
  onCancel: () => void;
}

const statusLabel: Record<TaskStatus, string> = { todo: "To do", doing: "Doing", done: "Done" };

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const projects = useAppStore((s) => s.projects);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [relatedProjectId, setRelatedProjectId] = useState(initial?.relatedProjectId ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      status,
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
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
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
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {initial ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
