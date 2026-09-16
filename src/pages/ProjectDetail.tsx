import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, FileText, Plus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Input";
import { ProjectForm } from "@/components/entities/ProjectForm";
import { ProjectStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/entities/StatusBadge";
import { formatDate } from "@/utils/date";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const updateProject = useAppStore((s) => s.updateProject);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const documents = useAppStore((s) => s.documents);
  const tasks = useAppStore((s) => s.tasks);
  const meetings = useAppStore((s) => s.meetings);
  const people = useAppStore((s) => s.people);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [linkDocId, setLinkDocId] = useState("");

  const linkedDocuments = useMemo(
    () =>
      documents.filter((d) => d.relatedProjectId === project?.id || project?.relatedDocumentIds.includes(d.id)),
    [documents, project]
  );
  const linkableDocuments = useMemo(
    () => documents.filter((d) => !linkedDocuments.some((ld) => ld.id === d.id)),
    [documents, linkedDocuments]
  );
  const relatedTasks = useMemo(() => tasks.filter((t) => t.relatedProjectId === project?.id), [tasks, project]);
  const relatedMeetings = useMemo(() => meetings.filter((m) => m.relatedProjectId === project?.id), [meetings, project]);
  const relatedPeople = useMemo(() => people.filter((p) => p.relatedProjectId === project?.id), [people, project]);

  if (!project) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This project doesn't exist — it may have been deleted.</p>
        <Link to="/projects" className="text-sm text-primary hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={13} /> Back to projects
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{project.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <ProjectStatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
              {project.tags.map((tag) => (
                <Badge key={tag} tone="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>

      {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}

      {project.notes && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Notes</h2>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{project.notes}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Related documents</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedDocuments.length === 0 && <p className="text-sm text-muted-foreground">No documents linked.</p>}
            <ul className="space-y-2">
              {linkedDocuments.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText size={14} className="shrink-0 text-muted-foreground" />
                    <span className="truncate">{d.title}</span>
                  </span>
                  {project.relatedDocumentIds.includes(d.id) && d.relatedProjectId !== project.id && (
                    <button
                      onClick={() =>
                        updateProject(project.id, {
                          relatedDocumentIds: project.relatedDocumentIds.filter((docId) => docId !== d.id),
                        })
                      }
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent"
                      aria-label="Unlink document"
                    >
                      <X size={13} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {linkableDocuments.length > 0 && (
              <div className="flex gap-2 pt-1">
                <Select value={linkDocId} onChange={(e) => setLinkDocId(e.target.value)} className="flex-1">
                  <option value="">Link an existing document…</option>
                  {linkableDocuments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!linkDocId}
                  onClick={() => {
                    updateProject(project.id, { relatedDocumentIds: [...project.relatedDocumentIds, linkDocId] });
                    setLinkDocId("");
                  }}
                >
                  <Plus size={14} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Tasks</h2>
          </CardHeader>
          <CardContent>
            {relatedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks linked to this project.</p>
            ) : (
              <ul className="space-y-2">
                {relatedTasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <TaskStatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Meetings</h2>
          </CardHeader>
          <CardContent>
            {relatedMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings linked to this project.</p>
            ) : (
              <ul className="space-y-2">
                {relatedMeetings.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{m.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">People</h2>
          </CardHeader>
          <CardContent>
            {relatedPeople.length === 0 ? (
              <p className="text-sm text-muted-foreground">No people linked to this project.</p>
            ) : (
              <ul className="space-y-2">
                {relatedPeople.map((p) => (
                  <li key={p.id} className="text-sm">
                    {p.name}
                    {p.role && <span className="text-muted-foreground"> — {p.role}</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <ProjectForm
          initial={project}
          onCancel={() => setEditOpen(false)}
          onSubmit={(input) => {
            updateProject(project.id, input);
            setEditOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project"
        description={`Delete "${project.title}"? Linked tasks, documents, meetings and people won't be deleted, only unlinked.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteProject(project.id);
          navigate("/projects");
        }}
      />
    </div>
  );
}
