import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { SearchResult } from "@/types";

function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  return fields.some((f) => f?.toLowerCase().includes(query));
}

/**
 * One flat, instant search across every entity kind. No debounce and no
 * external search library — with data capped at "one person's workload"
 * (hundreds, not millions, of rows), filtering the in-memory arrays on every
 * keystroke is cheap enough to just do directly.
 */
export function useSearch(query: string): SearchResult[] {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const documents = useAppStore((s) => s.documents);
  const meetings = useAppStore((s) => s.meetings);
  const ideas = useAppStore((s) => s.ideas);
  const people = useAppStore((s) => s.people);

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const p of projects) {
      if (matches(q, p.title, p.description, p.notes, ...p.tags)) {
        results.push({ kind: "project", id: p.id, title: p.title, subtitle: p.status, href: `/projects/${p.id}` });
      }
    }
    for (const t of tasks) {
      if (matches(q, t.title, ...t.tags)) {
        results.push({ kind: "task", id: t.id, title: t.title, subtitle: t.status, href: `/tasks` });
      }
    }
    for (const d of documents) {
      if (matches(q, d.title, d.description, d.localPath, d.url, ...d.tags)) {
        results.push({ kind: "document", id: d.id, title: d.title, subtitle: d.type, href: `/documents` });
      }
    }
    for (const m of meetings) {
      if (matches(q, m.title, m.notes, ...m.tags)) {
        results.push({ kind: "meeting", id: m.id, title: m.title, subtitle: "meeting", href: `/meetings` });
      }
    }
    for (const i of ideas) {
      if (matches(q, i.title, i.description, i.category, ...i.tags)) {
        results.push({ kind: "idea", id: i.id, title: i.title, subtitle: i.category || "idea", href: `/ideas` });
      }
    }
    for (const person of people) {
      if (matches(q, person.name, person.role, person.email, person.notes, ...person.tags)) {
        results.push({ kind: "person", id: person.id, title: person.name, subtitle: person.role || "person", href: `/people` });
      }
    }

    return results.slice(0, 50);
  }, [query, projects, tasks, documents, meetings, ideas, people]);
}
