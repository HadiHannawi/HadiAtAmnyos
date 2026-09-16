import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xl font-semibold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
