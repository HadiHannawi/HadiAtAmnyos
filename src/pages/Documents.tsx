import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { AppDocument } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentForm } from "@/components/entities/DocumentForm";
import { DocumentRow } from "@/components/entities/DocumentRow";

export default function Documents() {
  const documents = useAppStore((s) => s.documents);
  const addDocument = useAppStore((s) => s.addDocument);
  const updateDocument = useAppStore((s) => s.updateDocument);
  const deleteDocument = useAppStore((s) => s.deleteDocument);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppDocument | null>(null);
  const [deleting, setDeleting] = useState<AppDocument | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {documents.length} tracked — references only, files stay where they are.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> Add document
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Track a Word, PowerPoint, PDF or Excel file by its path or URL — Hadi OS doesn't need to open it, just remember it."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={15} /> Add document
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <DocumentRow
              key={d.id}
              doc={d}
              onEdit={() => {
                setEditing(d);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(d)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit document" : "Add document"}>
        <DocumentForm
          initial={editing ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            if (editing) updateDocument(editing.id, input);
            else addDocument(input);
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete document"
        description={`Delete "${deleting?.title}"? This only removes the reference — it won't touch the actual file.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteDocument(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
