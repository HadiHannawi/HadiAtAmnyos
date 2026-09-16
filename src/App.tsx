import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Tasks from "@/pages/Tasks";
import Documents from "@/pages/Documents";
import Meetings from "@/pages/Meetings";
import Ideas from "@/pages/Ideas";
import People from "@/pages/People";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/people" element={<People />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
