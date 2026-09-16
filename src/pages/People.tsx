import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Person } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PersonForm } from "@/components/entities/PersonForm";
import { PersonCard } from "@/components/entities/PersonCard";

export default function People() {
  const people = useAppStore((s) => s.people);
  const addPerson = useAppStore((s) => s.addPerson);
  const updatePerson = useAppStore((s) => s.updatePerson);
  const deletePerson = useAppStore((s) => s.deletePerson);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState<Person | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">People</h1>
          <p className="mt-1 text-sm text-muted-foreground">{people.length} contacts</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> Add person
        </Button>
      </div>

      {people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No people yet"
          description="Keep track of clients, colleagues and contacts tied to your work."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={15} /> Add person
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              onEdit={() => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(p)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit person" : "Add person"}>
        <PersonForm
          initial={editing ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            if (editing) updatePerson(editing.id, input);
            else addPerson(input);
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete person"
        description={`Delete "${deleting?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deletePerson(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
