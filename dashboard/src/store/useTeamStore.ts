import { create } from 'zustand';
import type { Team } from '@/lib/types';

interface TeamStore {
  teams: Team[];
  selectedTeamId: string | null;

  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  setSelectedTeamId: (id: string | null) => void;

  getTeamById: (id: string) => Team | undefined;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  selectedTeamId: null,

  setTeams: (teams) => set({ teams }),

  addTeam: (team) =>
    set((state) => ({ teams: [...state.teams, team] })),

  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      selectedTeamId: state.selectedTeamId === id ? null : state.selectedTeamId,
    })),

  setSelectedTeamId: (id) => set({ selectedTeamId: id }),

  getTeamById: (id) => get().teams.find((t) => t.id === id),
}));
