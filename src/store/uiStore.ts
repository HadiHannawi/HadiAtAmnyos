import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
  applyTheme: () => void;
}

// Kept as its own store, separate from useAppStore: theme is a UI
// preference, not workspace data, so it shouldn't be part of an exported
// backup/restore of your projects and tasks.
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        get().applyTheme();
      },

      applyTheme: () => {
        document.documentElement.classList.toggle("dark", get().theme === "dark");
      },
    }),
    { name: "hadi-os:ui" }
  )
);
