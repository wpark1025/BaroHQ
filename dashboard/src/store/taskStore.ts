import { create } from 'zustand';
import {
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  Sprint,
  SprintStatus,
} from '@/lib/types';

const MOCK_TASKS: Task[] = [
  {
    id: 'task-1', type: TaskType.Epic, title: 'User Authentication System',
    description: '## Overview\nImplement complete auth flow with OAuth, MFA, and session management.',
    status: TaskStatus.InProgress, priority: TaskPriority.High,
    assignee: 'agent-1', reporter: 'agent-ceo', team: 'team-eng', project: 'proj-1',
    sprint: 'sprint-1', parent: '', children: ['task-2', 'task-3'], labels: ['auth', 'security'],
    storyPoints: 21, dueDate: '2026-04-30',
    timeTracking: { estimated: 2520, logged: 1200 },
    linkedGoal: 'goal-1', linkedTasks: [], attachments: [],
    comments: [
      { id: 'c-1', author: 'agent-ceo', text: 'High priority — blocks multiple features.', timestamp: '2026-03-01T10:00:00Z', edited: false },
    ],
    history: [
      { id: 'h-1', field: 'status', oldValue: 'todo', newValue: 'in_progress', changedBy: 'agent-1', timestamp: '2026-03-10T09:00:00Z' },
    ],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-ceo',
    createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-28T14:00:00Z',
  },
  {
    id: 'task-2', type: TaskType.Story, title: 'OAuth2 Integration',
    description: 'Integrate Google and GitHub OAuth providers.',
    status: TaskStatus.InReview, priority: TaskPriority.High,
    assignee: 'agent-1', reporter: 'agent-1', team: 'team-eng', project: 'proj-1',
    sprint: 'sprint-1', parent: 'task-1', children: [], labels: ['auth', 'oauth'],
    storyPoints: 8, dueDate: '2026-04-10',
    timeTracking: { estimated: 960, logged: 840 },
    linkedGoal: '', linkedTasks: [{ taskId: 'task-3', relation: 'blocks' }], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-1',
    createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-03-30T11:00:00Z',
  },
  {
    id: 'task-3', type: TaskType.Task, title: 'Session Management Service',
    description: 'Build JWT-based session management with refresh tokens.',
    status: TaskStatus.Todo, priority: TaskPriority.Medium,
    assignee: 'agent-2', reporter: 'agent-1', team: 'team-eng', project: 'proj-1',
    sprint: 'sprint-1', parent: 'task-1', children: [], labels: ['auth', 'backend'],
    storyPoints: 5, dueDate: '2026-04-15',
    timeTracking: { estimated: 600, logged: 0 },
    linkedGoal: '', linkedTasks: [{ taskId: 'task-2', relation: 'blocked_by' }], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-1',
    createdAt: '2026-02-20T10:30:00Z', updatedAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'task-4', type: TaskType.Bug, title: 'Fix token refresh race condition',
    description: 'Multiple concurrent requests cause token refresh to fail intermittently.',
    status: TaskStatus.Backlog, priority: TaskPriority.Critical,
    assignee: '', reporter: 'agent-2', team: 'team-eng', project: 'proj-1',
    sprint: '', parent: '', children: [], labels: ['bug', 'auth'],
    storyPoints: 3, dueDate: '',
    timeTracking: { estimated: 240, logged: 0 },
    linkedGoal: '', linkedTasks: [], attachments: [],
    comments: [], history: [],
    autoCreated: true, autoCreatedFrom: 'agent-monitor', createdBy: 'system',
    createdAt: '2026-03-28T16:00:00Z', updatedAt: '2026-03-28T16:00:00Z',
  },
  {
    id: 'task-5', type: TaskType.Story, title: 'Design System Tokens Migration',
    description: 'Migrate all hardcoded colors/spacing to design tokens.',
    status: TaskStatus.InProgress, priority: TaskPriority.Medium,
    assignee: 'agent-3', reporter: 'agent-3', team: 'team-design', project: 'proj-3',
    sprint: 'sprint-3', parent: '', children: ['task-6'], labels: ['design', 'tokens'],
    storyPoints: 13, dueDate: '2026-04-20',
    timeTracking: { estimated: 1560, logged: 600 },
    linkedGoal: '', linkedTasks: [], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-3',
    createdAt: '2026-03-01T08:00:00Z', updatedAt: '2026-03-29T15:00:00Z',
  },
  {
    id: 'task-6', type: TaskType.Subtask, title: 'Extract color primitives',
    description: 'Extract all raw color values into primitive tokens.',
    status: TaskStatus.Done, priority: TaskPriority.Medium,
    assignee: 'agent-3', reporter: 'agent-3', team: 'team-design', project: 'proj-3',
    sprint: 'sprint-3', parent: 'task-5', children: [], labels: ['design'],
    storyPoints: 3, dueDate: '2026-03-25',
    timeTracking: { estimated: 360, logged: 300 },
    linkedGoal: '', linkedTasks: [], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-3',
    createdAt: '2026-03-05T08:00:00Z', updatedAt: '2026-03-24T17:00:00Z',
  },
  {
    id: 'task-7', type: TaskType.Task, title: 'API Rate Limiting',
    description: 'Implement sliding window rate limiter for all public endpoints.',
    status: TaskStatus.Todo, priority: TaskPriority.High,
    assignee: 'agent-4', reporter: 'agent-ceo', team: 'team-eng', project: 'proj-1',
    sprint: 'sprint-2', parent: '', children: [], labels: ['backend', 'security'],
    storyPoints: 5, dueDate: '2026-05-01',
    timeTracking: { estimated: 600, logged: 0 },
    linkedGoal: 'goal-1', linkedTasks: [], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-ceo',
    createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'task-8', type: TaskType.Task, title: 'Dashboard Analytics Widget',
    description: 'Build real-time analytics widget showing key metrics.',
    status: TaskStatus.Done, priority: TaskPriority.Low,
    assignee: 'agent-2', reporter: 'agent-2', team: 'team-eng', project: 'proj-1',
    sprint: 'sprint-1', parent: '', children: [], labels: ['frontend', 'analytics'],
    storyPoints: 8, dueDate: '2026-03-20',
    timeTracking: { estimated: 960, logged: 900 },
    linkedGoal: '', linkedTasks: [], attachments: [],
    comments: [], history: [],
    autoCreated: false, autoCreatedFrom: '', createdBy: 'agent-2',
    createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-03-19T16:00:00Z',
  },
];

