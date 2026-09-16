import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { useUiStore } from "@/store/uiStore";
import "./index.css";

// Apply the persisted theme before first paint so there's no light-mode flash
// on load when the user's saved preference is dark.
useUiStore.getState().applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
