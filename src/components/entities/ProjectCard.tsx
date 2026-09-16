import { Link } from "react-router-dom";
import type { Project } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProjectStatusBadge, PriorityBadge } from "./StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{project.title}</h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1.5">
            <ProjectStatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} tone="muted">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