const MOCK_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1', name: 'Sprint 1 — Auth & Core', project: 'proj-1',
    status: SprintStatus.Active, startDate: '2026-03-15', endDate: '2026-03-29',
    goal: 'Complete auth foundation and core APIs',
    tasks: ['task-1', 'task-2', 'task-3', 'task-8'], velocity: 34,
  },
  {
    id: 'sprint-2', name: 'Sprint 2 — Security & Perf', project: 'proj-1',
    status: SprintStatus.Planning, startDate: '2026-03-30', endDate: '2026-04-12',
    goal: 'Rate limiting and performance optimization',
    tasks: ['task-7'], velocity: 0,
  },
  {
    id: 'sprint-3', name: 'Design Sprint 1', project: 'proj-3',
    status: SprintStatus.Active, startDate: '2026-03-10', endDate: '2026-03-24',
    goal: 'Complete design token migration',
    tasks: ['task-5', 'task-6'], velocity: 16,
  },
];

interface AutoIssue {
  id: string;
  sourceAgent: string;
  error: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  linkedTaskId: string;
  status: 'open' | 'triaged' | 'resolved';
  createdAt: string;
}

const MOCK_AUTO_ISSUES: AutoIssue[] = [
  {
    id: 'ai-1', sourceAgent: 'agent-monitor', error: 'Token refresh race condition detected in production',
    severity: 'critical', linkedTaskId: 'task-4', status: 'triaged', createdAt: '2026-03-28T16:00:00Z',
  },
  {
    id: 'ai-2', sourceAgent: 'agent-qa', error: 'Flaky test: auth.spec.ts:42 — timeout on OAuth callback',
    severity: 'medium', linkedTaskId: '', status: 'open', createdAt: '2026-03-29T09:00:00Z',
  },
  {
    id: 'ai-3', sourceAgent: 'agent-ops', error: 'Memory usage exceeding 85% on worker-3',
    severity: 'high', linkedTaskId: '', status: 'open', createdAt: '2026-03-30T11:30:00Z',
  },
];

