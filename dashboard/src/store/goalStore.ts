import { create } from 'zustand';
import { Goal, GoalStatus } from '@/lib/types';

const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1', title: 'Launch Platform V2 by Q2',
    description: 'Ship the next-generation platform with improved auth, performance, and UX.',
    status: GoalStatus.InProgress, priority: 'critical' as Goal['priority'],
    owner: 'agent-ceo', team: 'team-eng', project: 'proj-1', teams: ['team-eng', 'team-design'],
    linkedTasks: ['task-1', 'task-7'], taskProgress: 45, children: ['goal-1a'],
    comments: [
      { id: 'gc-1', author: 'agent-ceo', text: 'On track for beta. Auth epic is the critical path.', timestamp: '2026-03-20T10:00:00Z', edited: false },
    ],
    progress: 45, createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-03-28T14:00:00Z',
  },
  {
    id: 'goal-1a', title: 'Complete Auth Foundation',
    description: 'Finish OAuth integration, session management, and MFA.',
    status: GoalStatus.InProgress, priority: 'high' as Goal['priority'],
    owner: 'agent-1', team: 'team-eng', project: 'proj-1', teams: ['team-eng'],
    linkedTasks: ['task-1', 'task-2', 'task-3'], taskProgress: 60, children: [],
    comments: [], progress: 60, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-03-28T14:00:00Z',
  },
  {
    id: 'goal-2', title: 'Mobile App Prototype',
    description: 'Build a working prototype for stakeholder review by end of Q2.',
    status: GoalStatus.NotStarted, priority: 'medium' as Goal['priority'],
    owner: 'agent-2', team: 'team-eng', project: 'proj-2', teams: ['team-eng'],
    linkedTasks: [], taskProgress: 0, children: [],
    comments: [], progress: 0, createdAt: '2026-03-20T00:00:00Z', updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 'goal-3', title: 'Design System Adoption',
    description: 'Migrate all products to the unified design system tokens and components.',
    status: GoalStatus.InProgress, priority: 'high' as Goal['priority'],
    owner: 'agent-3', team: 'team-design', project: 'proj-3', teams: ['team-design'],
    linkedTasks: ['task-5', 'task-6'], taskProgress: 50, children: [],
    comments: [], progress: 50, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-03-29T15:00:00Z',
  },
];

interface GoalStore {
  goals: Goal[];
  selectedGoalId: string | null;
  filterProject: string;
  filterTeam: string;
  filterStatus: GoalStatus | 'all';
  setSelectedGoal: (id: string | null) => void;
  setFilterProject: (p: string) => void;
  setFilterTeam: (t: string) => void;
  setFilterStatus: (s: GoalStatus | 'all') => void;
  getGoalById: (id: string) => Goal | undefined;
  getFilteredGoals: () => Goal[];
  getTopLevelGoals: () => Goal[];
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: MOCK_GOALS,
  selectedGoalId: null,
  filterProject: 'all',
  filterTeam: 'all',
  filterStatus: 'all',
  setSelectedGoal: (id) => set({ selectedGoalId: id }),
  setFilterProject: (p) => set({ filterProject: p }),
  setFilterTeam: (t) => set({ filterTeam: t }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  getGoalById: (id) => get().goals.find((g) => g.id === id),
  getFilteredGoals: () => {
    const { goals, filterProject, filterTeam, filterStatus } = get();
    let result = [...goals];
    if (filterProject !== 'all') result = result.filter((g) => g.project === filterProject);
    if (filterTeam !== 'all') result = result.filter((g) => g.teams.includes(filterTeam));
    if (filterStatus !== 'all') result = result.filter((g) => g.status === filterStatus);
    return result;
  },
  getTopLevelGoals: () => {
    const { goals } = get();
    const childIds = goals.flatMap((g) => g.children);
    return goals.filter((g) => !childIds.includes(g.id));
  },
}));
