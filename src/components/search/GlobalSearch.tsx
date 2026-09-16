import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderKanban, CheckSquare, FileText, CalendarDays, Lightbulb, Users, type LucideIcon } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import type { EntityKind } from "@/types";
import { cn } from "@/utils/cn";

const kindIcon: Record<EntityKind, LucideIcon> = {
  project: FolderKanban,
  task: CheckSquare,
  document: FileText,
  meeting: CalendarDays,
  idea: Lightbulb,
  person: Users,
};

const kindLabel: Record<EntityKind, string> = {
  project: "Project",
  task: "Task",
  document: "Document",
  meeting: "Meeting",
  idea: "Idea",
  person: "Person",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useSearch(query);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const go = (href: string) => {
    navigate(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search everything…"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-96 overflow-y-auto rounded-md border border-border bg-card shadow-panel animate-in fade-in slide-in-from-top-1 duration-150">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches for "{query}"</p>
          ) : (
            <ul className="py-1">
              {results.map((r) => {
                const Icon = kindIcon[r.kind];
                return (
                  <li key={`${r.kind}-${r.id}`}>
                    <button
                      onClick={() => go(r.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      )}
                    >
                      <Icon size={14} className="shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{r.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{kindLabel[r.kind]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
