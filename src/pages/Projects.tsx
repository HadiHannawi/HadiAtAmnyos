import { useMemo, useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { ProjectStatus } from "@/types";
import { PROJECT_STATUSES } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/entities/ProjectCard";
import { ProjectForm } from "@/components/entities/ProjectForm";
import { cn } from "@/utils/cn";

const statusLabel: Record<ProjectStatus, string> = {
  idea: "Idea",
  "in-progress": "In progress",
  waiting: "Waiting",
  done: "Done",
};

export default function Projects() {
  const projects = useAppStore((s) => s.projects);
  const addProject = useAppStore((s) => s.addProject);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} total</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={15} /> New project
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
        {PROJECT_STATUSES.map((s) => (
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
          icon={FolderKanban}
          title={projects.length === 0 ? "No projects yet" : "No projects match this filter"}
          description={projects.length === 0 ? "Create your first project to start organizing your work." : undefined}
          action={
            projects.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus size={15} /> New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New project">
        <ProjectForm
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => {
            addProject(input);
            setFormOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
