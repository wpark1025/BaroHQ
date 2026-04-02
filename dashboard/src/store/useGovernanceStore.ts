import { create } from 'zustand';
import type { GovernanceRule } from '@/lib/types';

interface GovernanceStore {
  rules: GovernanceRule[];
  selectedRule: GovernanceRule | null;

  setRules: (rules: GovernanceRule[]) => void;
  addRule: (rule: GovernanceRule) => void;
  updateRule: (id: string, updates: Partial<GovernanceRule>) => void;
  removeRule: (id: string) => void;
  selectRule: (rule: GovernanceRule | null) => void;
  toggleRule: (id: string) => void;
  rollbackRule: (id: string, version: number) => void;
}

export const useGovernanceStore = create<GovernanceStore>((set, get) => ({
  rules: [],
  selectedRule: null,

  setRules: (rules) => set({ rules }),

  addRule: (rule) =>
    set((state) => ({ rules: [...state.rules, rule] })),

  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      selectedRule:
        state.selectedRule?.id === id
          ? { ...state.selectedRule, ...updates }
          : state.selectedRule,
    })),

  removeRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
      selectedRule:
        state.selectedRule?.id === id ? null : state.selectedRule,
    })),

  selectRule: (rule) => set({ selectedRule: rule }),

  toggleRule: (id) => {
    const rule = get().rules.find((r) => r.id === id);
    if (rule) {
      const newStatus = rule.status === 'active' ? 'inactive' : 'active';
      set((state) => ({
        rules: state.rules.map((r) =>
          r.id === id ? { ...r, status: newStatus as GovernanceRule['status'] } : r
        ),
      }));
    }
  },

  rollbackRule: (id, version) => {
    const rule = get().rules.find((r) => r.id === id);
    if (rule) {
      const historyEntry = rule.history.find((h) => h.version === version);
      if (historyEntry) {
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id
              ? {
                  ...r,
                  content: historyEntry.content,
                  version: historyEntry.version,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      }
    }
  },
}));
