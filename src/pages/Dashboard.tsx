import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Sparkles,
  FolderPlus,
  CalendarDays,
  Lightbulb,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectStatusBadge, TaskStatusBadge } from "@/components/entities/StatusBadge";
import { formatDate, relativeTime } from "@/utils/date";
import { loadSampleData } from "@/services/sampleData";
import type { EntityKind } from "@/types";

const kindIcon: Record<EntityKind, LucideIcon> = {
  project: FolderPlus,
  task: CheckSquare,
  document: FileText,
  meeting: CalendarDays,
  idea: Lightbulb,
  person: Users,
};

export default function Dashboard() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const documents = useAppStore((s) => s.documents);
  const meetings = useAppStore((s) => s.meetings);
  const ideas = useAppStore((s) => s.ideas);
  const people = useAppStore((s) => s.people);

  const openTasks = useMemo(() => tasks.filter((t) => t.status !== "done"), [tasks]);

  const recentDocuments = useMemo(
    () => [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [documents]
  );

  const recentActivity = useMemo(() => {
    type Activity = { kind: EntityKind; id: string; title: string; at: string; href: string };
    const items: Activity[] = [
      ...projects.map((p) => ({ kind: "project" as const, id: p.id, title: p.title, at: p.updatedAt, href: `/projects/${p.id}` })),
      ...tasks.map((t) => ({ kind: "task" as const, id: t.id, title: t.title, at: t.updatedAt, href: "/tasks" })),
      ...documents.map((d) => ({ kind: "document" as const, id: d.id, title: d.title, at: d.updatedAt, href: "/documents" })),
      ...meetings.map((m) => ({ kind: "meeting" as const, id: m.id, title: m.title, at: m.updatedAt, href: "/meetings" })),
      ...ideas.map((i) => ({ kind: "idea" as const, id: i.id, title: i.title, at: i.updatedAt, href: "/ideas" })),
      ...people.map((p) => ({ kind: "person" as const, id: p.id, title: p.name, at: p.updatedAt, href: "/people" })),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [projects, tasks, documents, meetings, ideas, people]);

  const isEmpty =
    projects.length === 0 &&
    tasks.length === 0 &&
    documents.length === 0 &&
    meetings.length === 0 &&
    ideas.length === 0 &&
    people.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Welcome to Hadi OS"
        description="Your personal work OS for Amnyos — everything you add is saved only in this browser. Start from scratch, or load a sample workspace to see how it fits together."
        action={
          <Button onClick={() => loadSampleData()}>
            <Sparkles size={15} /> Load sample workspace
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your workspace at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={FolderKanban} label="Projects" value={projects.length} />
        <StatCard icon={CheckSquare} label="Open tasks" value={openTasks.length} />
        <StatCard icon={FileText} label="Documents" value={documents.length} />
        <StatCard icon={Users} label="People" value={people.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Recent documents</h2>
            <Link to="/documents" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents tracked yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentDocuments.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(d.updatedAt)}</p>
                    </div>
                    <span className="shrink-0 text-xs uppercase text-muted-foreground">{d.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = kindIcon[item.kind];
                  return (
                    <li key={`${item.kind}-${item.id}`}>
                      <Link to={item.href} className="flex items-center gap-2.5 text-sm hover:text-primary">
                        <Icon size={14} className="shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(item.at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {(projects.length > 0 || openTasks.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Active projects</h2>
              <Link to="/projects" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {projects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link to={`/projects/${p.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-primary">
                      <span className="truncate font-medium">{p.title}</span>
                      <ProjectStatusBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Open tasks</h2>
              <Link to="/tasks" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {openTasks.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{t.title}</span>
                    <TaskStatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
