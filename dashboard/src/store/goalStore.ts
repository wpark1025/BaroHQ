import { create } from 'zustand';
import { Goal, GoalStatus } from '@/lib/types';

interface GoalStore {
  goals: Goal[];
  selectedGoalId: string | null;
  filterProject: string;
  filterTeam: string;
  filterStatus: GoalStatus | 'all';
  setGoals: (goals: Goal[]) => void;
  setSelectedGoal: (id: string | null) => void;
  setFilterProject: (p: string) => void;
  setFilterTeam: (t: string) => void;
  setFilterStatus: (s: GoalStatus | 'all') => void;
  getGoalById: (id: string) => Goal | undefined;
  getFilteredGoals: () => Goal[];
  getTopLevelGoals: () => Goal[];
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  selectedGoalId: null,
  filterProject: 'all',
  filterTeam: 'all',
  filterStatus: 'all',
  setGoals: (goals) => set({ goals }),
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
