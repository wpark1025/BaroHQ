import { create } from 'zustand';
import type { Agent, UsageData } from '@/lib/types';

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  usage: UsageData | null;
  priorities: Record<string, string[]>; // teamId -> ordered agent ids

  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent> | Record<string, unknown>) => void;
  selectAgent: (agent: Agent | null) => void;
  setUsage: (usage: UsageData) => void;
  setPriorities: (teamId: string, agentIds: string[]) => void;

  getAgentsByTeam: (teamId: string) => Agent[];
  getAgentById: (id: string) => Agent | undefined;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  selectedAgent: null,
  usage: null,
  priorities: {},

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } as Agent : a
      ),
      selectedAgent:
        state.selectedAgent?.id === id
          ? ({ ...state.selectedAgent, ...updates } as Agent)
          : state.selectedAgent,
    })),

  selectAgent: (agent) => set({ selectedAgent: agent }),

  setUsage: (usage) => set({ usage }),

  setPriorities: (teamId, agentIds) =>
    set((state) => ({
      priorities: { ...state.priorities, [teamId]: agentIds },
    })),

  getAgentsByTeam: (teamId) => get().agents.filter((a) => a.teamId === teamId),

  getAgentById: (id) => get().agents.find((a) => a.id === id),
}));