interface TaskStore {
  tasks: Task[];
  sprints: Sprint[];
  autoIssues: AutoIssue[];
  activeView: 'kanban' | 'list' | 'timeline' | 'sprints';
  selectedTaskId: string | null;
  filterType: TaskType | 'all';
  filterStatus: TaskStatus | 'all';
  filterAssignee: string;
  filterProject: string;
  filterSprint: string;
  filterPriority: TaskPriority | 'all';
  filterLabel: string;
  filterReporter: string;
  filterDateRange: { start: string; end: string };
  searchQuery: string;
  setActiveView: (v: 'kanban' | 'list' | 'timeline' | 'sprints') => void;
  setSelectedTask: (id: string | null) => void;
  setFilterType: (t: TaskType | 'all') => void;
  setFilterStatus: (s: TaskStatus | 'all') => void;
  setFilterAssignee: (a: string) => void;
  setFilterProject: (p: string) => void;
  setFilterSprint: (s: string) => void;
  setFilterPriority: (p: TaskPriority | 'all') => void;
  setFilterLabel: (l: string) => void;
  setFilterReporter: (r: string) => void;
  setFilterDateRange: (d: { start: string; end: string }) => void;
  setSearchQuery: (q: string) => void;
  addTask: (t: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addSprint: (s: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  getTaskById: (id: string) => Task | undefined;
  getSprintById: (id: string) => Sprint | undefined;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksBySprint: (sprintId: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: MOCK_TASKS,
  sprints: MOCK_SPRINTS,
  autoIssues: MOCK_AUTO_ISSUES,
  activeView: 'kanban',
  selectedTaskId: null,
  filterType: 'all',
  filterStatus: 'all',
  filterAssignee: 'all',
  filterProject: 'all',
  filterSprint: 'all',
  filterPriority: 'all',
  filterLabel: 'all',
  filterReporter: 'all',
  filterDateRange: { start: '', end: '' },
  searchQuery: '',
  setActiveView: (v) => set({ activeView: v }),
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setFilterType: (t) => set({ filterType: t }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterAssignee: (a) => set({ filterAssignee: a }),
  setFilterProject: (p) => set({ filterProject: p }),
  setFilterSprint: (s) => set({ filterSprint: s }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterLabel: (l) => set({ filterLabel: l }),
  setFilterReporter: (r) => set({ filterReporter: r }),
  setFilterDateRange: (d) => set({ filterDateRange: d }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  addTask: (t) => set((state) => ({ tasks: [...state.tasks, t] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  addSprint: (s) => set((state) => ({ sprints: [...state.sprints, s] })),
  updateSprint: (id, updates) =>
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getSprintById: (id) => get().sprints.find((s) => s.id === id),
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
    if (state.filterStatus !== 'all') result = result.filter((t) => t.status === state.filterStatus);
    if (state.filterAssignee !== 'all') result = result.filter((t) => t.assignee === state.filterAssignee);
    if (state.filterProject !== 'all') result = result.filter((t) => t.project === state.filterProject);
    if (state.filterSprint !== 'all') result = result.filter((t) => t.sprint === state.filterSprint);
    if (state.filterPriority !== 'all') result = result.filter((t) => t.priority === state.filterPriority);
    if (state.filterLabel !== 'all') result = result.filter((t) => t.labels.includes(state.filterLabel));
    if (state.filterReporter !== 'all') result = result.filter((t) => t.reporter === state.filterReporter);
    return result;
  },
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getTasksByProject: (projectId) => get().tasks.filter((t) => t.project === projectId),
  getTasksBySprint: (sprintId) => get().tasks.filter((t) => t.sprint === sprintId),
}));
