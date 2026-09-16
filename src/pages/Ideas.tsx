import { useState } from "react";
import { Plus, Lightbulb } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Idea } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { IdeaForm } from "@/components/entities/IdeaForm";
import { IdeaCard } from "@/components/entities/IdeaCard";

export default function Ideas() {
  const ideas = useAppStore((s) => s.ideas);
  const addIdea = useAppStore((s) => s.addIdea);
  const updateIdea = useAppStore((s) => s.updateIdea);
  const deleteIdea = useAppStore((s) => s.deleteIdea);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);
  const [deleting, setDeleting] = useState<Idea | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Ideas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quick capture — {ideas.length} saved</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> New idea
        </Button>
      </div>

      {ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas captured yet"
          description="Jot down anything worth revisiting later."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={15} /> New idea
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((i) => (
            <IdeaCard
              key={i.id}
              idea={i}
              onEdit={() => {
                setEditing(i);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(i)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit idea" : "New idea"}>
        <IdeaForm
          initial={editing ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            if (editing) updateIdea(editing.id, input);
            else addIdea(input);
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete idea"
        description={`Delete "${deleting?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteIdea(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
