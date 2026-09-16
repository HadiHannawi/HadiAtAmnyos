import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      {/* Mobile drawer: Sidebar is `hidden md:flex`, so below md we render a
          second, slide-in copy behind an overlay instead of reflowing it. */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="relative">
            <button
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
