import { useMemo, useState } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Task, TaskStatus } from "@/types";
import { TASK_STATUSES } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskForm } from "@/components/entities/TaskForm";
import { TaskRow } from "@/components/entities/TaskRow";
import { cn } from "@/utils/cn";

const statusLabel: Record<TaskStatus, string> = { todo: "To do", doing: "Doing", done: "Done" };

export default function Tasks() {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }),
    [tasks]
  );

  const filtered = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((t) => t.status === filter)),
    [sorted, filter]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tasks.filter((t) => t.status !== "done").length} open</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> New task
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          All
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? "No tasks yet" : "No tasks match this filter"}
          description={tasks.length === 0 ? "Add a task to start tracking your work." : undefined}
          action={
            tasks.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus size={15} /> New task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onEdit={() => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(t)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit task" : "New task"}>
        <TaskForm
          initial={editing ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            if (editing) updateTask(editing.id, input);
            else addTask(input);
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete task"
        description={`Delete "${deleting?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTask(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
