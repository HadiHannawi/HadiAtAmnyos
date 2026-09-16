import { useMemo, useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Meeting } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { MeetingForm } from "@/components/entities/MeetingForm";
import { MeetingCard } from "@/components/entities/MeetingCard";

export default function Meetings() {
  const meetings = useAppStore((s) => s.meetings);
  const addMeeting = useAppStore((s) => s.addMeeting);
  const updateMeeting = useAppStore((s) => s.updateMeeting);
  const deleteMeeting = useAppStore((s) => s.deleteMeeting);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState<Meeting | null>(null);

  const sorted = useMemo(() => [...meetings].sort((a, b) => b.date.localeCompare(a.date)), [meetings]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Meetings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meetings.length} total</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> New meeting
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No meetings yet"
          description="Log a meeting with its notes and follow-up actions."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={15} /> New meeting
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={() => {
                setEditing(m);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(m)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit meeting" : "New meeting"} wide>
        <MeetingForm
          initial={editing ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            if (editing) updateMeeting(editing.id, input);
            else addMeeting(input);
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete meeting"
        description={`Delete "${deleting?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMeeting(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
