import { create } from 'zustand';
import { BudgetInfo } from '@/lib/types';

const EMPTY_BUDGET: BudgetInfo = {
  monthlyLimit: 0,
  spent: 0,
  byProvider: [],
  byTeam: [],
  byProject: [],
  alerts: [],
};

interface BudgetStore {
  budget: BudgetInfo;
  timeline: { date: string; spent: number }[];
  selectedScope: 'company' | 'team' | 'agent' | 'project';
  selectedScopeId: string | null;
  setSelectedScope: (s: 'company' | 'team' | 'agent' | 'project') => void;
  setSelectedScopeId: (id: string | null) => void;
  dismissAlert: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budget: EMPTY_BUDGET,
  timeline: [],
  selectedScope: 'company',
  selectedScopeId: null,
  setSelectedScope: (s) => set({ selectedScope: s }),
  setSelectedScopeId: (id) => set({ selectedScopeId: id }),
  dismissAlert: (id) =>
    set((state) => ({
      budget: { ...state.budget, alerts: state.budget.alerts.filter((a) => a.id !== id) },
    })),
}));
