import { create } from 'zustand';
import { BudgetInfo, BudgetAlert } from '@/lib/types';

const MOCK_BUDGET: BudgetInfo = {
  monthlyLimit: 50000,
  spent: 32450,
  byProvider: [
    { id: 'bp-1', name: 'Claude Code', spent: 18200, limit: 25000 },
    { id: 'bp-2', name: 'Claude API', spent: 8500, limit: 15000 },
    { id: 'bp-3', name: 'Gemini', spent: 5750, limit: 10000 },
  ],
  byTeam: [
    { id: 'bt-1', name: 'Engineering', spent: 22000, limit: 30000 },
    { id: 'bt-2', name: 'Design', spent: 6450, limit: 10000 },
    { id: 'bt-3', name: 'Operations', spent: 4000, limit: 10000 },
  ],
  byProject: [
    { id: 'bpj-1', name: 'Platform V2', spent: 18500, limit: 25000 },
    { id: 'bpj-2', name: 'Design System', spent: 6200, limit: 8000 },
    { id: 'bpj-3', name: 'Mobile App', spent: 2100, limit: 15000 },
    { id: 'bpj-4', name: 'Security Audit', spent: 5650, limit: 5000 },
  ],
  alerts: [
    { id: 'ba-1', type: 'critical', message: 'Security Audit project exceeded budget limit', threshold: 100, current: 113, timestamp: '2026-03-28T14:00:00Z' },
    { id: 'ba-2', type: 'warning', message: 'Design System approaching 80% budget usage', threshold: 80, current: 77.5, timestamp: '2026-03-30T09:00:00Z' },
    { id: 'ba-3', type: 'warning', message: 'Engineering team at 73% of monthly limit', threshold: 75, current: 73.3, timestamp: '2026-03-31T16:00:00Z' },
  ],
};

const MOCK_TIMELINE = [
  { date: '2026-01', spent: 8200 },
  { date: '2026-02', spent: 12400 },
  { date: '2026-03', spent: 32450 },
];

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
  budget: MOCK_BUDGET,
  timeline: MOCK_TIMELINE,
  selectedScope: 'company',
  selectedScopeId: null,
  setSelectedScope: (s) => set({ selectedScope: s }),
  setSelectedScopeId: (id) => set({ selectedScopeId: id }),
  dismissAlert: (id) =>
    set((state) => ({
      budget: { ...state.budget, alerts: state.budget.alerts.filter((a) => a.id !== id) },
    })),
}));
