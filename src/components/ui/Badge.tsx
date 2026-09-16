import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Tone = "default" | "primary" | "success" | "warning" | "destructive" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "bg-accent text-accent-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
