import { create } from 'zustand';
import type { Project, Task, Sprint, Goal } from '@/lib/types';
import {
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
  TaskType,
  SprintStatus,
} from '@/lib/types';

interface AutoIssue {
  id: string;
  sourceAgent: string;
  error: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  linkedTaskId: string;
  status: 'open' | 'triaged' | 'resolved';
  createdAt: string;
}

interface ProjectStore {
  // --- Projects ---
  projects: Project[];
  selectedProject: Project | null;
  selectedProjectId: string | null;
  filterStatus: ProjectStatus | 'all';
  filterTeam: string;
  filterPriority: ProjectPriority | 'all';
  filterTag: string;
  sortBy: 'name' | 'priority' | 'status' | 'updatedAt';
  sortOrder: 'asc' | 'desc';

  setProjects: (projects: Project[]) => void;
  selectProject: (project: Project | null) => void;
  setSelectedProject: (id: string | null) => void;
  setFilterStatus: (s: ProjectStatus | 'all') => void;
  setFilterTeam: (t: string) => void;
  setFilterPriority: (p: ProjectPriority | 'all') => void;
  setFilterTag: (t: string) => void;
  setSortBy: (s: 'name' | 'priority' | 'status' | 'updatedAt') => void;
  setSortOrder: (o: 'asc' | 'desc') => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getFilteredProjects: () => Project[];

  // --- Tasks ---
  tasks: Task[];
  selectedTask: Task | null;
  selectedTaskId: string | null;
  autoIssues: AutoIssue[];
  activeView: 'kanban' | 'list' | 'timeline' | 'sprints';
  filterType: TaskType | 'all';
  filterTaskStatus: TaskStatus | 'all';
  filterAssignee: string;
  filterProject: string;
  filterSprint: string;
  filterTaskPriority: TaskPriority | 'all';
  filterLabel: string;
  filterReporter: string;
  filterDateRange: { start: string; end: string };
  searchQuery: string;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  selectTask: (task: Task | null) => void;
  setSelectedTask: (id: string | null) => void;
  setAutoIssues: (issues: AutoIssue[]) => void;
  setActiveView: (v: 'kanban' | 'list' | 'timeline' | 'sprints') => void;
  setFilterType: (t: TaskType | 'all') => void;
  setFilterTaskStatus: (s: TaskStatus | 'all') => void;
  setFilterAssignee: (a: string) => void;
  setFilterProject: (p: string) => void;
  setFilterSprint: (s: string) => void;
  setFilterTaskPriority: (p: TaskPriority | 'all') => void;
  setFilterLabel: (l: string) => void;
  setFilterReporter: (r: string) => void;
  setFilterDateRange: (d: { start: string; end: string }) => void;
  setSearchQuery: (q: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByAssignee: (agentId: string) => Task[];
  getTasksBySprint: (sprintId: string) => Task[];

  // --- Sprints ---
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  removeSprint: (id: string) => void;
  getSprintById: (id: string) => Sprint | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];

  // --- Goals ---
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  getGoalsByProject: (projectId: string) => Goal[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // --- Projects ---
  projects: [],
  selectedProject: null,
  selectedProjectId: null,
  filterStatus: 'all',
  filterTeam: 'all',
  filterPriority: 'all',
  filterTag: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',

  setProjects: (projects) => set({ projects }),
  selectProject: (project) => set({ selectedProject: project }),
  setSelectedProject: (id) => set({ selectedProjectId: id }),
  setFilterTeam: (t) => set({ filterTeam: t }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterTag: (t) => set({ filterTag: t }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortOrder: (o) => set({ sortOrder: o }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
    })),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getFilteredProjects: () => {
    const { projects, filterStatus, filterTeam, filterPriority, filterTag, sortBy, sortOrder } = get();
    let result = [...projects];
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterTeam !== 'all') result = result.filter((p) => p.teams.includes(filterTeam));
    if (filterPriority !== 'all') result = result.filter((p) => p.priority === filterPriority);
    if (filterTag !== 'all') result = result.filter((p) => p.tags.includes(filterTag));
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'priority') cmp = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
      else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      else cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  },

  // --- Tasks ---
  tasks: [],
  selectedTask: null,
  selectedTaskId: null,
  autoIssues: [],
  activeView: 'kanban',
  filterType: 'all',
  filterTaskStatus: 'all',
  filterAssignee: 'all',
  filterProject: 'all',
  filterSprint: 'all',
  filterTaskPriority: 'all',
  filterLabel: 'all',
  filterReporter: 'all',
  filterDateRange: { start: '', end: '' },
  searchQuery: '',

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask:
        state.selectedTask?.id === id ? null : state.selectedTask,
    })),

  selectTask: (task) => set({ selectedTask: task }),
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setAutoIssues: (issues) => set({ autoIssues: issues }),
  setActiveView: (v) => set({ activeView: v }),

  // setFilterStatus is shared for projects; we use setFilterTaskStatus for tasks
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterType: (t) => set({ filterType: t }),
  setFilterTaskStatus: (s) => set({ filterTaskStatus: s }),
  setFilterAssignee: (a) => set({ filterAssignee: a }),
  setFilterProject: (p) => set({ filterProject: p }),
  setFilterSprint: (s) => set({ filterSprint: s }),
  setFilterTaskPriority: (p) => set({ filterTaskPriority: p }),
  setFilterLabel: (l) => set({ filterLabel: l }),
  setFilterReporter: (r) => set({ filterReporter: r }),
  setFilterDateRange: (d) => set({ filterDateRange: d }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  getFilteredTasks: () => {
    const state = get();
    let result = [...state.tasks];
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }
    if (state.filterType !== 'all') result = result.filter((t) => t.type === state.filterType);
    if (state.filterTaskStatus !== 'all') result = result.filter((t) => t.status === state.filterTaskStatus);
    if (state.filterAssignee !== 'all') result = result.filter((t) => t.assignee === state.filterAssignee);
    if (state.filterProject !== 'all') result = result.filter((t) => t.project === state.filterProject);
    if (state.filterSprint !== 'all') result = result.filter((t) => t.sprint === state.filterSprint);
    if (state.filterTaskPriority !== 'all') result = result.filter((t) => t.priority === state.filterTaskPriority);
    if (state.filterLabel !== 'all') result = result.filter((t) => t.labels.includes(state.filterLabel));
    if (state.filterReporter !== 'all') result = result.filter((t) => t.reporter === state.filterReporter);
    return result;
  },

  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getTasksByProject: (projectId) => get().tasks.filter((t) => t.project === projectId),
  getTasksByPriority: (priority) => get().tasks.filter((t) => t.priority === priority),
  getTasksByAssignee: (agentId) => get().tasks.filter((t) => t.assignee === agentId),
  getTasksBySprint: (sprintId) => get().tasks.filter((t) => t.sprint === sprintId),

  // --- Sprints ---
  sprints: [],
  setSprints: (sprints) => set({ sprints }),

  addSprint: (sprint) =>
    set((state) => ({ sprints: [...state.sprints, sprint] })),

  updateSprint: (id, updates) =>
    set((state) => ({
      sprints: state.sprints.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  removeSprint: (id) =>
    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== id),
    })),

  getSprintById: (id) => get().sprints.find((s) => s.id === id),
  getSprintsByProject: (projectId) => get().sprints.filter((s) => s.project === projectId),

  // --- Goals ---
  goals: [],
  setGoals: (goals) => set({ goals }),

  addGoal: (goal) =>
    set((state) => ({ goals: [...state.goals, goal] })),

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),

  removeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  getGoalsByProject: (projectId) => get().goals.filter((g) => g.project === projectId),
}));
