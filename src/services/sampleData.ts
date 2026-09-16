import { useAppStore } from "@/store/useAppStore";

// A one-time, opt-in seed so a brand new install isn't a blank void — the
// user triggers this from the dashboard empty state, it never runs
// automatically. Real actions (add/update/delete) are reused here so the
// seeded data goes through the exact same validation and timestamping as
// anything the user creates by hand.
export function loadSampleData(): void {
  const store = useAppStore.getState();

  const azureProject = store.addProject({
    title: "Azure Landing Zone Rollout",
    description: "Design and deploy the target landing zone architecture for the client's Azure tenant.",
    status: "in-progress",
    priority: "high",
    notes: "Waiting on network topology sign-off from the client's infra lead.",
    link: "https://dev.azure.com/amnyos/landing-zone",
    tags: ["Azure", "Client", "AI"],
    relatedDocumentIds: [],
  });

  const shareProject = store.addProject({
    title: "SharePoint Intranet Refresh",
    description: "Modernize the internal SharePoint portal with a cleaner nav and search experience.",
    status: "idea",
    priority: "medium",
    notes: "",
    link: "",
    tags: ["SharePoint", "Internal"],
    relatedDocumentIds: [],
  });

  const doc = store.addDocument({
    title: "Landing Zone Architecture.pptx",
    type: "powerpoint",
    description: "Slide deck covering the proposed subscription and network layout.",
    localPath: "C:\\Users\\HadiHannawi\\Documents\\Amnyos\\LandingZone.pptx",
    url: "",
    relatedProjectId: azureProject.id,
    attachment: null,
    tags: ["Azure", "Cowork"],
  });
  store.updateProject(azureProject.id, { relatedDocumentIds: [doc.id] });

  store.addTask({
    title: "Review network topology with client",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    priority: "high",
    status: "doing",
    relatedProjectId: azureProject.id,
    tags: ["Azure", "Client"],
  });

  store.addTask({
    title: "Draft SharePoint navigation wireframe",
    dueDate: null,
    priority: "low",
    status: "todo",
    relatedProjectId: shareProject.id,
    tags: ["SharePoint"],
  });

  store.addMeeting({
    title: "Landing Zone Kickoff",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: "Aligned on scope. Client wants a phased subscription rollout, starting with non-prod.",
    relatedProjectId: azureProject.id,
    tags: ["Azure", "Client"],
    actions: [
      { id: crypto.randomUUID(), text: "Send phased rollout proposal", done: true },
      { id: crypto.randomUUID(), text: "Schedule network review session", done: false },
    ],
  });

  store.addIdea({
    title: "Use AI to auto-tag documents by project",
    description: "Could save time on filing Word/PDF references into the right project.",
    category: "Automation",
    priority: "medium",
    tags: ["AI"],
  });

  store.addPerson({
    name: "Client Infra Lead",
    role: "Network Architect",
    email: "",
    notes: "Primary contact for network topology approvals.",
    relatedProjectId: azureProject.id,
    tags: ["Client"],
  });
}
