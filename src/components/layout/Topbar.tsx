import { Menu } from "lucide-react";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </Button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
