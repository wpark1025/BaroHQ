import { create } from 'zustand';
import { AuditEntry, RunRecord } from '@/lib/types';

interface AuditStore {
  entries: AuditEntry[];
  runs: RunRecord[];
  searchQuery: string;
  filterAction: string;
  filterActor: string;
  selectedRunId: string | null;
  setSearchQuery: (q: string) => void;
  setFilterAction: (a: string) => void;
  setFilterActor: (a: string) => void;
  setSelectedRun: (id: string | null) => void;
  getFilteredEntries: () => AuditEntry[];
  getRunById: (id: string) => RunRecord | undefined;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  entries: [],
  runs: [],
  searchQuery: '',
  filterAction: 'all',
  filterActor: 'all',
  selectedRunId: null,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterAction: (a) => set({ filterAction: a }),
  setFilterActor: (a) => set({ filterActor: a }),
  setSelectedRun: (id) => set({ selectedRunId: id }),
  getFilteredEntries: () => {
    const { entries, searchQuery, filterAction, filterActor } = get();
    let result = [...entries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q)
      );
    }
    if (filterAction !== 'all') result = result.filter((e) => e.action.startsWith(filterAction));
    if (filterActor !== 'all') result = result.filter((e) => e.actor === filterActor);
    return result;
  },
  getRunById: (id) => get().runs.find((r) => r.id === id),
}));
