import { create } from 'zustand';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
} from '@/lib/types';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    slug: 'platform-v2',
    name: 'Platform V2',
    description: 'Next generation platform rebuild with improved architecture and performance.',
    status: ProjectStatus.Active,
    priority: ProjectPriority.High,
    owner: 'agent-ceo',
    teams: ['team-eng', 'team-design'],
    teamLeads: { 'team-eng': 'agent-1', 'team-design': 'agent-3' },
    goals: ['goal-1'],
    sprints: ['sprint-1', 'sprint-2'],
    budget: 25000,
    timeline: {
      startDate: '2026-01-15',
      endDate: '2026-06-30',
      milestones: [
        { id: 'ms-1', name: 'Alpha Release', date: '2026-03-15', status: 'completed' },
        { id: 'ms-2', name: 'Beta Release', date: '2026-05-01', status: 'in_progress' },
        { id: 'ms-3', name: 'GA Launch', date: '2026-06-30', status: 'pending' },
      ],
    },
    git: { repo: 'barohq/platform-v2', branch: 'main', lastCommit: 'abc123' },
    channels: ['ch-eng-general'],
    tags: ['core', 'high-priority'],
    createdBy: 'agent-ceo',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-28T14:30:00Z',
  },
  {
    id: 'proj-2',
    slug: 'mobile-app',
    name: 'Mobile App',
    description: 'Cross-platform mobile application for iOS and Android.',
    status: ProjectStatus.Planning,
    priority: ProjectPriority.Medium,
    owner: 'agent-2',
    teams: ['team-eng'],
    teamLeads: { 'team-eng': 'agent-2' },
    goals: ['goal-2'],
    sprints: [],
    budget: 15000,
    timeline: {
      startDate: '2026-04-01',
      endDate: '2026-09-30',
      milestones: [
        { id: 'ms-4', name: 'Prototype', date: '2026-05-15', status: 'pending' },
      ],
    },
    git: { repo: 'barohq/mobile-app', branch: 'main', lastCommit: '' },
    channels: [],
    tags: ['mobile', 'new'],
    createdBy: 'agent-2',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-03-25T11:00:00Z',
  },
  {
    id: 'proj-3',
    slug: 'design-system',
    name: 'Design System',
    description: 'Unified component library and design tokens for all products.',
    status: ProjectStatus.Active,
    priority: ProjectPriority.High,
    owner: 'agent-3',
    teams: ['team-design', 'team-eng'],
    teamLeads: { 'team-design': 'agent-3' },
    goals: [],
    sprints: ['sprint-3'],
    budget: 8000,
    timeline: {
      startDate: '2026-02-01',
      endDate: '2026-05-30',
      milestones: [
        { id: 'ms-5', name: 'Tokens v1', date: '2026-03-01', status: 'completed' },
        { id: 'ms-6', name: 'Components v1', date: '2026-04-15', status: 'in_progress' },
      ],
    },
    git: { repo: 'barohq/design-system', branch: 'main', lastCommit: 'def456' },
    channels: ['ch-design'],
    tags: ['design', 'infrastructure'],
    createdBy: 'agent-3',
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-03-30T16:00:00Z',
  },
  {
    id: 'proj-4',
    slug: 'security-audit',
    name: 'Security Audit',
    description: 'Comprehensive security review and penetration testing.',
    status: ProjectStatus.Completed,
    priority: ProjectPriority.Critical,
    owner: 'agent-4',
    teams: ['team-eng'],
    teamLeads: { 'team-eng': 'agent-4' },
    goals: [],
    sprints: [],
    budget: 5000,
    timeline: {
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      milestones: [
        { id: 'ms-7', name: 'Audit Complete', date: '2026-02-28', status: 'completed' },
      ],
    },
    git: { repo: 'barohq/security-audit', branch: 'main', lastCommit: 'ghi789' },
    channels: [],
    tags: ['security'],
    createdBy: 'agent-4',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-02-28T18:00:00Z',
  },
];

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  filterStatus: ProjectStatus | 'all';
  filterTeam: string;
  filterPriority: ProjectPriority | 'all';
  filterTag: string;
  sortBy: 'name' | 'priority' | 'status' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  setSelectedProject: (id: string | null) => void;
  setFilterStatus: (s: ProjectStatus | 'all') => void;
  setFilterTeam: (t: string) => void;
  setFilterPriority: (p: ProjectPriority | 'all') => void;
  setFilterTag: (t: string) => void;
  setSortBy: (s: 'name' | 'priority' | 'status' | 'updatedAt') => void;
  setSortOrder: (o: 'asc' | 'desc') => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProjectById: (id: string) => Project | undefined;
  getFilteredProjects: () => Project[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: MOCK_PROJECTS,
  selectedProjectId: null,
  filterStatus: 'all',
  filterTeam: 'all',
  filterPriority: 'all',
  filterTag: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  setSelectedProject: (id) => set({ selectedProjectId: id }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterTeam: (t) => set({ filterTeam: t }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterTag: (t) => set({ filterTag: t }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortOrder: (o) => set({ sortOrder: o }),
  addProject: (p) => set((state) => ({ projects: [...state.projects, p] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getFilteredProjects: () => {
    const { projects, filterStatus, filterTeam, filterPriority, filterTag, sortBy, sortOrder } = get();
    let result = [...projects];
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterTeam !== 'all') result = result.filter((p) => p.teams.includes(filterTeam));
    if (filterPriority !== 'all') result = result.filter((p) => p.priority === filterPriority);
    if (filterTag !== 'all') result = result.filter((p) => p.tags.includes(filterTag));
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      else cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  },
}));
