import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  CalendarDays,
  Lightbulb,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/people", label: "People", icon: Users },
];

interface SidebarProps {
  /** Rendered inside the mobile drawer, where it should always be visible (not `hidden md:flex`). */
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-56 shrink-0 flex-col border-r border-border bg-card px-3 py-4",
        mobile ? "flex w-64" : "hidden md:flex"
      )}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
          H
        </div>
        <span className="text-sm font-semibold">Hadi OS</span>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                isActive && "bg-accent text-foreground"
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            isActive && "bg-accent text-foreground"
          )
        }
      >
        <Settings size={16} />
        Settings
      </NavLink>
    </aside>
  );
}
