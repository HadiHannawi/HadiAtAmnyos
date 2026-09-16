import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProjectStatusBadge, PriorityBadge } from "./StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="block h-full">
      <Card className="h-full hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-panel">
        <CardHeader>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">{project.title}</h3>
              {project.link && (
                // A plain <button> here, not an <a> — this card is already wrapped in a
                // react-router <Link> (renders as <a>), and nested anchors are invalid
                // HTML that browsers resolve inconsistently.
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(project.link, "_blank", "noopener,noreferrer");
                  }}
                  className="shrink-0 text-muted-foreground hover:text-primary"
                  aria-label="Open project link"
                >
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
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
