import { useState, type FormEvent } from "react";
import type { Idea, Priority } from "@/types";
import type { NewIdeaInput } from "@/store/slices/ideasSlice";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/Button";

interface IdeaFormProps {
  initial?: Idea;
  onSubmit: (input: NewIdeaInput) => void;
  onCancel: () => void;
}

export function IdeaForm({ initial, onSubmit, onCancel }: IdeaFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description, category: category.trim(), priority, tags });
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
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Automation" />
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
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {initial ? "Save changes" : "Capture idea"}
        </Button>
      </div>
    </form>
  );
}
