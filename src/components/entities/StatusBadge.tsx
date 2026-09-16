import { Badge } from "@/components/ui/Badge";
import type { ProjectStatus, TaskStatus, Priority } from "@/types";

const projectStatusTone = {
  idea: "muted",
  "in-progress": "primary",
  waiting: "warning",
  done: "success",
} as const;

const projectStatusLabel: Record<ProjectStatus, string> = {
  idea: "Idea",
  "in-progress": "In progress",
  waiting: "Waiting",
  done: "Done",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={projectStatusTone[status]}>{projectStatusLabel[status]}</Badge>;
}

const taskStatusTone = {
  todo: "muted",
  doing: "primary",
  done: "success",
} as const;

const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={taskStatusTone[status]}>{taskStatusLabel[status]}</Badge>;
}

const priorityTone = {
  low: "muted",
  medium: "warning",
  high: "destructive",
} as const;

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone[priority]}>{priority}</Badge>;
}
