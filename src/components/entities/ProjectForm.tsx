import { useState, type FormEvent } from "react";
import type { Project, ProjectStatus, Priority } from "@/types";
import { PROJECT_STATUSES } from "@/types";
import type { NewProjectInput } from "@/store/slices/projectsSlice";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/Button";

interface ProjectFormProps {
  initial?: Project;
  onSubmit: (input: NewProjectInput) => void;
  onCancel: () => void;
}

const statusLabel: Record<ProjectStatus, string> = {
  idea: "Idea",
  "in-progress": "In progress",
  waiting: "Waiting",
  done: "Done",
};

export function ProjectForm({ initial, onSubmit, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "idea");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description,
      status,
      priority,
      notes,
      tags,
      relatedDocumentIds: initial?.relatedDocumentIds ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </Select>
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

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          {initial ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
