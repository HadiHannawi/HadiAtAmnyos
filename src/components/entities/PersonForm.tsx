import { useState, type FormEvent } from "react";
import type { Person } from "@/types";
import type { NewPersonInput } from "@/store/slices/peopleSlice";
import { useAppStore } from "@/store/useAppStore";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/Button";

interface PersonFormProps {
  initial?: Person;
  onSubmit: (input: NewPersonInput) => void;
  onCancel: () => void;
}

export function PersonForm({ initial, onSubmit, onCancel }: PersonFormProps) {
  const projects = useAppStore((s) => s.projects);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [relatedProjectId, setRelatedProjectId] = useState(initial?.relatedProjectId ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      role,
      email,
      notes,
      relatedProjectId: relatedProjectId || null,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Client, Colleague" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {initial ? "Save changes" : "Add person"}
        </Button>
      </div>
    </form>
  );
}
