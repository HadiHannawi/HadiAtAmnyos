// The combined shape of the whole data store. Each slice is defined against
// this type (see the zustand "slices pattern") so that, e.g., deleteProject
// can reach into `tasks`/`documents`/`meetings`/`people` to clear dangling
// references, without slice files importing each other directly.
import type { ProjectsSlice } from "./slices/projectsSlice";
import type { TasksSlice } from "./slices/tasksSlice";
import type { DocumentsSlice } from "./slices/documentsSlice";
import type { MeetingsSlice } from "./slices/meetingsSlice";
import type { IdeasSlice } from "./slices/ideasSlice";
import type { PeopleSlice } from "./slices/peopleSlice";

export type AppState = ProjectsSlice &
  TasksSlice &
  DocumentsSlice &
  MeetingsSlice &
  IdeasSlice &
  PeopleSlice;
