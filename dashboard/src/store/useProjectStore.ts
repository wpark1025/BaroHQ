import { create } from 'zustand';
import type { Project, Task, Sprint, Goal } from '@/lib/types';
import { TaskStatus, TaskPriority } from '@/lib/types';

interface ProjectStore {
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  goals: Goal[];
  selectedProject: Project | null;
  selectedTask: Task | null;

  // Projects
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  selectProject: (project: Project | null) => void;

  // Tasks
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  selectTask: (task: Task | null) => void;

  // Sprints
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  removeSprint: (id: string) => void;

  // Goals
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  // Filters
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByAssignee: (agentId: string) => Task[];
  getTasksBySprint: (sprintId: string) => Task[];
  getSprintsByProject: (projectId: string) => Sprint[];
  getGoalsByProject: (projectId: string) => Goal[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  tasks: [],
  sprints: [],
  goals: [],
  selectedProject: null,
  selectedTask: null,

  // Projects
  setProjects: (projects) => set({ projects }),
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
  selectProject: (project) => set({ selectedProject: project }),

  // Tasks
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

  // Sprints
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

  // Goals
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

  // Filters
  getTasksByProject: (projectId) =>
    get().tasks.filter((t) => t.project === projectId),
  getTasksByStatus: (status) =>
    get().tasks.filter((t) => t.status === status),
  getTasksByPriority: (priority) =>
    get().tasks.filter((t) => t.priority === priority),
  getTasksByAssignee: (agentId) =>
    get().tasks.filter((t) => t.assignee === agentId),
  getTasksBySprint: (sprintId) =>
    get().tasks.filter((t) => t.sprint === sprintId),
  getSprintsByProject: (projectId) =>
    get().sprints.filter((s) => s.project === projectId),
  getGoalsByProject: (projectId) =>
    get().goals.filter((g) => g.project === projectId),
}));
